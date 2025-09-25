'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Phone,
  Utensils,
  TreePine,
  Compass
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

// Static services data
const staticServices: Service[] = [
  // Transport Services
  {
    _id: "1",
    name: "Kochi Airport Transfer",
    category: "transport",
    price: 1500,
    priceUnit: "flat_rate",
    description: "Comfortable pickup and drop service from Kochi International Airport (140km, 3 hours)",
    isActive: true
  },
  {
    _id: "2",
    name: "Trivandrum Airport Transfer",
    category: "transport",
    price: 1200,
    priceUnit: "flat_rate",
    description: "Convenient transfer service from Trivandrum Airport (55km, 1.5 hours)",
    isActive: true
  },
  {
    _id: "3",
    name: "Bike Rental",
    category: "transport",
    price: 500,
    priceUnit: "per_day",
    description: "Explore Kerala's scenic beauty on well-maintained motorcycles and scooters",
    isActive: true
  },
  {
    _id: "4",
    name: "Local Transportation",
    category: "transport",
    price: 300,
    priceUnit: "flat_rate",
    description: "Local taxi service for trips within 10km radius",
    isActive: true
  },
  // Adventure Activities
  {
    _id: "5",
    name: "Surfing Lessons",
    category: "addon",
    price: 2000,
    priceUnit: "per_session",
    description: "Professional surfing instruction at world-famous Varkala Beach with equipment included",
    isActive: true
  },
  {
    _id: "6",
    name: "Paragliding",
    category: "addon",
    price: 3500,
    priceUnit: "per_person",
    description: "Thrilling 15-minute tandem paragliding flight over the coastal cliffs",
    isActive: true
  },
  {
    _id: "7",
    name: "Beach Volleyball",
    category: "addon",
    price: 500,
    priceUnit: "per_session",
    description: "Beach volleyball court with equipment provided for group activities",
    isActive: true
  },
  // Wellness Services
  {
    _id: "8",
    name: "Ayurvedic Massage",
    category: "yoga",
    price: 2500,
    priceUnit: "per_session",
    description: "Traditional 60-minute Ayurvedic massage using authentic oils and techniques",
    isActive: true
  },
  {
    _id: "9",
    name: "Meditation Sessions",
    category: "yoga",
    price: 800,
    priceUnit: "per_session",
    description: "Guided 45-minute meditation sessions for inner peace and mindfulness",
    isActive: true
  },
  {
    _id: "10",
    name: "Private Yoga Classes",
    category: "yoga",
    price: 3000,
    priceUnit: "per_session",
    description: "Personalized 90-minute one-on-one yoga instruction tailored to your level",
    isActive: true
  },
  // Cultural Tours
  {
    _id: "11",
    name: "Varkala Temple Tour",
    category: "addon",
    price: 1200,
    priceUnit: "per_person",
    description: "3-hour guided tour of ancient temples and historical sites in Varkala",
    isActive: true
  },
  {
    _id: "12",
    name: "Backwater Cruise",
    category: "addon",
    price: 2800,
    priceUnit: "per_person",
    description: "4-hour traditional houseboat cruise through Kerala's scenic backwaters",
    isActive: true
  },
  {
    _id: "13",
    name: "Local Market Visit",
    category: "addon",
    price: 800,
    priceUnit: "per_person",
    description: "2-hour guided tour of local spice markets and handicraft shops",
    isActive: true
  },
  // Food Services
  {
    _id: "14",
    name: "Cooking Class",
    category: "food",
    price: 1500,
    priceUnit: "per_person",
    description: "Learn to prepare traditional Kerala cuisine with our expert chefs",
    isActive: true
  },
  {
    _id: "15",
    name: "Special Dinner",
    category: "food",
    price: 1800,
    priceUnit: "per_person",
    description: "Romantic candlelight dinner with traditional Kerala delicacies",
    isActive: true
  }
];

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Services', icon: Star },
    { id: 'transport', name: 'Transport', icon: Car },
    { id: 'addon', name: 'Activities', icon: Camera },
    { id: 'food', name: 'Food & Dining', icon: Heart },
    { id: 'yoga', name: 'Yoga & Wellness', icon: Users }
  ];

  const filteredServices = staticServices.filter(service => {
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
              
              <button
                onClick={() => window.open('https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala', '_blank')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };


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
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-shadow">
              <Car className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Airport Transfer</h3>
              <p className="text-sm text-gray-600 mb-3">
                Hassle-free pickup and drop service from Kochi/Trivandrum airports
              </p>
              <div className="text-lg font-bold text-blue-600 mb-3">₹1,500</div>
              <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Book Transfer
              </button>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-shadow">
              <Bike className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Bike Rental</h3>
              <p className="text-sm text-gray-600 mb-3">
                Explore Kerala's scenic beauty on two wheels with our well-maintained bikes
              </p>
              <div className="text-lg font-bold text-green-600 mb-3">₹500/day</div>
              <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                Rent Bike
              </button>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-shadow">
              <Camera className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Local Sightseeing</h3>
              <p className="text-sm text-gray-600 mb-3">
                Guided tours to temples, backwaters, and cultural attractions
              </p>
              <div className="text-lg font-bold text-purple-600 mb-3">₹1,500</div>
              <button className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                Book Tour
              </button>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:shadow-lg transition-shadow">
              <Waves className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Surfing Lessons</h3>
              <p className="text-sm text-gray-600 mb-3">
                Professional surfing instruction at world-famous Varkala Beach
              </p>
              <div className="text-lg font-bold text-orange-600 mb-3">₹2,000</div>
              <button className="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors">
                Book Lesson
              </button>
            </div>
          </div>
        </motion.section>

        {/* Detailed Services Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">
            Complete Service Portfolio
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Transport Services */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Car className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Transport Services</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Kochi Airport Transfer</h4>
                    <p className="text-sm text-gray-600">140km • 3 hours</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">₹1,500</div>
                    <div className="text-xs text-gray-500">one way</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Trivandrum Airport Transfer</h4>
                    <p className="text-sm text-gray-600">55km • 1.5 hours</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">₹1,200</div>
                    <div className="text-xs text-gray-500">one way</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Local Transportation</h4>
                    <p className="text-sm text-gray-600">Within 10km radius</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">₹300</div>
                    <div className="text-xs text-gray-500">per trip</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adventure Activities */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Waves className="w-8 h-8 text-orange-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Adventure & Sports</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Surfing Lessons</h4>
                    <p className="text-sm text-gray-600">2 hours • Equipment included</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">₹2,000</div>
                    <div className="text-xs text-gray-500">per session</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Paragliding</h4>
                    <p className="text-sm text-gray-600">15 minutes • Tandem flight</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">₹3,500</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Beach Volleyball</h4>
                    <p className="text-sm text-gray-600">1 hour • Equipment provided</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">₹500</div>
                    <div className="text-xs text-gray-500">per hour</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wellness Services */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Wellness & Spa</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Ayurvedic Massage</h4>
                    <p className="text-sm text-gray-600">60 minutes • Traditional oils</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-pink-600">₹2,500</div>
                    <div className="text-xs text-gray-500">per session</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Meditation Sessions</h4>
                    <p className="text-sm text-gray-600">45 minutes • Guided practice</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-pink-600">₹800</div>
                    <div className="text-xs text-gray-500">per session</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Yoga Private Class</h4>
                    <p className="text-sm text-gray-600">90 minutes • One-on-one</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-pink-600">₹3,000</div>
                    <div className="text-xs text-gray-500">per session</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Experiences */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <Camera className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-semibold text-gray-900">Cultural Tours</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Varkala Temple Tour</h4>
                    <p className="text-sm text-gray-600">3 hours • Historical sites</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">₹1,200</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Backwater Cruise</h4>
                    <p className="text-sm text-gray-600">4 hours • Traditional houseboat</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">₹2,800</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Local Market Visit</h4>
                    <p className="text-sm text-gray-600">2 hours • Spice & handicrafts</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">₹800</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                </div>
              </div>
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