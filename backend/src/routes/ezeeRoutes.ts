import express from 'express';
import EZeeController from '../controllers/ezeeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query, param } from 'express-validator';

const router = express.Router();
const ezeeController = new EZeeController();

// Authentication & Configuration Routes
router.get('/test-connection',
  authenticateToken,
  authorizeRoles(['admin']),
  ezeeController.testConnection
);

// Room Management Routes
router.post('/rooms/sync',
  authenticateToken,
  authorizeRoles(['admin']),
  ezeeController.syncAllRooms
);

router.get('/rooms/types',
  authenticateToken,
  authorizeRoles(['admin']),
  ezeeController.getRoomTypes
);

router.post('/rooms/inventory/update',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('inventoryUpdates').isArray().notEmpty(),
    body('inventoryUpdates.*.room_type_id').isString().notEmpty(),
    body('inventoryUpdates.*.date').isISO8601(),
    body('inventoryUpdates.*.available_rooms').isInt({ min: 0 }),
    body('inventoryUpdates.*.rate').isFloat({ min: 0 }),
    validateRequest
  ],
  ezeeController.updateRoomInventory
);

router.post('/rooms/rates/update',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('roomTypeId').isString().notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('rate').isFloat({ min: 0 }),
    validateRequest
  ],
  ezeeController.updateRoomRates
);

// Booking Management Routes
router.post('/bookings/sync',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    validateRequest
  ],
  ezeeController.syncAllBookings
);

router.get('/bookings',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('status').optional().isString(),
    validateRequest
  ],
  ezeeController.getEzeeBookings
);

router.post('/bookings/:bookingId/check-in',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    param('bookingId').isMongoId(),
    body('checkInTime').optional().isISO8601(),
    validateRequest
  ],
  ezeeController.checkInGuest
);

router.post('/bookings/:bookingId/check-out',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    param('bookingId').isMongoId(),
    body('checkOutTime').optional().isISO8601(),
    validateRequest
  ],
  ezeeController.checkOutGuest
);

// Payment Management Routes
router.get('/payments/gateways',
  authenticateToken,
  authorizeRoles(['admin']),
  ezeeController.getPaymentGateways
);

router.post('/payments/process',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('bookingId').isMongoId(),
    body('amount').isFloat({ min: 0 }),
    body('paymentMethod').isString().notEmpty(),
    body('gatewayId').isString().notEmpty(),
    body('transactionId').optional().isString(),
    validateRequest
  ],
  ezeeController.processPayment
);

// Guest Management Routes
router.get('/guests',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('search').optional().isString(),
    validateRequest
  ],
  ezeeController.getGuests
);

router.post('/guests',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('first_name').isString().notEmpty(),
    body('last_name').isString().notEmpty(),
    body('email').isEmail(),
    body('phone').isMobilePhone('any'),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('state').optional().isString(),
    body('country').optional().isString(),
    body('postal_code').optional().isString(),
    validateRequest
  ],
  ezeeController.createGuest
);

// Reports Routes
router.get('/reports/availability',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    validateRequest
  ],
  ezeeController.getAvailabilityReport
);

router.get('/reports/revenue',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('groupBy').optional().isIn(['day', 'month']),
    validateRequest
  ],
  ezeeController.getRevenueReport
);

router.get('/reports/occupancy',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    validateRequest
  ],
  ezeeController.getOccupancyReport
);

// Currency Management Routes
router.get('/currencies',
  authenticateToken,
  authorizeRoles(['admin']),
  ezeeController.getCurrencies
);

router.post('/currencies/exchange-rates',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('exchangeRates').isArray().notEmpty(),
    body('exchangeRates.*.currency_code').isString().notEmpty(),
    body('exchangeRates.*.exchange_rate').isFloat({ min: 0 }),
    validateRequest
  ],
  ezeeController.updateExchangeRates
);

export default router;