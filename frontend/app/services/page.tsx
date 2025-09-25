'use client'

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Car,
  Bike,
  Waves,
  Plus,
  Minus,
  Calendar,
  ArrowRight,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  Plane,
  Activity
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface Service {
  _id: string;
  name: string;
  category: 'airport_pickup' | 'vehicle_rental' | 'surfing';
  price: number;
  priceUnit: string;
  description: string;
  duration?: string;
  features: string[];
  image?: string;
  maxQuantity?: number;
  isActive: boolean;
}

interface SelectedService extends Service {
  quantity: number;
  selectedOptions?: {
    // Airport pickup options
    airport?: 'trivandrum' | 'ernakulam' | 'calicut';
    pickupDate?: string;
    pickupTime?: string;
    // Vehicle rental options
    rentalDays?: number;
    // Surfing options
    sessionLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
}

// Main services data
const mainServices: Service[] = [
  {
    _id: "1",
    name: "Airport Pickup Service",
    category: "airport_pickup",
    price: 1500,
    priceUnit: "per_trip",
    description: "Comfortable and reliable airport transfer service from Trivandrum, Ernakulam (Kochi), or Calicut airports directly to Kshetra Retreat",
    duration: "1.5-4 hours",
    features: [
      "Professional drivers",
      "Comfortable air-conditioned vehicles",
      "Flight tracking for delays",
      "Meet & greet service",
      "Luggage assistance",
      "Available from all major Kerala airports"
    ],
    maxQuantity: 4,
    isActive: true
  },
  {
    _id: "2",
    name: "Vehicle Rental",
    category: "vehicle_rental",
    price: 800,
    priceUnit: "per_day",
    description: "Rent a variety of vehicles to explore Kerala's scenic beauty at your own pace",
    features: [
      "Well-maintained vehicles",
      "Scooters & motorcycles available",
      "Cars with/without driver",
      "Helmets & safety gear included",
      "Local area maps provided",
      "24/7 roadside assistance"
    ],
    maxQuantity: 3,
    isActive: true
  },
  {
    _id: "3",
    name: "Surfing Lessons",
    category: "surfing",
    price: 2500,
    priceUnit: "per_session",
    description: "Learn to surf at world-famous Varkala Beach with certified instructors and all equipment provided",
    duration: "2 hours",
    features: [
      "Certified surf instructors",
      "All equipment included",
      "Beginner to advanced levels",
      "Safety briefing included",
      "Small group sessions (max 4)",
      "Photo/video package available"
    ],
    maxQuantity: 4,
    isActive: true
  }
];

const ServicesPage = () => {
  const router = useRouter();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAirportOptions, setShowAirportOptions] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const getServiceIcon = (category: 'airport_pickup' | 'vehicle_rental' | 'surfing') => {
    switch (category) {
      case 'airport_pickup':
        return Plane;
      case 'vehicle_rental':
        return Car;
      case 'surfing':
        return Waves;
      default:
        return Activity;
    }
  };

  const formatPrice = (price: number, unit: string) => {
    const basePrice = `₹${price.toLocaleString()}`;
    switch (unit) {
      case 'per_person':
        return `${basePrice} per person`;
      case 'per_day':
        return `${basePrice} per day`;
      case 'per_session':
        return `${basePrice} per session`;
      case 'per_trip':
        return `${basePrice} per trip`;
      default:
        return basePrice;
    }
  };

  const addService = (service: Service) => {
    const existingService = selectedServices.find(s => s._id === service._id);
    if (existingService) {
      if (existingService.quantity < (service.maxQuantity || 10)) {
        setSelectedServices(prev =>
          prev.map(s =>
            s._id === service._id
              ? { ...s, quantity: s.quantity + 1 }
              : s
          )
        );
      }
    } else {
      const newService: SelectedService = {
        ...service,
        quantity: 1,
        selectedOptions: {}
      };

      // For airport pickup, show options immediately
      if (service.category === 'airport_pickup') {
        setShowAirportOptions(service._id);
      }

      setSelectedServices(prev => [...prev, newService]);
    }
  };

  const updateServiceOptions = (serviceId: string, options: SelectedService['selectedOptions']) => {
    setSelectedServices(prev =>
      prev.map(s =>
        s._id === serviceId
          ? { ...s, selectedOptions: { ...s.selectedOptions, ...options } }
          : s
      )
    );
  };

  const removeService = (serviceId: string) => {
    const existingService = selectedServices.find(s => s._id === serviceId);
    if (existingService && existingService.quantity > 1) {
      setSelectedServices(prev =>
        prev.map(s =>
          s._id === serviceId
            ? { ...s, quantity: s.quantity - 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => prev.filter(s => s._id !== serviceId));
    }
  };

  const getTotalAmount = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.price * service.quantity);
    }, 0);
  };

  const handleBookServices = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }
    if (!selectedDate) {
      alert('Please select a service date');
      return;
    }

    // Store booking data in localStorage
    const bookingData = {
      services: selectedServices,
      date: selectedDate,
      totalAmount: getTotalAmount(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('servicesBookingData', JSON.stringify(bookingData));

    // Redirect to booking details
    router.push('/services/booking/details');
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const ServiceIcon = getServiceIcon(service.category);
    const selectedService = selectedServices.find(s => s._id === service._id);
    const quantity = selectedService?.quantity || 0;

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            {/* Service Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl">
                  <ServiceIcon className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-gray-300">{service.description}</p>
                </div>
              </div>

              {/* Duration */}
              {service.duration && (
                <div className="flex items-center gap-2 mb-4 text-gray-300">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">Duration: {service.duration}</span>
                </div>
              )}

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {service.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="inline-block bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl px-4 py-2 mb-4">
                <div className="text-2xl font-bold text-orange-400">
                  {formatPrice(service.price, service.priceUnit)}
                </div>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="ml-8">
              {quantity > 0 ? (
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-3">Selected</div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                    <button
                      onClick={() => removeService(service._id)}
                      className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center text-red-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xl font-bold text-white w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => addService(service)}
                      disabled={quantity >= (service.maxQuantity || 10)}
                      className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-gray-500 text-xs mt-2">
                    Max: {service.maxQuantity || 10}
                  </div>
                  {quantity > 0 && (
                    <div className="text-orange-400 font-semibold text-sm mt-2">
                      Total: ₹{(service.price * quantity).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => addService(service)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Add Service
                </button>
              )}
            </div>
          </div>

          {/* Airport Pickup Options */}
          {service.category === 'airport_pickup' && quantity > 0 && (
            <div className="border-t border-white/20 pt-6 mt-6">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Plane className="w-4 h-4 text-orange-400" />
                Pickup Details
              </h4>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Airport Selection */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Select Airport</label>
                  <select
                    value={selectedService?.selectedOptions?.airport || ''}
                    onChange={(e) => updateServiceOptions(service._id, { airport: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:outline-none"
                  >
                    <option value="" className="bg-gray-800">Choose airport</option>
                    <option value="trivandrum" className="bg-gray-800">Trivandrum (TRV) - 55km</option>
                    <option value="ernakulam" className="bg-gray-800">Ernakulam/Kochi (COK) - 140km</option>
                    <option value="calicut" className="bg-gray-800">Calicut (CCJ) - 200km</option>
                  </select>
                </div>

                {/* Pickup Date */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Pickup Date</label>
                  <input
                    type="date"
                    value={selectedService?.selectedOptions?.pickupDate || ''}
                    onChange={(e) => updateServiceOptions(service._id, { pickupDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>

                {/* Pickup Time */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Pickup Time</label>
                  <input
                    type="time"
                    value={selectedService?.selectedOptions?.pickupTime || ''}
                    onChange={(e) => updateServiceOptions(service._id, { pickupTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
      <Header />

      {/* Hero Section with Background */}
      <section className="relative py-32 overflow-hidden">
        <motion.div
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-purple-500/10"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Pre-title */}
            <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium uppercase tracking-wider mb-6">
              <div className="w-8 h-px bg-orange-400" />
              <span>Adventure & Services</span>
              <div className="w-8 h-px bg-orange-400" />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Premium
              <span className="block text-orange-400">Experiences</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Elevate your stay with our curated collection of luxury services and thrilling adventures,
              designed to create unforgettable memories.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="bg-gradient-to-b from-gray-900 to-slate-800">
        <div className="container mx-auto px-4 py-20">
          {/* Services Grid */}
          <div className="grid gap-8 max-w-4xl mx-auto">
            {mainServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Services Summary & Booking */}
      {selectedServices.length > 0 && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-6 items-center"
              >
                {/* Selected Services Summary */}
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h4 className="text-lg font-bold text-gray-900">
                      Selected Services ({selectedServices.length})
                    </h4>
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedServices.map(service => (
                        <div key={service._id} className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-1 min-w-fit">
                          <div className="p-1 bg-orange-100 rounded">
                            {React.createElement(getServiceIcon(service.category), { className: "w-3 h-3 text-orange-600" })}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{service.quantity}x {service.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Selection & Booking */}
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Service Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Total</div>
                    <div className="text-xl font-bold text-orange-600">
                      ₹{getTotalAmount().toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={handleBookServices}
                    disabled={selectedServices.length === 0 || !selectedDate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedServices.length === 0 && (
        <div className="bg-slate-800 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Select Your Perfect Experience</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Choose from our premium services above to create your personalized adventure package.
                Each service is designed to enhance your stay with unforgettable memories.
              </p>
            </motion.div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServicesPage;