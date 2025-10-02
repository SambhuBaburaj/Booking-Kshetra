'use client'

import { useState, useEffect } from 'react';
import {
  Calendar,
  Car,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import AgencyNav from '../../../components/AgencyNav';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

interface DashboardStats {
  totalBookings: number;
  pendingAssignments: number;
  totalVehicles: number;
  availableVehicles: number;
  totalDrivers: number;
  availableDrivers: number;
  completedBookings: number;
}

interface RecentBooking {
  _id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  transportInfo: {
    pickupLocation: string;
    dropLocation: string;
    pickupDateTime: string;
    pickupTerminal?: string;
    dropTerminal?: string;
  };
  createdAt: string;
  assignment?: {
    _id: string;
    status: string;
    vehicleId: {
      vehicleNumber: string;
      vehicleType: string;
    };
    driverId: {
      name: string;
      phone: string;
    };
  };
}

export default function AgencyDashboard() {
  const [agency, setAgency] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const agencyData = localStorage.getItem('agency');
    if (agencyData) {
      setAgency(JSON.parse(agencyData));
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('agencyToken');

      // Fetch bookings
      const bookingsResponse = await apiClient.agencyGet('/agency/bookings');

      if (bookingsResponse.success && bookingsResponse.data) {
        const bookings = bookingsResponse.data.bookings || [];
        setRecentBookings(bookings.slice(0, 5)); // Show last 5 bookings

        // Calculate stats (this would ideally come from a dedicated stats endpoint)
        const pendingAssignments = bookings.filter((booking: any) => !booking.assignment).length;
        const completedBookings = bookings.filter((booking: any) =>
          booking.assignment?.status === 'completed'
        ).length;

        setStats({
          totalBookings: bookings.length,
          pendingAssignments,
          completedBookings,
          totalVehicles: 0, // These would come from separate API calls
          availableVehicles: 0,
          totalDrivers: 0,
          availableDrivers: 0
        });
      }

      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pickup_completed':
        return 'bg-purple-100 text-purple-800';
      case 'drop_completed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav />

      <div className="lg:ml-64">
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back{agency ? `, ${agency.name}` : ''}! Here's your transport management overview.
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalBookings > 0
                        ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                        : 0
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transport Bookings</h2>
              <p className="text-sm text-gray-600">Latest bookings requiring transport assignment</p>
            </div>

            {recentBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Transport booking requests will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pickup Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.guestName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.guestEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">
                              {booking.transportInfo?.pickupLocation || 'N/A'}
                              {booking.transportInfo?.pickupTerminal &&
                                ` (${booking.transportInfo.pickupTerminal})`
                              }
                            </div>
                            <div className="text-gray-500">
                              → {booking.transportInfo?.dropLocation || 'N/A'}
                              {booking.transportInfo?.dropTerminal &&
                                ` (${booking.transportInfo.dropTerminal})`
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.transportInfo?.pickupDateTime ? formatDateTime(booking.transportInfo.pickupDateTime) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {booking.assignment ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              getStatusColor(booking.assignment.status)
                            }`}>
                              {booking.assignment.status.replace('_', ' ').toUpperCase()}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {booking.assignment ? (
                            <div>
                              <div className="font-medium">
                                {booking.assignment.vehicleId.vehicleNumber}
                              </div>
                              <div className="text-gray-500">
                                {booking.assignment.driverId.name}
                              </div>
                            </div>
                          ) : (
                            <span className="text-orange-600 font-medium">
                              Not Assigned
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-2">View All Bookings</h3>
              </div>
              <p className="text-gray-600 mb-4">
                See all transport booking requests and manage assignments.
              </p>
              <button
                onClick={() => window.location.href = '/agency/bookings'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Bookings
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Car className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-2">Manage Vehicles</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Add, edit, and manage your fleet of transport vehicles.
              </p>
              <button
                onClick={() => window.location.href = '/agency/vehicles'}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Manage Fleet
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 ml-2">Manage Drivers</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Add, edit, and manage your team of professional drivers.
              </p>
              <button
                onClick={() => window.location.href = '/agency/drivers'}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Manage Drivers
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}