'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Car,
  Activity,
  Home,
  Download,
  Plane,
  Info
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { bookingAPI } from '../../lib/api';

interface BookingDetails {
  _id: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: Array<{
    name: string;
    age: number;
    isChild: boolean;
    gender?: string;
  }>;
  totalGuests: number;
  adults: number;
  children: number;
  includeFood: boolean;
  includeBreakfast: boolean;
  transport?: {
    pickup: boolean;
    drop: boolean;
    airportFrom?: string;
    airportTo?: string;
    pickupTerminal?: string;
    dropTerminal?: string;
    flightNumber?: string;
    flightArrivalTime?: string;
    flightDepartureTime?: string;
    specialInstructions?: string;
  };
  selectedServices: Array<{
    serviceId: string;
    quantity: number;
    totalPrice: number;
    details?: any;
  }>;
  yogaSessionId?: string;
  roomId?: {
    roomNumber: string;
    roomType: string;
    description: string;
    pricePerNight: number;
  };
  roomPrice: number;
  foodPrice: number;
  breakfastPrice: number;
  servicesPrice: number;
  transportPrice: number;
  yogaPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  specialRequests?: string;
  bookingType?: 'room' | 'yoga';
  createdAt: string;
  updatedAt: string;
}

const TrackBookingPage = () => {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!bookingId.trim()) {
      setError('Please enter a booking ID');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const response = await bookingAPI.getPublicBookingById(bookingId.trim());

      if (response.data?.success) {
        setBooking(response.data.data.booking);
      } else {
        setError(response.data?.message || 'Booking not found');
      }
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError('Failed to fetch booking details. Please check your booking ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'checked_in':
        return <Home className="w-5 h-5 text-blue-600" />;
      case 'checked_out':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Track Your Booking
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Enter your booking ID to view all details about your reservation, including room information, services, and payment status.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Enter Your Booking ID
                </h2>
                <p className="text-gray-600">
                  You can find your booking ID in the confirmation email or receipt you received after booking.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter your booking ID (e.g., 68dcc2ec59e880899e1bbb9c)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Track Booking'}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>

            {/* Booking Details */}
            {booking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Status Overview */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Booking Status</h3>
                    <span className="text-sm text-gray-600">ID: {booking._id}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(booking.status)}
                      <div>
                        <p className="text-sm text-gray-600">Booking Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Guest Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Primary Guest Email</p>
                      <p className="font-medium text-gray-900">{booking.guestEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Guests</p>
                      <p className="font-medium text-gray-900">{booking.totalGuests} ({booking.adults} adults, {booking.children} children)</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Guest Details</p>
                    <div className="space-y-2">
                      {booking.guests.map((guest, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{guest.name}</span>
                          <span className="text-sm text-gray-600">Age: {guest.age}</span>
                          {guest.gender && <span className="text-sm text-gray-600">{guest.gender}</span>}
                          {guest.isChild && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Child</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Booking Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Check-in Date</p>
                      <p className="font-medium text-gray-900">{formatDateOnly(booking.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-out Date</p>
                      <p className="font-medium text-gray-900">{formatDateOnly(booking.checkOut)}</p>
                    </div>
                  </div>

                  {/* Room Information */}
                  {booking.roomId && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Room Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Room Number</p>
                          <p className="font-medium">{booking.roomId.roomNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Room Type</p>
                          <p className="font-medium">{booking.roomId.roomType}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="font-medium">{booking.roomId.description}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yoga Session Information */}
                  {booking.bookingType === 'yoga' && booking.yogaSessionId && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Yoga Session Information
                      </h4>
                      <p className="text-sm text-gray-600">Session ID: {booking.yogaSessionId}</p>
                    </div>
                  )}

                  {/* Transport Information */}
                  {booking.transport && (booking.transport.pickup || booking.transport.drop) && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Transport Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {booking.transport.pickup && (
                          <div>
                            <p className="text-sm text-gray-600">Pickup</p>
                            <p className="font-medium">
                              From {booking.transport.airportFrom || 'Airport'}
                              {booking.transport.pickupTerminal && ` (Terminal ${booking.transport.pickupTerminal})`}
                            </p>
                          </div>
                        )}
                        {booking.transport.drop && (
                          <div>
                            <p className="text-sm text-gray-600">Drop</p>
                            <p className="font-medium">
                              To {booking.transport.airportTo || 'Airport'}
                              {booking.transport.dropTerminal && ` (Terminal ${booking.transport.dropTerminal})`}
                            </p>
                          </div>
                        )}
                        {booking.transport.flightNumber && (
                          <div>
                            <p className="text-sm text-gray-600">Flight Number</p>
                            <p className="font-medium">{booking.transport.flightNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Special Requests
                      </h4>
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pricing Breakdown
                  </h3>

                  <div className="space-y-3">
                    {booking.roomPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Charges</span>
                        <span className="font-medium">₹{booking.roomPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.yogaPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yoga Session</span>
                        <span className="font-medium">₹{booking.yogaPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.foodPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Food</span>
                        <span className="font-medium">₹{booking.foodPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.breakfastPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Breakfast</span>
                        <span className="font-medium">₹{booking.breakfastPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.servicesPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional Services</span>
                        <span className="font-medium">₹{booking.servicesPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {booking.transportPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transport</span>
                        <span className="font-medium">₹{booking.transportPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{booking.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {booking.paymentId && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">Payment ID: {booking.paymentId}</p>
                    </div>
                  )}
                </div>

                {/* Booking Timestamps */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Booking Created</p>
                      <p className="font-medium">{formatDate(booking.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-medium">{formatDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TrackBookingPage;