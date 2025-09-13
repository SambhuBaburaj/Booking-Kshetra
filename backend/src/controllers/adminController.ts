import { Response } from 'express';
import mongoose from 'mongoose';
import { Booking, Room, Service, YogaSession, User, Payment } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadMultipleImages, deleteImageFromCloudinary } from '../utils/imageUpload';

// Dashboard Stats
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // Basic counts
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRooms = await Room.countDocuments();
    const totalServices = await Service.countDocuments({ isActive: true });

    // Revenue stats
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid', 
          createdAt: { $gte: startOfMonth } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Booking stats
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('roomId', 'roomNumber roomType')
      .sort({ createdAt: -1 })
      .limit(10);

    // Room occupancy
    const currentDate = new Date();
    const occupiedRooms = await Booking.countDocuments({
      status: { $in: ['confirmed', 'checked_in'] },
      checkIn: { $lte: currentDate },
      checkOut: { $gte: currentDate }
    });

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          totalUsers,
          totalRooms,
          totalServices,
          occupancyRate: Math.round(occupancyRate * 100) / 100
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          monthly: monthlyRevenue[0]?.total || 0
        },
        bookings: {
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings
        },
        recentBookings,
        occupiedRooms
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard stats'
    });
  }
};

// Room Management
export const getAllRooms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, roomType, isAvailable } = req.query;
    
    const query: any = {};
    if (roomType) query.roomType = roomType;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    
    const rooms = await Room.find(query)
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Room.countDocuments(query);

    res.json({
      success: true,
      data: {
        rooms,
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
      message: error.message || 'Failed to get rooms'
    });
  }
};

export const createRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const roomData = req.body;
    const files = req.files as Express.Multer.File[];
    
    // Upload images if provided
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await uploadMultipleImages(files, 'resort-rooms');
    }
    
    const room = new Room({
      ...roomData,
      images: imageUrls
    });
    
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Room number already exists'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create room'
    });
  }
};

export const updateRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const files = req.files as Express.Multer.File[];

    const existingRoom = await Room.findById(id);
    if (!existingRoom) {
      res.status(404).json({
        success: false,
        message: 'Room not found'
      });
      return;
    }

    // Upload new images if provided
    let newImageUrls: string[] = [];
    if (files && files.length > 0) {
      newImageUrls = await uploadMultipleImages(files, 'resort-rooms');
    }

    // If replacing images, delete old ones
    if (updateData.replaceImages === 'true' && existingRoom.images.length > 0) {
      for (const imageUrl of existingRoom.images) {
        await deleteImageFromCloudinary(imageUrl);
      }
      updateData.images = newImageUrls;
    } else if (newImageUrls.length > 0) {
      // Append new images to existing ones
      updateData.images = [...existingRoom.images, ...newImageUrls];
    }

    // Remove replaceImages field from update data
    delete updateData.replaceImages;

    const room = await Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update room'
    });
  }
};

export const deleteRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if room has active bookings
    const activeBookings = await Booking.countDocuments({
      roomId: id,
      status: { $in: ['pending', 'confirmed', 'checked_in'] }
    });

    if (activeBookings > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete room with active bookings'
      });
      return;
    }

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete room'
    });
  }
};

// Service Management
export const getAllServices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, isActive } = req.query;
    
    const query: any = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const services = await Service.find(query).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get services'
    });
  }
};

export const createService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const serviceData = req.body;
    
    const service = new Service(serviceData);
    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create service'
    });
  }
};

export const updateService = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const service = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update service'
    });
  }
};

// Booking Management
export const getAllBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    let bookingsQuery = Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .populate('selectedServices.serviceId', 'name category')
      .populate('yogaSessionId', 'type batchName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      // This is a simplified search - in production, you'd want to use text indexing
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query.$or = [
        { userId: { $in: userIds } },
        { _id: { $regex: searchRegex } }
      ];
      
      bookingsQuery = Booking.find(query)
        .populate('userId', 'name email phone')
        .populate('roomId', 'roomNumber roomType pricePerNight')
        .populate('selectedServices.serviceId', 'name category')
        .populate('yogaSessionId', 'type batchName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }

    const bookings = await bookingsQuery;
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

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        status, 
        ...(notes && { notes }) 
      },
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email phone')
    .populate('roomId', 'roomNumber roomType');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update booking status'
    });
  }
};

// User Management
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const query: any = {};
    if (role) query.role = role;
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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
      message: error.message || 'Failed to get users'
    });
  }
};

// Room Availability Management
export const getRoomAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, roomType, capacity } = req.query;
    
    if (!checkIn || !checkOut) {
      res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
      return;
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (checkInDate >= checkOutDate) {
      res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
      return;
    }

    // Find rooms that are booked during the requested period
    const bookedRooms = await Booking.find({
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    }).select('roomId');

    const bookedRoomIds = bookedRooms.map(booking => booking.roomId);

    // Build room query
    const roomQuery: any = {
      isAvailable: true,
      _id: { $nin: bookedRoomIds }
    };

    if (roomType) roomQuery.roomType = roomType;
    // For capacity filtering, find rooms that can accommodate the requested number of guests
    if (capacity) {
      roomQuery.capacity = { $gte: Number(capacity) }; // Show rooms that can accommodate the guests
    }

    const availableRooms = await Room.find(roomQuery).sort({ roomType: 1, pricePerNight: 1 });

    res.json({
      success: true,
      data: {
        availableRooms,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAvailable: availableRooms.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get room availability'
    });
  }
};

export const bulkUpdateRoomAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { roomIds, isAvailable } = req.body;

    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Room IDs array is required'
      });
      return;
    }

    const result = await Room.updateMany(
      { _id: { $in: roomIds } },
      { isAvailable: Boolean(isAvailable) }
    );

    res.json({
      success: true,
      message: `Updated availability for ${result.modifiedCount} rooms`,
      data: { 
        matched: result.matchedCount,
        modified: result.modifiedCount 
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update room availability'
    });
  }
};

// Enhanced room stats
export const getRoomStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });
    const acRooms = await Room.countDocuments({ roomType: 'AC' });
    const nonAcRooms = await Room.countDocuments({ roomType: 'Non-AC' });
    
    // Current occupancy
    const currentDate = new Date();
    const occupiedRooms = await Booking.countDocuments({
      status: { $in: ['confirmed', 'checked_in'] },
      checkIn: { $lte: currentDate },
      checkOut: { $gte: currentDate }
    });

    // Room type distribution
    const roomsByType = await Room.aggregate([
      {
        $group: {
          _id: '$roomType',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerNight' },
          minPrice: { $min: '$pricePerNight' },
          maxPrice: { $max: '$pricePerNight' }
        }
      }
    ]);

    // Capacity distribution
    const roomsByCapacity = await Room.aggregate([
      {
        $group: {
          _id: '$capacity',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalRooms,
          availableRooms,
          occupiedRooms,
          occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100 * 100) / 100 : 0
        },
        typeDistribution: {
          ac: acRooms,
          nonAc: nonAcRooms
        },
        roomsByType,
        roomsByCapacity
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get room statistics'
    });
  }
};