'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { serviceAPI } from '../../lib/api';
import { 
  Car, 
  Bike, 
  Camera, 
  Waves,
  Heart,
  Star,
  Clock,
  Users,
  MapPin,
  Phone
} from 'lucide-react';
import Header from '../../components/Header';

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  description: string;
  isActive: boolean;
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
  };
}

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await serviceAPI.getAllServices();
      const data = response.data;
      
      if (data.success) {
        setServices(data.data.services || []);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services', icon: Star },
    { id: 'transport', name: 'Transport', icon: Car },
    { id: 'addon', name: 'Activities', icon: Camera },
    { id: 'food', name: 'Food & Dining', icon: Heart },
    { id: 'yoga', name: 'Yoga & Wellness', icon: Users }
  ];

  const filteredServices = services.filter(service => {
    return selectedCategory === 'all' || service.category === selectedCategory;
  }).filter(service => service.isActive);

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'transport':
        return Car;
      case 'addon':
        return Camera;
      case 'food':
        return Heart;
      case 'yoga':
        return Users;
      default:
        return Star;
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
      case 'flat_rate':
        return basePrice;
      default:
        return basePrice;
    }
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const ServiceIcon = getServiceIcon(service.category);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <ServiceIcon className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {service.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3">
              {service.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-blue-600">
                  {formatPrice(service.price, service.priceUnit)}
                </div>
                
                {service.ageRestriction && (service.ageRestriction.minAge || service.ageRestriction.maxAge) && (
                  <div className="text-xs text-gray-500 mt-1">
                    Age: {service.ageRestriction.minAge || 0}
                    {service.ageRestriction.maxAge ? `-${service.ageRestriction.maxAge}` : '+'}
                  </div>
                )}
              </div>
              
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
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
            onClick={fetchServices}
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
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-light mb-4">Our Services</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Enhance your stay with our curated selection of experiences and amenities
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="space-y-6">
            {filteredServices.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-xl mb-2">No services found</div>
            <p className="text-gray-600">
              {selectedCategory !== 'all' 
                ? 'Try selecting a different category' 
                : 'Services are being updated. Please check back later.'
              }
            </p>
          </div>
        )}

        {/* Featured Services Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Popular Services
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Car className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Airport Transfer</h3>
              <p className="text-sm text-gray-600 mb-3">
                Hassle-free pickup and drop service
              </p>
              <div className="text-lg font-bold text-blue-600">₹1,500</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <Bike className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Bike Rental</h3>
              <p className="text-sm text-gray-600 mb-3">
                Explore Kerala on two wheels
              </p>
              <div className="text-lg font-bold text-green-600">₹500/day</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sightseeing</h3>
              <p className="text-sm text-gray-600 mb-3">
                Guided tours to local attractions
              </p>
              <div className="text-lg font-bold text-purple-600">₹1,500</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <Waves className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Surfing Lessons</h3>
              <p className="text-sm text-gray-600 mb-3">
                Professional surfing instruction
              </p>
              <div className="text-lg font-bold text-orange-600">₹2,000</div>
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center"
        >
          <h2 className="text-2xl font-semibold mb-4">Need Help Choosing?</h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Our team is here to help you select the perfect services for your stay. 
            Contact us for personalized recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>+91-XXXXXXXXXX</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Kshetra Retreat, Kerala</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ServicesPage;