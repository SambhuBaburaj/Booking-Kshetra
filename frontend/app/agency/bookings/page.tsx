'use client'

import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Car,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Send
} from 'lucide-react';
import { apiClient } from '../../../lib/api-client';
import AgencyNav from '../../../components/AgencyNav';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

interface Booking {
  _id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  transportInfo?: {
    pickupLocation: string;
    dropLocation: string;
    pickupDateTime: string;
    pickupTerminal?: string;
    dropTerminal?: string;
  };
  guests: Array<{
    name: string;
    age: number;
  }>;
  createdAt: string;
  assignment?: {
    _id: string;
    status: string;
    vehicleId: {
      _id: string;
      vehicleNumber: string;
      vehicleType: string;
      vehicleModel: string;
    };
    driverId: {
      _id: string;
      name: string;
      phone: string;
    };
    notes?: string;
    createdAt: string;
  };
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleModel: string;
  capacity: number;
  isAvailable: boolean;
}

interface Driver {
  _id: string;
  name: string;
  phone: string;
  email: string;
  isAvailable: boolean;
}

interface AssignmentFormData {
  vehicleId: string;
  driverId: string;
  notes: string;
}

const initialAssignmentData: AssignmentFormData = {
  vehicleId: '',
  driverId: '',
  notes: ''
};

export default function AgencyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignmentData, setAssignmentData] = useState<AssignmentFormData>(initialAssignmentData);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [bookingsResponse, vehiclesResponse, driversResponse] = await Promise.all([
        apiClient.agencyGet('/agency/bookings'),
        apiClient.agencyGet('/agency/vehicles'),
        apiClient.agencyGet('/agency/drivers')
      ]);

      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data.bookings || []);
      }

      if (vehiclesResponse.success && vehiclesResponse.data) {
        setVehicles(vehiclesResponse.data.vehicles || []);
      }

      if (driversResponse.success && driversResponse.data) {
        setDrivers(driversResponse.data.drivers || []);
      }

      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    if (booking.assignment) {
      // Edit existing assignment
      setAssignmentData({
        vehicleId: booking.assignment.vehicleId._id,
        driverId: booking.assignment.driverId._id,
        notes: booking.assignment.notes || ''
      });
    } else {
      // Create new assignment
      setAssignmentData(initialAssignmentData);
    }
    setShowAssignModal(true);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSubmitLoading(true);

    try {
      const response = await apiClient.agencyPost(`/agency/bookings/${selectedBooking._id}/assign`, {
        vehicleId: assignmentData.vehicleId,
        driverId: assignmentData.driverId,
        notes: assignmentData.notes
      });

      if (response.success) {
        // Refresh bookings to get updated data
        await fetchData();
        setShowAssignModal(false);
        setSelectedBooking(null);
      } else {
        setError(response.error || 'Failed to assign booking');
      }
    } catch (err) {
      setError('Failed to assign booking');
      console.error('Assignment error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId: string, status: string) => {
    try {
      const response = await apiClient.agencyPut(`/agency/assignments/${assignmentId}/status`, {
        status
      });

      if (response.success) {
        // Refresh bookings to get updated data
        await fetchData();
      } else {
        setError(response.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
      console.error('Status update error:', err);
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      (booking.guestName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.guestEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (booking.bookingId?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'unassigned' && !booking.assignment) ||
      (filterStatus === 'assigned' && booking.assignment?.status === 'assigned') ||
      (filterStatus === 'in_progress' && booking.assignment?.status === 'in_progress') ||
      (filterStatus === 'completed' && (booking.assignment?.status === 'completed' || booking.assignment?.status === 'drop_completed'));

    return matchesSearch && matchesFilter;
  });

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const availableVehicles = vehicles.filter(v => v.isAvailable);
  const availableDrivers = drivers.filter(d => d.isAvailable);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading bookings..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav />

      <div className="lg:ml-64">
        <main className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Transport Bookings</h1>
            <p className="text-gray-600 mt-1">Manage and assign transport bookings</p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Bookings
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by guest name, email, or booking ID..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Bookings</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bookings.length === 0 ? 'No bookings received yet' : 'No bookings match your filters'}
              </h3>
              <p className="text-gray-600">
                {bookings.length === 0 ? 'Transport booking requests will appear here.' : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking.bookingId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Created: {formatDateTime(booking.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {booking.assignment ? (
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            getStatusColor(booking.assignment.status)
                          }`}>
                            {booking.assignment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            UNASSIGNED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Guest Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Guest Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{booking.guestName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{booking.guestEmail || 'N/A'}</span>
                          </div>
                          {booking.guestPhone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{booking.guestPhone}</span>
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Guests: {booking.guests?.length || 0} person{(booking.guests?.length || 0) > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Transport Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Transport Details</h4>
                        {booking.transportInfo ? (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              <div className="font-medium">From:</div>
                              <div>{booking.transportInfo.pickupLocation}</div>
                              {booking.transportInfo.pickupTerminal && (
                                <div className="text-blue-600">Terminal: {booking.transportInfo.pickupTerminal}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="font-medium">To:</div>
                              <div>{booking.transportInfo.dropLocation}</div>
                              {booking.transportInfo.dropTerminal && (
                                <div className="text-blue-600">Terminal: {booking.transportInfo.dropTerminal}</div>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatDateTime(booking.transportInfo.pickupDateTime)}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No transport details available</p>
                        )}
                      </div>

                      {/* Assignment Details */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Assignment</h4>
                        {booking.assignment ? (
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              <div className="font-medium">Vehicle:</div>
                              <div>{booking.assignment.vehicleId.vehicleNumber}</div>
                              <div className="text-gray-500">{booking.assignment.vehicleId.vehicleModel}</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="font-medium">Driver:</div>
                              <div>{booking.assignment.driverId.name}</div>
                              <div className="text-gray-500">{booking.assignment.driverId.phone}</div>
                            </div>
                            {booking.assignment.notes && (
                              <div className="text-sm text-gray-600">
                                <div className="font-medium">Notes:</div>
                                <div>{booking.assignment.notes}</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Not yet assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAssignBooking(booking)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          {booking.assignment ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          <span>{booking.assignment ? 'Edit Assignment' : 'Assign Transport'}</span>
                        </button>
                      </div>

                      {booking.assignment && (
                        <div className="flex space-x-2">
                          {booking.assignment.status === 'assigned' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(booking.assignment!._id, 'in_progress')}
                              className="bg-yellow-600 text-white px-3 py-1 text-sm rounded hover:bg-yellow-700"
                            >
                              Start Trip
                            </button>
                          )}
                          {booking.assignment.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => handleUpdateAssignmentStatus(booking.assignment!._id, 'pickup_completed')}
                                className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700"
                              >
                                Pickup Done
                              </button>
                            </>
                          )}
                          {booking.assignment.status === 'pickup_completed' && (
                            <button
                              onClick={() => handleUpdateAssignmentStatus(booking.assignment!._id, 'completed')}
                              className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                            >
                              Complete Trip
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedBooking.assignment ? 'Edit Assignment' : 'Assign Transport'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Booking #{selectedBooking.bookingId} - {selectedBooking.guestName}
              </p>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle *
                  </label>
                  <select
                    value={assignmentData.vehicleId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, vehicleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a vehicle...</option>
                    {availableVehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleNumber} - {vehicle.vehicleModel} ({vehicle.capacity} seats)
                      </option>
                    ))}
                  </select>
                  {availableVehicles.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">No available vehicles. Please add vehicles first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Driver *
                  </label>
                  <select
                    value={assignmentData.driverId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, driverId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a driver...</option>
                    {availableDrivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - {driver.phone}
                      </option>
                    ))}
                  </select>
                  {availableDrivers.length === 0 && (
                    <p className="text-sm text-red-600 mt-1">No available drivers. Please add drivers first.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={assignmentData.notes}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions or notes for the driver..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  disabled={submitLoading || availableVehicles.length === 0 || availableDrivers.length === 0}
                >
                  <Send className="w-4 h-4" />
                  <span>{submitLoading ? 'Assigning...' : 'Assign Transport'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}