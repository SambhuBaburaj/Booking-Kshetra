'use client'

import { useState, useEffect } from 'react';
import { adminAPI } from '../../../lib/api';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Activity,
  Heart
} from 'lucide-react';

interface YogaSession {
  _id: string;
  type: '200hr' | '300hr';
  batchName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  price: number;
  instructor: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  schedule: {
    days: string[];
    time: string;
  };
  isActive: boolean;
  description?: string;
  prerequisites: string[];
  availableSeats?: number;
}

const YogaAdmin = () => {
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [dailySessions, setDailySessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<YogaSession | null>(null);
  const [editingDailySession, setEditingDailySession] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'daily'>('programs');

  useEffect(() => {
    fetchYogaSessions();
    fetchDailySessions();
  }, []);

  const fetchYogaSessions = async () => {
    try {
      const response = await adminAPI.getAllYogaSessions();
      const data = response.data;
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching yoga sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySessions = async () => {
    try {
      const response = await adminAPI.getAllDailyYogaSessions();
      const data = response.data;
      if (data.success) {
        setDailySessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching daily sessions:', error);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this yoga session?')) return;

    try {
      await adminAPI.deleteYogaSession(sessionId);
      await fetchYogaSessions();
    } catch (error) {
      console.error('Error deleting yoga session:', error);
    }
  };

  const handleDeleteDailySession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this daily session?')) return;

    try {
      await adminAPI.deleteDailyYogaSession(sessionId);
      await fetchDailySessions();
    } catch (error) {
      console.error('Error deleting daily session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yoga Management</h1>
              <p className="text-gray-600">Manage yoga programs and daily sessions</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 'programs' ? 'Add Training Program' : 'Add Daily Session'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('programs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'programs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training Programs
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'daily'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daily Sessions
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'programs' && (
          <>
            {/* Training Programs Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{sessions.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {sessions.filter(s => s.isActive && new Date(s.startDate) > new Date()).length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {sessions.reduce((sum, session) => sum + session.capacity, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Booked Seats</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {sessions.reduce((sum, session) => sum + session.bookedSeats, 0)}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">All Yoga Sessions</h3>
              </div>
              <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {session.batchName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.type} Training
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {session.instructor.name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {session.instructor.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(session.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(session.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{session.schedule.days.join(', ')}</div>
                        <div className="text-gray-500">{session.schedule.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        {session.bookedSeats}/{session.capacity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.capacity - session.bookedSeats} available
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        ₹{session.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingSession(session);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(session._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Daily Sessions Tab Content */}
        {activeTab === 'daily' && (
          <>
            {/* Daily Sessions Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Daily Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{dailySessions.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Regular Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dailySessions.filter(s => s.type === 'regular').length}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Therapy Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {dailySessions.filter(s => s.type === 'therapy').length}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Daily Sessions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Daily Yoga Sessions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Slots
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailySessions.map((session) => (
                      <tr key={session._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {session.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {session.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.type === 'regular'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {session.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            ₹{session.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-1" />
                            {session.duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            {session.timeSlots?.filter((slot: any) => slot.isActive).map((slot: any, idx: number) => (
                              <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {slot.time}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {session.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingDailySession(session);
                                setShowModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDailySession(session._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal for both Program and Daily Sessions */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingDailySession
                      ? 'Edit Daily Session'
                      : editingSession
                      ? 'Edit Training Program'
                      : activeTab === 'daily'
                      ? 'Add New Daily Session'
                      : 'Add New Training Program'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingSession(null);
                      setEditingDailySession(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {editingDailySession || (activeTab === 'daily' && !editingSession) ? (
                  <DailySessionForm
                    session={editingDailySession}
                    onSubmit={async (sessionData) => {
                      try {
                        if (editingDailySession) {
                          await adminAPI.updateDailyYogaSession(editingDailySession._id, sessionData);
                        } else {
                          await adminAPI.createDailyYogaSession(sessionData);
                        }

                        await fetchDailySessions();
                        setShowModal(false);
                        setEditingDailySession(null);
                      } catch (error) {
                        console.error('Error saving daily session:', error);
                      }
                    }}
                    onCancel={() => {
                      setShowModal(false);
                      setEditingDailySession(null);
                    }}
                  />
                ) : (
                  <YogaSessionForm
                    session={editingSession}
                    onSubmit={async (sessionData) => {
                      try {
                        if (editingSession) {
                          await adminAPI.updateYogaSession(editingSession._id, sessionData);
                        } else {
                          await adminAPI.createYogaSession(sessionData);
                        }

                        await fetchYogaSessions();
                        setShowModal(false);
                        setEditingSession(null);
                      } catch (error) {
                        console.error('Error saving yoga session:', error);
                      }
                    }}
                    onCancel={() => {
                      setShowModal(false);
                      setEditingSession(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Yoga Session Form Component
const YogaSessionForm = ({ session, onSubmit, onCancel }: {
  session: YogaSession | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: session?.type || '200hr' as '200hr' | '300hr',
    batchName: session?.batchName || '',
    startDate: session?.startDate ? new Date(session.startDate).toISOString().split('T')[0] : '',
    endDate: session?.endDate ? new Date(session.endDate).toISOString().split('T')[0] : '',
    capacity: session?.capacity || 15,
    price: session?.price || 150000,
    instructor: session?.instructor._id || '',
    schedule: {
      days: session?.schedule.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      time: session?.schedule.time || '06:00'
    },
    description: session?.description || '',
    prerequisites: session?.prerequisites || ['Must have accommodation booking', 'Basic yoga experience recommended']
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getAllYogaTeachers();
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      prerequisites: formData.prerequisites.filter(p => p.trim() !== '')
    });
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as '200hr' | '300hr' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="200hr">200hr Training</option>
            <option value="300hr">300hr Training</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
          <input
            type="text"
            required
            value={formData.batchName}
            onChange={(e) => setFormData(prev => ({ ...prev, batchName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Foundation Teacher Training - January 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input
            type="number"
            required
            min="1"
            max="50"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
          <select
            required
            value={formData.instructor}
            onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Instructor</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            required
            value={formData.schedule.time}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              schedule: { ...prev.schedule, time: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Days</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {weekDays.map((day) => (
            <label key={day} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.schedule.days.includes(day)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, days: [...prev.schedule.days, day] }
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, days: prev.schedule.days.filter(d => d !== day) }
                    }));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the yoga session program..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites</label>
        {formData.prerequisites.map((prereq, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={prereq}
              onChange={(e) => {
                const newPrereqs = [...formData.prerequisites];
                newPrereqs[index] = e.target.value;
                setFormData(prev => ({ ...prev, prerequisites: newPrereqs }));
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Must have accommodation booking"
            />
            {formData.prerequisites.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newPrereqs = formData.prerequisites.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, prerequisites: newPrereqs }));
                }}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, prerequisites: [...prev.prerequisites, ''] }))}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Prerequisite
        </button>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {session ? 'Update Session' : 'Add Session'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Daily Yoga Session Form Component
const DailySessionForm = ({ session, onSubmit, onCancel }: {
  session: any | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: session?.name || '',
    type: session?.type || 'regular',
    price: session?.price || 500,
    duration: session?.duration || 90,
    description: session?.description || '',
    timeSlots: session?.timeSlots || [{ time: '07:30', isActive: true }],
    features: session?.features || [''],
    isActive: session?.isActive !== undefined ? session.isActive : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      features: formData.features.filter(f => f.trim() !== ''),
      timeSlots: formData.timeSlots.filter(slot => slot.time.trim() !== '')
    });
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { time: '', isActive: true }]
    }));
  };

  const updateTimeSlot = (index: number, field: 'time' | 'isActive', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Regular Yoga Sessions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="regular">Regular</option>
            <option value="therapy">Therapy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <input
            type="number"
            required
            min="30"
            max="180"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the yoga session..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots</label>
        {formData.timeSlots.map((slot, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <input
              type="time"
              required
              value={slot.time}
              onChange={(e) => updateTimeSlot(index, 'time', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={slot.isActive}
                onChange={(e) => updateTimeSlot(index, 'isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              Active
            </label>
            {formData.timeSlots.length > 1 && (
              <button
                type="button"
                onClick={() => removeTimeSlot(index)}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTimeSlot}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Time Slot
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => updateFeature(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Traditional Hatha Yoga"
            />
            {formData.features.length > 1 && (
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addFeature}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Feature
        </button>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Session is active
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {session ? 'Update Session' : 'Add Session'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default YogaAdmin;