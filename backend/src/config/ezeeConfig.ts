import { EZeeConfig } from '../services/ezeePmsService';

export const getEzeeConfig = (): EZeeConfig => {
  const environment = process.env.EZEE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox';

  return {
    hotelCode: process.env.EZEE_HOTEL_CODE || '',
    authToken: process.env.EZEE_AUTH_TOKEN || '',
    apiKey: process.env.EZEE_API_KEY || '',
    baseURL: environment === 'production'
      ? 'https://api.ezeetechnosys.com'
      : 'https://sandbox-api.ezeetechnosys.com',
    environment
  };
};

export const validateEzeeConfig = (config: EZeeConfig): boolean => {
  return !!(config.hotelCode && config.authToken && config.apiKey);
};

export const EZEE_ENDPOINTS = {
  // Authentication
  CHECK_AUTH: '/check_hotel_authentication',
  HOTEL_INFO: '/get_hotel_info',

  // Room Management
  ROOM_TYPES: '/get_room_types',
  CREATE_ROOM_TYPE: '/create_room_type',
  UPDATE_ROOM_TYPE: '/update_room_type',

  // Inventory & Rates
  ROOM_INVENTORY: '/get_room_inventory',
  UPDATE_INVENTORY: '/update_room_inventory',
  LINEAR_RATES: '/update_linear_rates',
  NON_LINEAR_RATES: '/update_non_linear_rates',

  // Rate Plans
  RATE_PLANS: '/get_rate_plans',
  CREATE_RATE_PLAN: '/create_rate_plan',

  // Bookings
  GET_BOOKINGS: '/get_bookings',
  GET_BOOKING: '/get_booking',
  CREATE_RESERVATION: '/create_reservation',
  UPDATE_BOOKING_STATUS: '/update_booking_status',
  CANCEL_BOOKING: '/cancel_booking',
  CHECK_IN: '/check_in_guest',
  CHECK_OUT: '/check_out_guest',

  // Guest Management
  GUESTS: '/get_guests',
  CREATE_GUEST: '/create_guest',
  UPDATE_GUEST: '/update_guest',

  // Payments
  PAYMENT_GATEWAYS: '/get_payment_gateways',
  PROCESS_PAYMENT: '/process_payment',
  REFUND_PAYMENT: '/refund_payment',

  // Currency
  CURRENCIES: '/get_currencies',
  EXCHANGE_RATES: '/update_exchange_rates',

  // Reports
  AVAILABILITY_REPORT: '/get_availability_report',
  REVENUE_REPORT: '/get_revenue_report',
  OCCUPANCY_REPORT: '/get_occupancy_report'
};

export const EZEE_STATUS_MAPPING = {
  BOOKING: {
    LOCAL_TO_EZEE: {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'checked_in': 'checked_in',
      'checked_out': 'checked_out',
      'cancelled': 'cancelled'
    },
    EZEE_TO_LOCAL: {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'checked_in': 'checked_in',
      'checked_out': 'checked_out',
      'cancelled': 'cancelled'
    }
  },
  PAYMENT: {
    LOCAL_TO_EZEE: {
      'pending': 'pending',
      'paid': 'paid',
      'failed': 'failed',
      'refunded': 'refunded'
    },
    EZEE_TO_LOCAL: {
      'pending': 'pending',
      'paid': 'paid',
      'failed': 'failed',
      'partial': 'pending',
      'refunded': 'refunded'
    }
  }
};

export default {
  getEzeeConfig,
  validateEzeeConfig,
  EZEE_ENDPOINTS,
  EZEE_STATUS_MAPPING
};