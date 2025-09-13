import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getDashboardStats,
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllServices,
  createService,
  updateService,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  getRoomAvailability,
  bulkUpdateRoomAvailability,
  getRoomStats
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { uploadMultiple } from '../middleware/upload';
import { handleFormDataArrays } from '../middleware/formData';

const router = express.Router();

// Apply admin authorization to all routes
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Room Management
const roomValidation = [
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required'),
  body('roomType')
    .isIn(['AC', 'Non-AC'])
    .withMessage('Room type must be AC or Non-AC'),
  body('pricePerNight')
    .isFloat({ min: 0 })
    .withMessage('Price per night must be a positive number'),
  body('capacity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Capacity must be between 1 and 10'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

const roomQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('roomType')
    .optional()
    .isIn(['AC', 'Non-AC'])
    .withMessage('Invalid room type'),
  query('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be boolean')
];

router.get('/rooms', validate(roomQueryValidation), getAllRooms);
router.post('/rooms', uploadMultiple, handleFormDataArrays, validate(roomValidation), createRoom);
router.put('/rooms/:id',
  param('id').isMongoId().withMessage('Valid room ID required'),
  uploadMultiple,
  handleFormDataArrays,
  validate(roomValidation),
  updateRoom
);
router.delete('/rooms/:id',
  param('id').isMongoId().withMessage('Valid room ID required'),
  deleteRoom
);

// Room availability and stats
const availabilityQueryValidation = [
  query('checkIn')
    .notEmpty()
    .isISO8601()
    .withMessage('Valid check-in date is required'),
  query('checkOut')
    .notEmpty()
    .isISO8601()
    .withMessage('Valid check-out date is required'),
  query('roomType')
    .optional()
    .isIn(['AC', 'Non-AC'])
    .withMessage('Invalid room type'),
  query('capacity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Capacity must be between 1 and 10')
];

const bulkUpdateValidation = [
  body('roomIds')
    .isArray({ min: 1 })
    .withMessage('Room IDs array is required'),
  body('roomIds.*')
    .isMongoId()
    .withMessage('Each room ID must be valid'),
  body('isAvailable')
    .isBoolean()
    .withMessage('isAvailable must be boolean')
];

router.get('/rooms/availability', validate(availabilityQueryValidation), getRoomAvailability);
router.patch('/rooms/bulk-availability', validate(bulkUpdateValidation), bulkUpdateRoomAvailability);
router.get('/rooms/stats', getRoomStats);

// Service Management
const serviceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('category')
    .isIn(['addon', 'transport', 'food', 'yoga'])
    .withMessage('Category must be addon, transport, food, or yoga'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('priceUnit')
    .isIn(['per_person', 'per_day', 'per_session', 'flat_rate'])
    .withMessage('Invalid price unit'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('ageRestriction.minAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum age must be a non-negative integer'),
  body('ageRestriction.maxAge')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum age must be a non-negative integer')
];

const serviceQueryValidation = [
  query('category')
    .optional()
    .isIn(['addon', 'transport', 'food', 'yoga'])
    .withMessage('Invalid category'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be boolean')
];

router.get('/services', validate(serviceQueryValidation), getAllServices);
router.post('/services', validate(serviceValidation), createService);
router.put('/services/:id',
  param('id').isMongoId().withMessage('Valid service ID required'),
  validate(serviceValidation),
  updateService
);

// Booking Management
const bookingQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
    .withMessage('Invalid status'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateFrom'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for dateTo'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters')
];

const updateBookingValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid booking ID required'),
  body('status')
    .isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

router.get('/bookings', validate(bookingQueryValidation), getAllBookings);
router.put('/bookings/:id/status', validate(updateBookingValidation), updateBookingStatus);

// User Management
const userQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters')
];

router.get('/users', validate(userQueryValidation), getAllUsers);

export default router;