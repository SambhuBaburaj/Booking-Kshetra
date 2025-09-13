'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Star,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';
import { roomAPI } from '../../lib/api';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'AC' | 'Non-AC';
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  description?: string;
  images: string[];
  isAvailable: boolean;
}

const RoomsPage = () => {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    roomType: 'all',
    priceRange: 'all',
    capacity: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAllRooms();
      const data = response.data;
      
      if (data.success) {
        setRooms(data.data.rooms || []);
      } else {
        setError(data.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.roomType === 'all' || room.roomType === filters.roomType;
    
    const matchesPrice = filters.priceRange === 'all' || (
      filters.priceRange === 'budget' && room.pricePerNight < 2000 ||
      filters.priceRange === 'mid' && room.pricePerNight >= 2000 && room.pricePerNight < 4000 ||
      filters.priceRange === 'luxury' && room.pricePerNight >= 4000
    );
    
    const matchesCapacity = filters.capacity === 'all' || 
                           parseInt(filters.capacity) === room.capacity;
    
    return matchesSearch && matchesType && matchesPrice && matchesCapacity && room.isAvailable;
  });

  const handleBookRoom = (room: Room) => {
    // Store selected room in localStorage and redirect to booking
    localStorage.setItem('selectedRoom', JSON.stringify({
      roomId: room._id,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      roomNumber: room.roomNumber
    }));
    
    router.push('/booking');
  };

  const RoomCard = ({ room }: { room: Room }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Room Image */}
      <div className="h-64 bg-gray-200 relative">
        {room.images.length > 0 ? (
          <img 
            src={room.images[0]} 
            alt={`Room ${room.roomNumber}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Car className="w-12 h-12 mx-auto mb-2" />
              <p>No Image Available</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            room.roomType === 'AC' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {room.roomType}
          </span>
        </div>
      </div>

      {/* Room Details */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Room {room.roomNumber}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="w-4 h-4 mr-1" />
              Up to {room.capacity} guests
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              ₹{room.pricePerNight.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">per night</div>
          </div>
        </div>

        {room.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {room.description}
          </p>
        )}

        {/* Amenities */}
        {room.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded flex items-center gap-1"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{room.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">4.8 (127 reviews)</span>
        </div>

        {/* Book Button */}
        <button
          onClick={() => handleBookRoom(room)}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Book Now
        </button>
      </div>
    </motion.div>
  );

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lowerAmenity.includes('parking')) return <Car className="w-3 h-3" />;
    if (lowerAmenity.includes('coffee') || lowerAmenity.includes('tea')) return <Coffee className="w-3 h-3" />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={fetchRooms}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-light mb-4">Our Rooms</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Choose from our carefully designed accommodations, each offering comfort and tranquility
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
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

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={filters.roomType}
                onChange={(e) => setFilters(prev => ({ ...prev, roomType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="AC">AC Rooms</option>
                <option value="Non-AC">Non-AC Rooms</option>
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Prices</option>
                <option value="budget">Under ₹2,000</option>
                <option value="mid">₹2,000 - ₹4,000</option>
                <option value="luxury">Above ₹4,000</option>
              </select>

              <select
                value={filters.capacity}
                onChange={(e) => setFilters(prev => ({ ...prev, capacity: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Any Capacity</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Rooms Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map(room => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-xl mb-2">No rooms found</div>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;