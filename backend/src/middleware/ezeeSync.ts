import { Request, Response, NextFunction } from 'express';
import EZeePMSService from '../services/ezeePmsService';
import RoomSyncService from '../services/roomSyncService';
import { getEzeeConfig, validateEzeeConfig } from '../config/ezeeConfig';
import Booking from '../models/Booking';
import Room from '../models/Room';

export interface EZeeSyncOptions {
  syncBookings?: boolean;
  syncRooms?: boolean;
  syncPayments?: boolean;
  realTimeSync?: boolean;
  batchSync?: boolean;
}

class EZeeSyncMiddleware {
  private ezeeService: EZeePMSService | null = null;
  private roomSyncService: RoomSyncService | null = null;

  constructor() {
    try {
      const config = getEzeeConfig();
      if (validateEzeeConfig(config)) {
        this.ezeeService = new EZeePMSService(config);
        this.roomSyncService = new RoomSyncService();
      }
    } catch (error) {
      console.warn('eZee PMS middleware: Configuration incomplete, sync features disabled');
    }
  }

  // Middleware to sync booking status after creation/update
  syncBookingAfterOperation = (options: EZeeSyncOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ezeeService || !options.syncBookings) {
        return next();
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to capture response
      res.json = function(data: any) {
        // Call original json method
        const result = originalJson.call(this, data);

        // Perform sync after response is sent
        if (data.success && data.data?.booking) {
          setImmediate(async () => {
            try {
              const booking = await Booking.findById(data.data.booking._id || data.data.booking.id);
              if (booking) {
                await ezeeService.syncBookingFromLocal(booking);
                console.log(`Booking ${booking._id} synced to eZee PMS`);
              }
            } catch (error) {
              console.error('Failed to sync booking to eZee PMS:', error);
            }
          });
        }

        return result;
      };

      next();
    };
  };

  // Middleware to sync room inventory after room operations
  syncRoomAfterOperation = (options: EZeeSyncOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.roomSyncService || !options.syncRooms) {
        return next();
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to capture response
      res.json = function(data: any) {
        // Call original json method
        const result = originalJson.call(this, data);

        // Perform sync after response is sent
        if (data.success && (data.data?.room || data.data?.rooms)) {
          setImmediate(async () => {
            try {
              const today = new Date();
              await roomSyncService!.syncRoomInventory(today);
              console.log('Room inventory synced to eZee PMS');
            } catch (error) {
              console.error('Failed to sync room inventory to eZee PMS:', error);
            }
          });
        }

        return result;
      };

      next();
    };
  };

  // Middleware to validate eZee PMS connection
  validateEzeeConnection = async (req: Request, res: Response, next: NextFunction) => {
    if (!this.ezeeService) {
      return res.status(503).json({
        success: false,
        message: 'eZee PMS service is not available'
      });
    }

    try {
      const isConnected = await this.ezeeService.authenticateHotel();
      if (!isConnected) {
        return res.status(503).json({
          success: false,
          message: 'Unable to connect to eZee PMS'
        });
      }
      next();
    } catch (error: any) {
      return res.status(503).json({
        success: false,
        message: 'eZee PMS connection error',
        error: error.message
      });
    }
  };

  // Middleware to sync payment status
  syncPaymentStatus = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ezeeService) {
        return next();
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to capture response
      res.json = function(data: any) {
        // Call original json method
        const result = originalJson.call(this, data);

        // Perform sync after response is sent
        if (data.success && data.data?.payment) {
          setImmediate(async () => {
            try {
              const booking = await Booking.findById(data.data.payment.bookingId);
              if (booking) {
                const ezeeStatus = booking.paymentStatus === 'paid' ? 'confirmed' : 'pending';
                await ezeeService!.updateBookingStatus(booking._id.toString(), ezeeStatus);
                console.log(`Payment status synced to eZee PMS for booking ${booking._id}`);
              }
            } catch (error) {
              console.error('Failed to sync payment status to eZee PMS:', error);
            }
          });
        }

        return result;
      };

      next();
    };
  };

  // Real-time sync middleware for immediate synchronization
  realTimeSync = (options: EZeeSyncOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ezeeService || !options.realTimeSync) {
        return next();
      }

      // Add sync metadata to request
      req.ezeeSync = {
        enabled: true,
        options: options,
        timestamp: new Date()
      };

      next();
    };
  };

  // Batch sync middleware for scheduled operations
  batchSync = (options: EZeeSyncOptions = {}) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ezeeService || !options.batchSync) {
        return next();
      }

      // Add to batch sync queue
      const syncData = {
        operation: req.method,
        path: req.path,
        data: req.body,
        timestamp: new Date(),
        options: options
      };

      // Add to sync queue (in a real implementation, this would use a queue service)
      this.addToBatchQueue(syncData);

      next();
    };
  };

  // Error handling middleware for sync failures
  handleSyncErrors = () => {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      if (error.isEzeeError) {
        console.error('eZee PMS sync error:', error);

        // Log sync failure but don't fail the main operation
        return res.status(207).json({
          success: true,
          message: 'Operation completed with sync warnings',
          data: req.operationResult || {},
          warnings: [{
            type: 'sync_error',
            message: 'Failed to sync with eZee PMS',
            details: error.message
          }]
        });
      }

      next(error);
    };
  };

  // Sync status checker middleware
  checkSyncStatus = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ezeeService) {
        req.syncStatus = { available: false, reason: 'Service not configured' };
        return next();
      }

      try {
        const isConnected = await this.ezeeService.authenticateHotel();
        req.syncStatus = {
          available: isConnected,
          lastCheck: new Date(),
          reason: isConnected ? 'Connected' : 'Authentication failed'
        };
      } catch (error: any) {
        req.syncStatus = {
          available: false,
          lastCheck: new Date(),
          reason: error.message
        };
      }

      next();
    };
  };

  // Sync configuration middleware
  configurableSync = (defaultOptions: EZeeSyncOptions = {}) => {
    return (req: Request, res: Response, next: NextFunction) => {
      // Allow override of sync options via headers or query params
      const syncOptions: EZeeSyncOptions = {
        ...defaultOptions,
        syncBookings: req.headers['x-sync-bookings'] === 'true' || defaultOptions.syncBookings,
        syncRooms: req.headers['x-sync-rooms'] === 'true' || defaultOptions.syncRooms,
        syncPayments: req.headers['x-sync-payments'] === 'true' || defaultOptions.syncPayments,
        realTimeSync: req.headers['x-realtime-sync'] === 'true' || defaultOptions.realTimeSync,
        batchSync: req.headers['x-batch-sync'] === 'true' || defaultOptions.batchSync
      };

      req.ezeeSync = {
        enabled: true,
        options: syncOptions,
        timestamp: new Date()
      };

      next();
    };
  };

  private addToBatchQueue(syncData: any): void {
    // In a real implementation, this would add to a proper queue service
    // For now, we'll just log it
    console.log('Added to batch sync queue:', syncData);

    // Simulate batch processing (in reality, this would be handled by a background job)
    setTimeout(async () => {
      try {
        await this.processBatchSyncItem(syncData);
      } catch (error) {
        console.error('Batch sync failed:', error);
      }
    }, 5000); // 5 second delay
  }

  private async processBatchSyncItem(syncData: any): Promise<void> {
    if (!this.ezeeService) return;

    try {
      switch (syncData.operation) {
        case 'POST':
          if (syncData.path.includes('/bookings')) {
            // Handle booking sync
            const booking = await Booking.findById(syncData.data.bookingId);
            if (booking) {
              await this.ezeeService.syncBookingFromLocal(booking);
            }
          }
          break;

        case 'PUT':
        case 'PATCH':
          if (syncData.path.includes('/rooms')) {
            // Handle room sync
            await this.roomSyncService?.performDailySync();
          }
          break;

        default:
          console.log('No sync handler for operation:', syncData.operation);
      }
    } catch (error) {
      console.error('Error processing batch sync item:', error);
    }
  }

  // Scheduled sync middleware (for cron jobs)
  scheduledSync = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.ezeeService || !this.roomSyncService) {
        return res.status(503).json({
          success: false,
          message: 'Sync services not available'
        });
      }

      try {
        // Perform scheduled synchronization
        await this.roomSyncService.performDailySync();

        // Sync recent bookings
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const recentBookings = await Booking.find({
          updatedAt: { $gte: yesterday },
          status: { $ne: 'cancelled' }
        });

        for (const booking of recentBookings) {
          try {
            await this.ezeeService.syncBookingFromLocal(booking);
          } catch (error) {
            console.error(`Failed to sync booking ${booking._id}:`, error);
          }
        }

        res.json({
          success: true,
          message: 'Scheduled sync completed',
          data: {
            syncedBookings: recentBookings.length,
            timestamp: new Date()
          }
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: 'Scheduled sync failed',
          error: error.message
        });
      }
    };
  };
}

// Create and export middleware instance
const ezeeSync = new EZeeSyncMiddleware();

export const {
  syncBookingAfterOperation,
  syncRoomAfterOperation,
  validateEzeeConnection,
  syncPaymentStatus,
  realTimeSync,
  batchSync,
  handleSyncErrors,
  checkSyncStatus,
  configurableSync,
  scheduledSync
} = ezeeSync;

export default ezeeSync;

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      ezeeSync?: {
        enabled: boolean;
        options: EZeeSyncOptions;
        timestamp: Date;
      };
      syncStatus?: {
        available: boolean;
        lastCheck?: Date;
        reason: string;
      };
      operationResult?: any;
    }
  }
}