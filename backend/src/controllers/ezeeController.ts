import { Request, Response } from 'express';
import EZeePMSService from '../services/ezeePmsService';
import { getEzeeConfig, validateEzeeConfig } from '../config/ezeeConfig';
import Booking from '../models/Booking';
import Room from '../models/Room';

class EZeeController {
  private ezeeService: EZeePMSService;

  constructor() {
    const config = getEzeeConfig();
    if (validateEzeeConfig(config)) {
      this.ezeeService = new EZeePMSService(config);
    } else {
      console.warn('eZee PMS configuration is incomplete. Some features may not work.');
    }
  }

  // Authentication & Configuration
  testConnection = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const isAuthenticated = await this.ezeeService.authenticateHotel();

      if (isAuthenticated) {
        const hotelInfo = await this.ezeeService.getHotelInfo();
        res.json({
          success: true,
          message: 'Successfully connected to eZee PMS',
          data: { hotelInfo }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Authentication failed with eZee PMS'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to connect to eZee PMS',
        error: error.message
      });
    }
  };

  // Room Management
  syncAllRooms = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const localRooms = await Room.find();
      const syncResults = [];

      for (const room of localRooms) {
        try {
          const ezeeRoom = await this.ezeeService.syncRoomFromLocal(room);
          syncResults.push({
            localRoomId: room._id,
            ezeeRoomTypeId: ezeeRoom.room_type_id,
            status: 'synced'
          });
        } catch (error: any) {
          syncResults.push({
            localRoomId: room._id,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Room synchronization completed',
        data: { syncResults }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to sync rooms',
        error: error.message
      });
    }
  };

  getRoomTypes = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const roomTypes = await this.ezeeService.getRoomTypes();

      res.json({
        success: true,
        data: { roomTypes }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch room types from eZee PMS',
        error: error.message
      });
    }
  };

  updateRoomInventory = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { inventoryUpdates } = req.body;

      if (!inventoryUpdates || !Array.isArray(inventoryUpdates)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid inventory updates data'
        });
      }

      const success = await this.ezeeService.updateRoomInventory(inventoryUpdates);

      res.json({
        success,
        message: success ? 'Inventory updated successfully' : 'Failed to update inventory'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update room inventory',
        error: error.message
      });
    }
  };

  updateRoomRates = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { roomTypeId, startDate, endDate, rate } = req.body;

      if (!roomTypeId || !startDate || !endDate || !rate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: roomTypeId, startDate, endDate, rate'
        });
      }

      const success = await this.ezeeService.updateLinearRates(roomTypeId, startDate, endDate, rate);

      res.json({
        success,
        message: success ? 'Rates updated successfully' : 'Failed to update rates'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update room rates',
        error: error.message
      });
    }
  };

  // Booking Management
  syncAllBookings = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const localBookings = await Booking.find({
        checkIn: { $gte: new Date(startDate as string) },
        checkOut: { $lte: new Date(endDate as string) }
      }).populate('roomId');

      const syncResults = [];

      for (const booking of localBookings) {
        try {
          const ezeeBooking = await this.ezeeService.syncBookingFromLocal(booking);
          syncResults.push({
            localBookingId: booking._id,
            ezeeBookingId: ezeeBooking.booking_id,
            status: 'synced'
          });
        } catch (error: any) {
          syncResults.push({
            localBookingId: booking._id,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Booking synchronization completed',
        data: { syncResults }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to sync bookings',
        error: error.message
      });
    }
  };

  getEzeeBookings = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { startDate, endDate, status } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const bookings = await this.ezeeService.getBookings(
        startDate as string,
        endDate as string,
        status as string
      );

      res.json({
        success: true,
        data: { bookings }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings from eZee PMS',
        error: error.message
      });
    }
  };

  checkInGuest = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { bookingId } = req.params;
      const { checkInTime } = req.body;

      const success = await this.ezeeService.checkInGuest(bookingId, checkInTime);

      if (success) {
        // Update local booking status
        await Booking.findByIdAndUpdate(bookingId, {
          status: 'checked_in'
        });
      }

      res.json({
        success,
        message: success ? 'Guest checked in successfully' : 'Failed to check in guest'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to check in guest',
        error: error.message
      });
    }
  };

  checkOutGuest = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { bookingId } = req.params;
      const { checkOutTime } = req.body;

      const success = await this.ezeeService.checkOutGuest(bookingId, checkOutTime);

      if (success) {
        // Update local booking status
        await Booking.findByIdAndUpdate(bookingId, {
          status: 'checked_out'
        });
      }

      res.json({
        success,
        message: success ? 'Guest checked out successfully' : 'Failed to check out guest'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to check out guest',
        error: error.message
      });
    }
  };

  // Payment Management
  getPaymentGateways = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const gateways = await this.ezeeService.getPaymentGateways();

      res.json({
        success: true,
        data: { gateways }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment gateways',
        error: error.message
      });
    }
  };

  processPayment = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { bookingId, amount, paymentMethod, gatewayId, transactionId } = req.body;

      if (!bookingId || !amount || !paymentMethod || !gatewayId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required payment fields'
        });
      }

      const paymentResult = await this.ezeeService.processPayment({
        booking_id: bookingId,
        amount,
        payment_method: paymentMethod,
        gateway_id: gatewayId,
        transaction_id: transactionId
      });

      // Update local booking payment status
      if (paymentResult.status === 'success') {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'paid',
          paymentId: paymentResult.payment_id
        });
      }

      res.json({
        success: true,
        data: { paymentResult }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to process payment',
        error: error.message
      });
    }
  };

  // Reports
  getAvailabilityReport = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const report = await this.ezeeService.getAvailabilityReport(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: { report }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch availability report',
        error: error.message
      });
    }
  };

  getRevenueReport = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { startDate, endDate, groupBy } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const report = await this.ezeeService.getRevenueReport(
        startDate as string,
        endDate as string,
        groupBy as 'day' | 'month'
      );

      res.json({
        success: true,
        data: { report }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revenue report',
        error: error.message
      });
    }
  };

  getOccupancyReport = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const report = await this.ezeeService.getOccupancyReport(
        startDate as string,
        endDate as string
      );

      res.json({
        success: true,
        data: { report }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch occupancy report',
        error: error.message
      });
    }
  };

  // Guest Management
  getGuests = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { search } = req.query;
      const guests = await this.ezeeService.getGuests(search as string);

      res.json({
        success: true,
        data: { guests }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch guests',
        error: error.message
      });
    }
  };

  createGuest = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const guestData = req.body;
      const guest = await this.ezeeService.createGuest(guestData);

      res.json({
        success: true,
        data: { guest },
        message: 'Guest created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to create guest',
        error: error.message
      });
    }
  };

  // Currency Management
  getCurrencies = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const currencies = await this.ezeeService.getCurrencies();

      res.json({
        success: true,
        data: { currencies }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch currencies',
        error: error.message
      });
    }
  };

  updateExchangeRates = async (req: Request, res: Response) => {
    try {
      if (!this.ezeeService) {
        return res.status(400).json({
          success: false,
          message: 'eZee PMS not configured'
        });
      }

      const { exchangeRates } = req.body;

      if (!exchangeRates || !Array.isArray(exchangeRates)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exchange rates data'
        });
      }

      const success = await this.ezeeService.updateExchangeRates(exchangeRates);

      res.json({
        success,
        message: success ? 'Exchange rates updated successfully' : 'Failed to update exchange rates'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update exchange rates',
        error: error.message
      });
    }
  };
}

export default EZeeController;