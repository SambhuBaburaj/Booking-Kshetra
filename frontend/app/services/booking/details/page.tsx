'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Activity,
  Car,
  Plane,
  Waves
} from 'lucide-react'
import Header from '../../../../components/Header'

// Types for services booking
interface Service {
  _id: string
  name: string
  category: 'airport_pickup' | 'vehicle_rental' | 'surfing'
  price: number
  priceUnit: string
  description: string
  duration?: string
  features: string[]
  maxQuantity?: number
  isActive: boolean
}

interface SelectedService extends Service {
  quantity: number
  selectedOptions?: {
    pickupLocation?: string
    dropLocation?: string
    rentalDays?: number
    sessionLevel?: 'beginner' | 'intermediate' | 'advanced'
  }
}

interface BookingData {
  services: SelectedService[]
  date: string
  totalAmount: number
  timestamp: string
}

interface FormData {
  name: string
  email: string
  phone: string
  specialRequests: string
}

export default function ServicesBookingDetailsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    // Get booking data from localStorage
    const storedData = localStorage.getItem('servicesBookingData')
    if (!storedData) {
      router.push('/services')
      return
    }

    try {
      const data: BookingData = JSON.parse(storedData)
      setBookingData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error parsing booking data:', error)
      router.push('/services')
    }
  }, [router])

  const getServiceIcon = (category: 'airport_pickup' | 'vehicle_rental' | 'surfing') => {
    switch (category) {
      case 'airport_pickup':
        return Plane
      case 'vehicle_rental':
        return Car
      case 'surfing':
        return Waves
      default:
        return Activity
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Store combined booking data in localStorage
    const completeBookingData = {
      services: bookingData?.services,
      date: bookingData?.date,
      totalAmount: bookingData?.totalAmount,
      user: formData,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('servicesCompleteBookingData', JSON.stringify(completeBookingData))

    // Redirect to payment
    router.push('/services/booking/payment')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-orange-400">Details</span>
            </div>
            <div className="w-16 h-px bg-orange-400"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 text-gray-400 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-gray-400">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Services Summary Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 h-fit"
            >
              <h3 className="text-2xl font-bold text-white mb-8">Your Services</h3>

              <div className="space-y-6">
                {/* Service Date */}
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Service Date</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatDate(bookingData.date)}
                  </div>
                </div>

                {/* Selected Services */}
                <div className="space-y-4">
                  {bookingData.services.map((service) => {
                    const ServiceIcon = getServiceIcon(service.category)
                    return (
                      <div key={service._id} className="bg-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl">
                            <ServiceIcon className="w-6 h-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{service.name}</h4>
                            <p className="text-gray-300 text-sm">{service.description}</p>
                          </div>
                        </div>

                        {service.duration && (
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="text-gray-300 text-sm">Duration: {service.duration}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Quantity: {service.quantity}</span>
                          <span className="text-orange-400 font-bold">
                            {formatCurrency(service.price * service.quantity)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium text-lg">Total Amount</span>
                    <span className="text-3xl font-bold text-orange-400">
                      {formatCurrency(bookingData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => router.push('/services')}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Contact Details</h1>
                  <p className="text-gray-300">Please provide your information</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <User className="w-4 h-4 text-orange-400" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                      errors.name ? 'border-red-400' : ''
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <Mail className="w-4 h-4 text-orange-400" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                      errors.email ? 'border-red-400' : ''
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <Phone className="w-4 h-4 text-orange-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                      errors.phone ? 'border-red-400' : ''
                    }`}
                    placeholder="+91 9999999999"
                  />
                  {errors.phone && <p className="text-red-400 text-sm mt-2">{errors.phone}</p>}
                </div>

                {/* Special Requests */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <Activity className="w-4 h-4 text-orange-400" />
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/services')}
                    className="flex-1 px-6 py-3 border border-gray-400 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Back to Services
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}