import { Response } from 'express';
import mongoose from 'mongoose';
import { Booking, Room, Service, YogaSession, User } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { pricingCalculator } from '../utils/pricing';
import { bookingValidator } from '../utils/bookingValidation';
import { emailService } from '../utils/email';

// Helper function to convert userId to ObjectId
const getUserObjectId = (userId: string | undefined): mongoose.Types.ObjectId => {
  if (userId === 'admin_id_123') {
    return new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
  }
  return new mongoose.Types.ObjectId(userId);
};

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      primaryGuestInfo,
      includeFood = true,
      includeBreakfast = false,
      transport,
      selectedServices = [],
      yogaSessionId,
      specialRequests
    } = req.body;

    const userId = req.user?.userId;
    const userObjectId = getUserObjectId(userId);

    // Validate dates
    const dateValidation = bookingValidator.validateBookingDates(new Date(checkIn), new Date(checkOut));
    if (!dateValidation.valid) {
      res.status(400).json({
        success: false,
        message: dateValidation.message
      });
      await session.abortTransaction();
      return;
    }

    // Validate room exists and is available
    const room = await Room.findById(roomId).session(session);
    if (!room || !room.isAvailable) {
      res.status(400).json({
        success: false,
        message: 'Room not found or not available'
      });
      await session.abortTransaction();
      return;
    }

    // Validate guests
    const guestValidation = bookingValidator.validateGuests(guests, room.capacity);
    if (!guestValidation.valid) {
      res.status(400).json({
        success: false,
        message: guestValidation.message
      });
      await session.abortTransaction();
      return;
    }

    // Check for date overlap
    const overlapCheck = await bookingValidator.checkDateOverlap(
      roomId,
      new Date(checkIn),
      new Date(checkOut)
    );

    if (overlapCheck.hasOverlap) {
      res.status(400).json({
        success: false,
        message: 'Room is already booked for the selected dates',
        conflictingBookings: overlapCheck.conflictingBookings
      });
      await session.abortTransaction();
      return;
    }

    // Validate and calculate service prices
    let calculatedServices = [];
    let servicesPrice = 0;

    if (selectedServices.length > 0) {
      for (const serviceSelection of selectedServices) {
        const service = await Service.findById(serviceSelection.serviceId).session(session);
        if (!service || !service.isActive) {
          res.status(400).json({
            success: false,
            message: `Service not found or not active: ${serviceSelection.serviceId}`
          });
          await session.abortTransaction();
          return;
        }

        // Validate age restrictions
        const ageValidation = pricingCalculator.validateServiceAge(service, guests);
        if (!ageValidation.valid) {
          res.status(400).json({
            success: false,
            message: ageValidation.message
          });
          await session.abortTransaction();
          return;
        }

        // Calculate service price
        const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
        const calculatedPrice = pricingCalculator.calculateServicePrice(
          service,
          serviceSelection.quantity,
          guests,
          nights
        );

        calculatedServices.push({
          serviceId: service._id as mongoose.Types.ObjectId,
          quantity: serviceSelection.quantity,
          totalPrice: calculatedPrice,
          details: serviceSelection.details
        });

        servicesPrice += calculatedPrice;
      }
    }

    // Validate yoga session if selected
    let yogaPrice = 0;
    if (yogaSessionId) {
      const yogaValidation = await bookingValidator.validateYogaSessionAvailability(
        yogaSessionId,
        guests.length
      );
      if (!yogaValidation.valid) {
        res.status(400).json({
          success: false,
          message: yogaValidation.message
        });
        await session.abortTransaction();
        return;
      }

      const yogaSession = await YogaSession.findById(yogaSessionId).session(session);
      yogaPrice = yogaSession!.price;
    }

    // Calculate transport price
    let transportPrice = 0;
    if (transport) {
      transportPrice = pricingCalculator.calculateTransportPrice(
        transport.pickup,
        transport.drop
      );
    }

    // Get breakfast price from service if selected
    let breakfastPrice = 0;
    if (includeBreakfast) {
      const breakfastService = await Service.findOne({ 
        category: 'food', 
        subcategory: 'breakfast',
        isActive: true 
      }).session(session);
      breakfastPrice = breakfastService?.price || 200; // fallback price
    }

    // Calculate total pricing
    const pricing = pricingCalculator.calculateBookingPrice(
      room.pricePerNight,
      new Date(checkIn),
      new Date(checkOut),
      guests,
      includeFood,
      includeBreakfast,
      breakfastPrice,
      calculatedServices,
      transportPrice,
      yogaPrice
    );

    // Create booking
    const booking = new Booking({
      userId: userObjectId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      primaryGuestInfo,
      totalGuests: guests.length,
      adults: guests.filter((g: any) => !g.isChild).length,
      children: guests.filter((g: any) => g.isChild).length,
      includeFood,
      includeBreakfast,
      transport,
      selectedServices: calculatedServices,
      yogaSessionId: yogaSessionId || undefined,
      ...pricing,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save({ session });

    // Update yoga session booked seats if applicable
    if (yogaSessionId) {
      await YogaSession.findByIdAndUpdate(
        yogaSessionId,
        { $inc: { bookedSeats: guests.length } },
        { session }
      );
    }

    await session.commitTransaction();

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .populate('selectedServices.serviceId', 'name category price')
      .populate('yogaSessionId', 'type batchName startDate endDate');

    // Send booking confirmation email
    try {
      const user = await User.findById(userId);
      if (user) {
        await emailService.sendBookingConfirmation(populatedBooking, user);
      }
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populatedBooking
      }
    });

  } catch (error: any) {
    await session.abortTransaction();
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  } finally {
    await session.endSession();
  }
};

export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status, page = 1, limit = 10 } = req.query;
    const userObjectId = getUserObjectId(userId);

    const query: any = { userId: userObjectId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(query)
      .populate('roomId', 'roomNumber roomType pricePerNight amenities')
      .populate('selectedServices.serviceId', 'name category price')
      .populate('yogaSessionId', 'type batchName startDate endDate instructor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get bookings'
    });
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const query: any = { _id: id };
    
    // Non-admin users can only see their own bookings
    if (userRole !== 'admin') {
      query.userId = getUserObjectId(userId);
    }

    const booking = await Booking.findOne(query)
      .populate('userId', 'name email phone')
      .populate('roomId', 'roomNumber roomType pricePerNight amenities description images')
      .populate('selectedServices.serviceId', 'name category price description')
      .populate('yogaSessionId', 'type batchName startDate endDate instructor schedule description');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get booking'
    });
  }
};

export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const query: any = { _id: id };
    
    // Non-admin users can only cancel their own bookings
    if (userRole !== 'admin') {
      query.userId = getUserObjectId(userId);
    }

    const booking = await Booking.findOne(query).session(session);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      await session.abortTransaction();
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
      await session.abortTransaction();
      return;
    }

    if (booking.status === 'checked_in' || booking.status === 'checked_out') {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel booking after check-in'
      });
      await session.abortTransaction();
      return;
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });

    // Release yoga session seats if applicable
    if (booking.yogaSessionId) {
      await YogaSession.findByIdAndUpdate(
        booking.yogaSessionId,
        { $inc: { bookedSeats: -booking.guests.length } },
        { session }
      );
    }

    await session.commitTransaction();

    // Send cancellation email
    try {
      const user = await User.findById(booking.userId);
      if (user) {
        await emailService.sendBookingCancellation(booking, user);
      }
    } catch (emailError) {
      console.error('Failed to send booking cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking
      }
    });

  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking'
    });
  } finally {
    await session.endSession();
  }
};