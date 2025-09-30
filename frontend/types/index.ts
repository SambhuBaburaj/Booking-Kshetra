// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

// Room types
export interface Room {
  _id: string;
  roomType: 'AC' | 'Non-AC';
  roomNumber: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  isAvailable: boolean;
  images: string[];
}

// Addon service types
export interface AddonService {
  type: 'bike_rental' | 'sightseeing' | 'surfing';
  name: string;
  description: string;
  pricePerPerson?: number;
  pricePerDay?: number;
  fixedPrice?: number;
  minAge?: number;
  maxCapacity?: number;
  duration?: string;
}

// Transport booking
export interface TransportBooking {
  pickup: boolean;
  drop: boolean;
  pickupDetails?: {
    flightNumber?: string;
    arrivalTime?: string;
    terminal?: 'T1' | 'T2' | 'T3';
  };
  dropDetails?: {
    flightNumber?: string;
    departureTime?: string;
    terminal?: 'T1' | 'T2' | 'T3';
  };
  airportLocation: 'kochi' | 'trivandrum';
}

// Breakfast booking
export interface BreakfastBooking {
  enabled: boolean;
  days: number;
  persons: number;
}

// Service booking
export interface ServiceBooking {
  type: 'bike_rental' | 'sightseeing' | 'surfing';
  quantity: number;
  persons: number;
  totalPrice: number;
}

// Yoga session types
export interface YogaSession {
  _id: string;
  type: '200hr' | '300hr';
  name: string;
  duration: string;
  price: number;
  capacity: number;
  bookedSeats: number;
  startDate: string;
  endDate: string;
  description: string;
}

// Guest information
export interface GuestInfo {
  adults: number;
  children: number;
  childrenAges: number[];
}

// Pricing breakdown
export interface PricingBreakdown {
  roomCharges: number;
  foodCharges: number;
  transportCharges: number;
  breakfastCharges: number;
  serviceCharges: number;
  yogaCharges: number;
  totalAmount: number;
}

// Main booking interface
export interface Booking {
  _id?: string;
  userId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: GuestInfo;
  transport?: TransportBooking;
  breakfast?: BreakfastBooking;
  services: ServiceBooking[];
  yogaSessionId?: string;
  pricing: PricingBreakdown;
  paymentStatus: 'pending' | 'success' | 'failed';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payment types
export interface Payment {
  _id: string;
  bookingId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: 'INR';
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

// Form data types
export interface BookingFormData {
  room: {
    roomId: string;
    roomType: 'AC' | 'Non-AC';
    pricePerNight: number;
  };
  dates: {
    checkIn: Date | null;
    checkOut: Date | null;
    nights: number;
  };
  guests: GuestInfo;
  transport: TransportBooking;
  breakfast: BreakfastBooking;
  services: {
    bikeRental: {
      enabled: boolean;
      quantity: number;
      days: number;
    };
    sightseeing: {
      enabled: boolean;
      persons: number;
    };
    surfing: {
      enabled: boolean;
      persons: number;
    };
  };
  yogaSession: {
    enabled: boolean;
    sessionId?: string;
    type?: '200hr' | '300hr';
  };
  specialRequests?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface BookingResponse extends ApiResponse<Booking> {}
export interface PaymentResponse extends ApiResponse<Payment> {}
export interface RoomsResponse extends ApiResponse<Room[]> {}
export interface YogaSessionsResponse extends ApiResponse<YogaSession[]> {}