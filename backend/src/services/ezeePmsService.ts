import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IRoom } from '../models/Room';
import { IBooking } from '../models/Booking';

export interface EZeeConfig {
  hotelCode: string;
  authToken: string;
  apiKey: string;
  baseURL: string;
  environment: 'sandbox' | 'production';
}

export interface EZeeRoomType {
  room_type_id: string;
  room_type_name: string;
  short_code: string;
  max_occupancy: number;
  max_adults: number;
  max_children: number;
  base_rate: number;
  currency: string;
  amenities: string[];
  room_size: string;
  bed_type: string;
  is_active: boolean;
}

export interface EZeeBookingData {
  booking_id: string;
  reservation_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_address: string;
  check_in: string;
  check_out: string;
  room_type_id: string;
  room_number: string;
  total_amount: number;
  paid_amount: number;
  booking_status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out';
  payment_status: 'paid' | 'pending' | 'failed' | 'partial';
  booking_source: string;
  special_requests: string;
  arrival_time: string;
  departure_time: string;
  guest_count: {
    adults: number;
    children: number;
  };
}

export interface EZeeInventoryUpdate {
  room_type_id: string;
  date: string;
  available_rooms: number;
  rate: number;
  extra_adult_rate?: number;
  extra_child_rate?: number;
  minimum_stay?: number;
  closed_to_arrival?: boolean;
  closed_to_departure?: boolean;
}

export interface EZeePaymentGateway {
  gateway_id: string;
  gateway_name: string;
  is_active: boolean;
  supported_currencies: string[];
  commission_rate: number;
  settings: Record<string, any>;
}

export interface EZeeCurrency {
  currency_code: string;
  currency_name: string;
  symbol: string;
  exchange_rate: number;
  is_base_currency: boolean;
  is_active: boolean;
}

export interface EZeeGuest {
  guest_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  id_type: string;
  id_number: string;
  date_of_birth: string;
  nationality: string;
  guest_type: 'individual' | 'corporate';
}

export interface EZeeRatePlan {
  rate_plan_id: string;
  rate_plan_name: string;
  rate_plan_code: string;
  is_active: boolean;
  meal_plan: string;
  cancellation_policy: string;
  room_type_rates: Array<{
    room_type_id: string;
    base_rate: number;
    extra_adult_rate: number;
    extra_child_rate: number;
  }>;
}

export interface EZeeReservationRequest {
  guest_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  room_details: {
    room_type_id: string;
    rate_plan_id: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
  };
  payment_info: {
    total_amount: number;
    payment_method: string;
    payment_status: string;
  };
  special_requests?: string;
  source: string;
}

export class EZeePMSService {
  private client: AxiosInstance;
  private config: EZeeConfig;

  constructor(config: EZeeConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        config.params = {
          ...config.params,
          HotelCode: this.config.hotelCode,
          AuthToken: this.config.authToken,
          APIKey: this.config.apiKey,
        };
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('eZee PMS API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Authentication & Configuration APIs
  async authenticateHotel(): Promise<boolean> {
    try {
      const response = await this.client.get('/check_hotel_authentication');
      return response.data.status === 'success';
    } catch (error) {
      console.error('eZee authentication failed:', error);
      return false;
    }
  }

  async getHotelInfo(): Promise<any> {
    try {
      const response = await this.client.get('/get_hotel_info');
      return response.data.hotel_info;
    } catch (error) {
      console.error('Failed to fetch hotel info:', error);
      throw new Error('Failed to fetch hotel info from eZee PMS');
    }
  }

  // Room Management APIs
  async getRoomTypes(): Promise<EZeeRoomType[]> {
    try {
      const response = await this.client.get('/get_room_types');
      return response.data.room_types || [];
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      throw new Error('Failed to fetch room types from eZee PMS');
    }
  }

  async createRoomType(roomData: Partial<EZeeRoomType>): Promise<EZeeRoomType> {
    try {
      const response = await this.client.post('/create_room_type', roomData);
      return response.data.room_type;
    } catch (error) {
      console.error('Failed to create room type:', error);
      throw new Error('Failed to create room type in eZee PMS');
    }
  }

  async updateRoomType(roomTypeId: string, roomData: Partial<EZeeRoomType>): Promise<EZeeRoomType> {
    try {
      const response = await this.client.put(`/update_room_type/${roomTypeId}`, roomData);
      return response.data.room_type;
    } catch (error) {
      console.error('Failed to update room type:', error);
      throw new Error('Failed to update room type in eZee PMS');
    }
  }

  // Inventory & Rates APIs
  async getRoomInventory(startDate: string, endDate: string, roomTypeId?: string): Promise<any[]> {
    try {
      const params: any = {
        start_date: startDate,
        end_date: endDate
      };
      if (roomTypeId) params.room_type_id = roomTypeId;

      const response = await this.client.get('/get_room_inventory', { params });
      return response.data.inventory || [];
    } catch (error) {
      console.error('Failed to fetch room inventory:', error);
      throw new Error('Failed to fetch room inventory from eZee PMS');
    }
  }

  async updateRoomInventory(updates: EZeeInventoryUpdate[]): Promise<boolean> {
    try {
      const response = await this.client.post('/update_room_inventory', {
        inventory_updates: updates
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to update room inventory:', error);
      throw new Error('Failed to update room inventory in eZee PMS');
    }
  }

  async updateLinearRates(roomTypeId: string, startDate: string, endDate: string, rate: number): Promise<boolean> {
    try {
      const response = await this.client.post('/update_linear_rates', {
        room_type_id: roomTypeId,
        start_date: startDate,
        end_date: endDate,
        rate: rate
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to update linear rates:', error);
      throw new Error('Failed to update linear rates in eZee PMS');
    }
  }

  async updateNonLinearRates(rateUpdates: Array<{room_type_id: string, date: string, rate: number}>): Promise<boolean> {
    try {
      const response = await this.client.post('/update_non_linear_rates', {
        rate_updates: rateUpdates
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to update non-linear rates:', error);
      throw new Error('Failed to update non-linear rates in eZee PMS');
    }
  }

  // Rate Plans APIs
  async getRatePlans(): Promise<EZeeRatePlan[]> {
    try {
      const response = await this.client.get('/get_rate_plans');
      return response.data.rate_plans || [];
    } catch (error) {
      console.error('Failed to fetch rate plans:', error);
      throw new Error('Failed to fetch rate plans from eZee PMS');
    }
  }

  async createRatePlan(ratePlanData: Partial<EZeeRatePlan>): Promise<EZeeRatePlan> {
    try {
      const response = await this.client.post('/create_rate_plan', ratePlanData);
      return response.data.rate_plan;
    } catch (error) {
      console.error('Failed to create rate plan:', error);
      throw new Error('Failed to create rate plan in eZee PMS');
    }
  }

  // Booking Management APIs
  async getBookings(startDate: string, endDate: string, status?: string): Promise<EZeeBookingData[]> {
    try {
      const params: any = {
        start_date: startDate,
        end_date: endDate
      };
      if (status) params.status = status;

      const response = await this.client.get('/get_bookings', { params });
      return response.data.bookings || [];
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw new Error('Failed to fetch bookings from eZee PMS');
    }
  }

  async getBookingById(bookingId: string): Promise<EZeeBookingData> {
    try {
      const response = await this.client.get(`/get_booking/${bookingId}`);
      return response.data.booking;
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      throw new Error('Failed to fetch booking from eZee PMS');
    }
  }

  async createReservation(reservationData: EZeeReservationRequest): Promise<EZeeBookingData> {
    try {
      const response = await this.client.post('/create_reservation', reservationData);
      return response.data.booking;
    } catch (error) {
      console.error('Failed to create reservation:', error);
      throw new Error('Failed to create reservation in eZee PMS');
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<boolean> {
    try {
      const response = await this.client.post('/update_booking_status', {
        booking_id: bookingId,
        status: status
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to update booking status:', error);
      throw new Error('Failed to update booking status in eZee PMS');
    }
  }

  async cancelBooking(bookingId: string, cancellationReason?: string): Promise<boolean> {
    try {
      const response = await this.client.post('/cancel_booking', {
        booking_id: bookingId,
        cancellation_reason: cancellationReason
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      throw new Error('Failed to cancel booking in eZee PMS');
    }
  }

  async checkInGuest(bookingId: string, checkInTime?: string): Promise<boolean> {
    try {
      const response = await this.client.post('/check_in_guest', {
        booking_id: bookingId,
        check_in_time: checkInTime || new Date().toISOString()
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to check in guest:', error);
      throw new Error('Failed to check in guest in eZee PMS');
    }
  }

  async checkOutGuest(bookingId: string, checkOutTime?: string): Promise<boolean> {
    try {
      const response = await this.client.post('/check_out_guest', {
        booking_id: bookingId,
        check_out_time: checkOutTime || new Date().toISOString()
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to check out guest:', error);
      throw new Error('Failed to check out guest in eZee PMS');
    }
  }

  // Guest Management APIs
  async getGuests(searchTerm?: string): Promise<EZeeGuest[]> {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await this.client.get('/get_guests', { params });
      return response.data.guests || [];
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      throw new Error('Failed to fetch guests from eZee PMS');
    }
  }

  async createGuest(guestData: Partial<EZeeGuest>): Promise<EZeeGuest> {
    try {
      const response = await this.client.post('/create_guest', guestData);
      return response.data.guest;
    } catch (error) {
      console.error('Failed to create guest:', error);
      throw new Error('Failed to create guest in eZee PMS');
    }
  }

  async updateGuest(guestId: string, guestData: Partial<EZeeGuest>): Promise<EZeeGuest> {
    try {
      const response = await this.client.put(`/update_guest/${guestId}`, guestData);
      return response.data.guest;
    } catch (error) {
      console.error('Failed to update guest:', error);
      throw new Error('Failed to update guest in eZee PMS');
    }
  }

  // Payment APIs
  async getPaymentGateways(): Promise<EZeePaymentGateway[]> {
    try {
      const response = await this.client.get('/get_payment_gateways');
      return response.data.payment_gateways || [];
    } catch (error) {
      console.error('Failed to fetch payment gateways:', error);
      throw new Error('Failed to fetch payment gateways from eZee PMS');
    }
  }

  async processPayment(paymentData: {
    booking_id: string;
    amount: number;
    payment_method: string;
    gateway_id: string;
    transaction_id?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/process_payment', paymentData);
      return response.data.payment_result;
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw new Error('Failed to process payment in eZee PMS');
    }
  }

  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<boolean> {
    try {
      const response = await this.client.post('/refund_payment', {
        payment_id: paymentId,
        amount: amount,
        reason: reason
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to refund payment:', error);
      throw new Error('Failed to refund payment in eZee PMS');
    }
  }

  // Currency APIs
  async getCurrencies(): Promise<EZeeCurrency[]> {
    try {
      const response = await this.client.get('/get_currencies');
      return response.data.currencies || [];
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      throw new Error('Failed to fetch currencies from eZee PMS');
    }
  }

  async updateExchangeRates(rates: Array<{currency_code: string, exchange_rate: number}>): Promise<boolean> {
    try {
      const response = await this.client.post('/update_exchange_rates', {
        exchange_rates: rates
      });
      return response.data.status === 'success';
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      throw new Error('Failed to update exchange rates in eZee PMS');
    }
  }

  // Reports APIs
  async getAvailabilityReport(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this.client.get('/get_availability_report', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data.report;
    } catch (error) {
      console.error('Failed to fetch availability report:', error);
      throw new Error('Failed to fetch availability report from eZee PMS');
    }
  }

  async getRevenueReport(startDate: string, endDate: string, groupBy?: 'day' | 'month'): Promise<any> {
    try {
      const params: any = {
        start_date: startDate,
        end_date: endDate
      };
      if (groupBy) params.group_by = groupBy;

      const response = await this.client.get('/get_revenue_report', { params });
      return response.data.report;
    } catch (error) {
      console.error('Failed to fetch revenue report:', error);
      throw new Error('Failed to fetch revenue report from eZee PMS');
    }
  }

  async getOccupancyReport(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await this.client.get('/get_occupancy_report', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      return response.data.report;
    } catch (error) {
      console.error('Failed to fetch occupancy report:', error);
      throw new Error('Failed to fetch occupancy report from eZee PMS');
    }
  }

  // Sync Methods for Local System Integration
  async syncRoomFromLocal(room: IRoom): Promise<EZeeRoomType> {
    const ezeeRoomData: Partial<EZeeRoomType> = {
      room_type_name: `${room.roomType} - ${room.roomNumber}`,
      max_occupancy: room.capacity,
      max_adults: room.capacity,
      max_children: Math.floor(room.capacity / 2),
      base_rate: room.pricePerNight,
      currency: 'INR',
      amenities: room.amenities,
      bed_type: room.roomType === 'AC' ? 'Queen' : 'Standard',
      is_active: room.isAvailable
    };

    return await this.createRoomType(ezeeRoomData);
  }

  async syncBookingFromLocal(booking: IBooking): Promise<EZeeBookingData> {
    const reservationData: EZeeReservationRequest = {
      guest_info: {
        first_name: booking.primaryGuestInfo?.name?.split(' ')[0] || booking.guests[0]?.name?.split(' ')[0] || '',
        last_name: booking.primaryGuestInfo?.name?.split(' ').slice(1).join(' ') || booking.guests[0]?.name?.split(' ').slice(1).join(' ') || '',
        email: booking.primaryGuestInfo?.email || booking.guestEmail || '',
        phone: booking.primaryGuestInfo?.phone || booking.guests[0]?.phone || '',
        address: booking.primaryGuestInfo?.address || '',
        city: booking.primaryGuestInfo?.city || '',
        state: booking.primaryGuestInfo?.state || '',
        country: 'India',
        postal_code: booking.primaryGuestInfo?.pincode || ''
      },
      room_details: {
        room_type_id: booking.roomId.toString(),
        rate_plan_id: 'default',
        check_in: booking.checkIn.toISOString().split('T')[0],
        check_out: booking.checkOut.toISOString().split('T')[0],
        adults: booking.adults,
        children: booking.children
      },
      payment_info: {
        total_amount: booking.totalAmount,
        payment_method: 'online',
        payment_status: this.mapPaymentStatus(booking.paymentStatus)
      },
      special_requests: booking.specialRequests,
      source: 'website'
    };

    return await this.createReservation(reservationData);
  }

  private mapBookingStatus(localStatus: string): string {
    switch (localStatus) {
      case 'confirmed':
        return 'confirmed';
      case 'checked_in':
        return 'checked_in';
      case 'checked_out':
        return 'checked_out';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  private mapPaymentStatus(localStatus: string): string {
    switch (localStatus) {
      case 'paid':
        return 'paid';
      case 'failed':
        return 'failed';
      case 'refunded':
        return 'refunded';
      default:
        return 'pending';
    }
  }
}

export default EZeePMSService;