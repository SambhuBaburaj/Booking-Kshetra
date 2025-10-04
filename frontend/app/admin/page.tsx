'use client'

import { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Home, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Bell
} from 'lucide-react';

interface RecentBooking {
  _id: string;
  userId?: {
    name: string;
    email: string;
    phone: string;
  };
  roomId?: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
  };
  primaryGuestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: string;
  selectedServices?: any[];
  yogaSessionId?: any;
  bookingType?: string;
  transportPrice?: number;
  yogaPrice?: number;
  servicesPrice?: number;
  transport?: {
    pickup: boolean;
    drop: boolean;
  };
}

interface DashboardStats {
  overview: {
    totalBookings: number;
    totalUsers: number;
    totalRooms: number;
    totalServices: number;
  };
  revenue: {
    total: number;
    monthly: number;
  };
  bookings: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  recentBookings: RecentBooking[];
  occupiedRooms: number;
}

interface YogaAnalytics {
  overview: {
    totalSessions: number;
    totalTeachers: number;
    upcomingSessions: number;
  };
  sessionsByType: {
    '200hr': number;
    '300hr': number;
  };
  capacity: {
    total: number;
    booked: number;
    available: number;
  };
  popularSpecializations: Array<{
    _id: string;
    count: number;
  }>;
}

// Helper functions for booking type identification
const getBookingTypeLabel = (booking: RecentBooking): string => {
  if ((booking.yogaPrice && booking.yogaPrice > 0) || booking.yogaSessionId) {
    return 'Yoga Session';
  }
  if ((booking.transportPrice && booking.transportPrice > 0) && (!booking.roomId && (booking.servicesPrice === 0 || !booking.servicesPrice))) {
    return 'Transport';
  }
  if (booking.selectedServices && booking.selectedServices.length > 0) {
    return 'Services';
  }
  return 'Service Booking';
};

const getBookingTypeDescription = (booking: RecentBooking): string => {
  if ((booking.yogaPrice && booking.yogaPrice > 0) || booking.yogaSessionId) {
    return typeof booking.yogaSessionId === 'object' && booking.yogaSessionId?.type
      ? `${booking.yogaSessionId.type}`
      : 'Daily Session';
  }
  if ((booking.transportPrice && booking.transportPrice > 0) && (!booking.roomId && (booking.servicesPrice === 0 || !booking.servicesPrice))) {
    const parts = [];
    if (booking.transport?.pickup) parts.push('Pickup');
    if (booking.transport?.drop) parts.push('Drop');
    return parts.length > 0 ? `Airport ${parts.join(' & ')}` : 'Transport Service';
  }
  if (booking.selectedServices && booking.selectedServices.length > 0) {
    return `${booking.selectedServices.length} service(s)`;
  }
  return 'Service Only';
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [yogaStats, setYogaStats] = useState<YogaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchYogaAnalytics();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    }
  };

  const fetchYogaAnalytics = async () => {
    try {
      const response = await adminAPI.getYogaAnalytics();
      const data = response.data;

      if (data.success) {
        setYogaStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch yoga analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening at your resort.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-6 h-6" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Bookings"
            value={stats?.overview.totalBookings || 0}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.revenue.total || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
          />
        </div>

        {/* Charts and Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium">₹{(stats?.revenue.monthly || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((stats?.revenue.monthly || 0) / (stats?.revenue.total || 1) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">₹{(stats?.revenue.total || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {stats?.bookings.pending || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {stats?.bookings.confirmed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  {stats?.bookings.cancelled || 0}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Yoga Analytics Section */}
        {yogaStats && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Yoga Analytics</h2>

              {/* Yoga Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Total Yoga Sessions"
                  value={yogaStats.overview.totalSessions}
                  icon={Activity}
                  color="orange"
                />
                <StatCard
                  title="Yoga Teachers"
                  value={yogaStats.overview.totalTeachers}
                  icon={Users}
                  color="purple"
                />
                <StatCard
                  title="Upcoming Sessions"
                  value={yogaStats.overview.upcomingSessions}
                  icon={Calendar}
                  color="green"
                />
              </div>

              {/* Yoga Details Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Types */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Session Types</h3>
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">200hr Training</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {yogaStats.sessionsByType['200hr']}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">300hr Training</span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {yogaStats.sessionsByType['300hr']}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Capacity Overview</h3>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Capacity</span>
                      <span className="font-semibold text-gray-900">{yogaStats.capacity.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Booked</span>
                      <span className="font-semibold text-gray-900">{yogaStats.capacity.booked}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Available</span>
                      <span className="font-semibold text-gray-900">{yogaStats.capacity.available}</span>
                    </div>
                  </div>
                </div>

                {/* Popular Specializations */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Top Specializations</h3>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="space-y-3">
                    {yogaStats.popularSpecializations.slice(0, 3).map((spec, index) => (
                      <div key={spec._id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{spec._id}</span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {spec.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentBookings.map((booking: any, index: number) => (
                  <tr key={booking._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.userId?.name || booking.primaryGuestInfo?.name || 'Guest'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.userId?.email || booking.primaryGuestInfo?.email || booking.guestEmail || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.userId?.phone || booking.primaryGuestInfo?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.roomId?.roomNumber || getBookingTypeLabel(booking)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.roomId?.roomType || getBookingTypeDescription(booking)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{booking.totalAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                )) || []}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;