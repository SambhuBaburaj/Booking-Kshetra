'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Users,
  Activity,
  Heart,
  BookOpen,
  MapPin,
  Building
} from 'lucide-react'
import Header from '../../../../components/Header'

// Session types for different bookings
type SessionData = {
  id: string
  name: string
  type: 'program' | 'daily_regular' | 'daily_therapy'
  price: number
  duration: string
  description: string
  schedule?: string
  instructor?: string
  startDate?: string
  endDate?: string
}

type FormData = {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  experience: 'beginner' | 'intermediate' | 'advanced'
}

export default function YogaBookingDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') || ''
  const sessionType = searchParams.get('type') || 'program'

  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    experience: 'beginner'
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    // Create session data based on type and ID
    let session: SessionData

    if (sessionType === 'daily') {
      // Handle daily yoga sessions
      if (sessionId.includes('regular')) {
        const timeSlots = {
          'regular-730': '7:30 AM - 9:00 AM',
          'regular-900': '9:00 AM - 10:30 AM',
          'regular-400': '4:00 PM - 5:30 PM'
        }
        session = {
          id: sessionId,
          name: 'Regular Yoga Session',
          type: 'daily_regular',
          price: 500,
          duration: '1.5 hours',
          description: 'Traditional Hatha Yoga, Pranayama (Breathing), Meditation Practice - Perfect for all levels',
          schedule: timeSlots[sessionId as keyof typeof timeSlots] || 'Selected time slot',
          instructor: 'Daily Session Instructor'
        }
      } else {
        // Therapy sessions
        const timeSlots = {
          'therapy-1100': '11:00 AM - 12:30 PM',
          'therapy-530': '5:30 PM - 7:00 PM'
        }
        session = {
          id: sessionId,
          name: 'Yoga Therapy Session',
          type: 'daily_therapy',
          price: 1500,
          duration: '1.5 hours',
          description: 'Personalized therapy approach, Healing-focused practices, One-on-one guidance, Therapeutic techniques',
          schedule: timeSlots[sessionId as keyof typeof timeSlots] || 'Selected time slot',
          instructor: 'Therapy Session Instructor'
        }
      }
    } else {
      // Handle program sessions (mock data since you said don't worry about API)
      session = {
        id: sessionId,
        name: sessionId.includes('200hr') ? '200 Hour Teacher Training' : '300 Hour Advanced Training',
        type: 'program',
        price: sessionId.includes('200hr') ? 45000 : 75000,
        duration: sessionId.includes('200hr') ? '21 days' : '30 days',
        description: 'Comprehensive yoga teacher training program with ancient wisdom and modern techniques',
        instructor: 'Master Yoga Teacher',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        endDate: new Date(Date.now() + (sessionId.includes('200hr') ? 28 : 37) * 24 * 60 * 60 * 1000).toISOString()
      }
    }

    setSessionData(session)
    setLoading(false)
  }, [sessionId, sessionType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'PIN code must be 6 digits'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }
    
    // Store booking data in localStorage for payment page
    const bookingData = {
      session: sessionData,
      user: formData,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('yogaBookingData', JSON.stringify(bookingData))

    // Redirect to payment
    router.push('/yoga/booking/payment')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-300">Session not found</p>
          </div>
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
          {/* Session Details Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 h-fit"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Your Selection</h3>

              <div className="space-y-6">
                {/* Session Icon */}
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl mx-auto">
                  {sessionData.type === 'program' ? (
                    <BookOpen className="w-10 h-10 text-white" />
                  ) : sessionData.type === 'daily_therapy' ? (
                    <Heart className="w-10 h-10 text-white" />
                  ) : (
                    <Activity className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Session Info */}
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-white mb-2">{sessionData.name}</h4>
                  <p className="text-gray-300 text-sm mb-4">{sessionData.description}</p>
                </div>

                {/* Session Details */}
                <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-white font-medium">Duration</p>
                      <p className="text-gray-300 text-sm">{sessionData.duration}</p>
                    </div>
                  </div>

                  {sessionData.schedule && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Schedule</p>
                        <p className="text-gray-300 text-sm">{sessionData.schedule}</p>
                      </div>
                    </div>
                  )}

                  {sessionData.startDate && sessionData.endDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Program Dates</p>
                        <p className="text-gray-300 text-sm">
                          {formatDate(sessionData.startDate)} - {formatDate(sessionData.endDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {sessionData.instructor && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Instructor</p>
                        <p className="text-gray-300 text-sm">{sessionData.instructor}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl p-6 text-center">
                  <p className="text-gray-300 text-sm mb-2">Total Amount</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(sessionData.price)}</p>
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
                  onClick={() => router.push('/yoga')}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Booking Details</h1>
                  <p className="text-gray-300">Complete your information to proceed</p>
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

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                      errors.address ? 'border-red-400' : ''
                    }`}
                    placeholder="Enter your complete address"
                  />
                  {errors.address && <p className="text-red-400 text-sm mt-2">{errors.address}</p>}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <Building className="w-4 h-4 text-orange-400" />
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                        errors.city ? 'border-red-400' : ''
                      }`}
                      placeholder="Your city"
                    />
                    {errors.city && <p className="text-red-400 text-sm mt-2">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-white font-medium mb-3">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                        errors.state ? 'border-red-400' : ''
                      }`}
                      placeholder="Your state"
                    />
                    {errors.state && <p className="text-red-400 text-sm mt-2">{errors.state}</p>}
                  </div>
                </div>

                {/* PIN Code */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 ${
                      errors.pincode ? 'border-red-400' : ''
                    }`}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-red-400 text-sm mt-2">{errors.pincode}</p>}
                </div>

                {/* Experience */}
                <div>
                  <label className="flex items-center gap-2 text-white font-medium mb-3">
                    <Activity className="w-4 h-4 text-orange-400" />
                    Yoga Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                  >
                    <option value="beginner" className="bg-gray-800 text-white">Beginner</option>
                    <option value="intermediate" className="bg-gray-800 text-white">Intermediate</option>
                    <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/yoga')}
                    className="flex-1 px-6 py-3 border border-gray-400 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Back to Yoga
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