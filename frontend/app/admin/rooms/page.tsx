'use client'

import { useState, useEffect } from 'react';
import { adminAPI } from '../../../lib/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Upload,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'AC' | 'Non-AC';
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
  description?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllRooms();
      const data = response.data;
      
      if (data.success) {
        setRooms(data.data.rooms);
      } else {
        setError(data.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (formData: FormData) => {
    try {
      const response = await adminAPI.createRoom(formData);
      const data = response.data;
      
      if (data.success) {
        await fetchRooms();
        setShowCreateModal(false);
        setSelectedImages([]);
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const handleUpdateRoom = async (roomId: string, formData: FormData) => {
    try {
      const response = await adminAPI.updateRoom(roomId, formData);
      const data = response.data;
      
      if (data.success) {
        await fetchRooms();
        setEditingRoom(null);
        setSelectedImages([]);
      } else {
        setError(data.message || 'Failed to update room');
      }
    } catch (err) {
      setError('Failed to update room');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const response = await adminAPI.deleteRoom(roomId);
      const data = response.data;
      
      if (data.success) {
        await fetchRooms();
      } else {
        setError(data.message || 'Failed to delete room');
      }
    } catch (err) {
      setError('Failed to delete room');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || room.roomType === filterType;
    return matchesSearch && matchesFilter;
  });

  const RoomForm = ({ room, onSubmit, onCancel }: {
    room?: Room;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      roomNumber: room?.roomNumber || '',
      roomType: room?.roomType || 'AC',
      pricePerNight: room?.pricePerNight || 0,
      capacity: room?.capacity || 1,
      amenities: room?.amenities || [],
      isAvailable: room?.isAvailable ?? true,
      description: room?.description || ''
    });

    const [newAmenity, setNewAmenity] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          // Send amenities as individual array items
          formData[key].forEach((amenity: string) => {
            form.append('amenities[]', amenity);
          });
        } else {
          form.append(key, (formData as any)[key].toString());
        }
      });

      // Add selected images
      selectedImages.forEach((file, index) => {
        form.append('images', file);
      });

      onSubmit(form);
    };

    const addAmenity = () => {
      if (newAmenity.trim()) {
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, newAmenity.trim()]
        }));
        setNewAmenity('');
      }
    };

    const removeAmenity = (index: number) => {
      setFormData(prev => ({
        ...prev,
        amenities: prev.amenities.filter((_, i) => i !== index)
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              value={formData.roomType}
              onChange={(e) => setFormData(prev => ({ ...prev, roomType: e.target.value as 'AC' | 'Non-AC' }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Night (₹)
            </label>
            <input
              type="number"
              value={formData.pricePerNight}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              max="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amenities
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {selectedImages.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedImages.length} image(s) selected
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
            Available for booking
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {room ? 'Update Room' : 'Create Room'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Room Management</h1>
          <p className="text-gray-600">Manage your resort rooms, availability, and pricing</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="AC">AC Rooms</option>
                <option value="Non-AC">Non-AC Rooms</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <div key={room._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Room Image */}
              <div className="h-48 bg-gray-200 relative">
                {room.images.length > 0 ? (
                  <img 
                    src={room.images[0]} 
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-12 h-12" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    room.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Room Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Room {room.roomNumber}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    room.roomType === 'AC' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {room.roomType}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {room.description || 'No description available'}
                </p>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{room.pricePerNight.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    Capacity: {room.capacity} guests
                  </span>
                </div>

                {/* Amenities */}
                {room.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-2">No rooms found</div>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first room'
              }
            </p>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Room</h2>
              <RoomForm 
                onSubmit={handleCreateRoom}
                onCancel={() => {
                  setShowCreateModal(false);
                  setSelectedImages([]);
                }}
              />
            </div>
          </div>
        )}

        {/* Edit Room Modal */}
        {editingRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Room</h2>
              <RoomForm 
                room={editingRoom}
                onSubmit={(formData) => handleUpdateRoom(editingRoom._id, formData)}
                onCancel={() => {
                  setEditingRoom(null);
                  setSelectedImages([]);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoomsPage;