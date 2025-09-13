'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Star } from 'lucide-react'
import Header from '../components/Header'
import BookingWidget from '../components/BookingWidget'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-black/60 to-black/40">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80')`
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* Star Rating */}
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-gold-400 text-gold-400" />
              ))}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide">
              Book Your Dream Hotel
            </h1>
            <h2 className="text-3xl md:text-4xl font-light mb-8 opacity-90">
              With Kshetra
            </h2>
            
            <p className="text-xl md:text-2xl font-light opacity-80 max-w-2xl mx-auto leading-relaxed">
              Experience the perfect blend of luxury, tranquility, and adventure at Kerala's most serene retreat
            </p>
          </motion.div>

          {/* Booking Widget */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <BookingWidget />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Why Choose Kshetra Retreat
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover what makes our resort the perfect destination for your next getaway
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-8 card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enhance your stay with our curated selection of experiences
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-xl"
              >
                <div className="aspect-square bg-gradient-to-br from-primary-500 to-primary-700 p-8 flex flex-col items-center justify-center text-white">
                  <service.icon className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                  <p className="text-sm text-center opacity-90">{service.description}</p>
                  <div className="mt-4 text-xl font-bold">₹{service.price}</div>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: Users,
    title: 'Authentic Yoga Experience',
    description: 'Join our certified 200hr and 300hr yoga teacher training programs in the serene environment of Kerala.'
  },
  {
    icon: Calendar,
    title: 'Flexible Booking',
    description: 'Easy online booking system with real-time availability and instant confirmation for your convenience.'
  },
  {
    icon: Star,
    title: 'Premium Amenities',
    description: 'Enjoy AC and Non-AC rooms, delicious meals, and world-class facilities designed for your comfort.'
  }
]

const services = [
  {
    icon: Users,
    name: 'Airport Transfer',
    description: 'Pickup & Drop service from Kochi/Trivandrum',
    price: '1,500'
  },
  {
    icon: Calendar,
    name: 'Bike Rental',
    description: 'Explore Kerala on two wheels',
    price: '500/day'
  },
  {
    icon: Star,
    name: 'Local Sightseeing',
    description: 'Guided tours to nearby attractions',
    price: '1,500'
  },
  {
    icon: Users,
    name: 'Surfing Lessons',
    description: 'Professional surfing instruction',
    price: '2,000'
  }
]