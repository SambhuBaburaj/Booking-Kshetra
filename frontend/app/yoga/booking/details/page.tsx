'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  UserCheck,
  Heart,
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Users
} from 'lucide-react'
import Header from '../../../../components/Header'
import { useYogaBooking, YogaSession, UserDetails } from '../../../../contexts/YogaBookingContext'
import { yogaAPI } from '../../../../lib/api'

export default function YogaBookingDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')

  const { state, setSession, setUserDetails, setStep } = useYogaBooking()
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<YogaSession[]>([])
  const [formData, setFormData] = useState<UserDetails>(state.userDetails)
  const [errors, setErrors] = useState<Partial<UserDetails>>({})
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Prevent running if already redirecting
    if (redirecting) return

    const fetchData = async () => {
      console.log('Fetching data for session:', sessionId)

      if (!sessionId) {
        console.log('No sessionId provided, redirecting to yoga')
        if (!redirecting) {
          setRedirecting(true)
          setTimeout(() => router.push('/yoga'), 100)
        }
        return
      }

      try {
        // Handle special session IDs for morning/evening classes first
        if (sessionId === 'morning_class' || sessionId === 'evening_class') {
          console.log('Creating mock session for:', sessionId)
          const mockSession: YogaSession = {
            _id: sessionId,
            type: '200hr',
            batchName: sessionId === 'morning_class' ? 'Morning Yoga Class' : 'Evening Yoga Class',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 90 minutes
            capacity: 25,
            bookedSeats: 5,
            price: 1500,
            instructor: {
              _id: 'instructor1',
              name: 'Daily Instructor',
              bio: 'Experienced yoga instructor'
            },
            schedule: {
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              time: sessionId === 'morning_class' ? '6:30 AM' : '6:00 PM'
            },
            isActive: true,
            description: `${sessionId === 'morning_class' ? 'Morning' : 'Evening'} yoga class for all levels`,
            prerequisites: []
          }
          setSession(mockSession)
          setLoading(false)
          return
        }

        console.log('Fetching sessions from API...')
        const response = await yogaAPI.getAllSessions({ upcoming: 'true' })
        console.log('API response:', response.data)

        if (response.data.success) {
          const sessionsData = response.data.data
          setSessions(sessionsData)

          const selectedSession = sessionsData.find((s: YogaSession) => s._id === sessionId)
          if (selectedSession) {
            console.log('Found session:', selectedSession)
            setSession(selectedSession)
          } else {
            console.log('Session not found, redirecting to yoga')
            if (!redirecting) {
              setRedirecting(true)
              setTimeout(() => router.push('/yoga'), 100)
            }
            return
          }
        } else {
          console.log('API response unsuccessful:', response.data)
          if (!redirecting) {
            setRedirecting(true)
            setTimeout(() => router.push('/yoga'), 100)
          }
          return
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        if (!redirecting) {
          setRedirecting(true)
          setTimeout(() => router.push('/yoga'), 100)
        }
        return
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    setStep('details')
  }, [sessionId, router, redirecting])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof UserDetails]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<UserDetails> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid'
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required'
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setUserDetails(formData)
    router.push('/yoga/booking/services')
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  if (!state.selectedSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Session not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-orange-600">Details</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-gray-500">Services</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Session Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Selection</h3>

              <div className="space-y-4">
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-900">
                      {state.selectedSession.type === '200hr' ? state.selectedSession.type + ' Training' : state.selectedSession.batchName}
                    </span>
                  </div>

                  <p className="text-sm text-orange-800 mb-3">
                    {state.selectedSession.batchName}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-orange-600" />
                      <span className="text-orange-700">
                        {formatDate(state.selectedSession.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <span className="text-orange-700">
                        Time: {state.selectedSession.schedule.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-orange-600" />
                      <span className="text-orange-700">
                        Instructor: {state.selectedSession.instructor.name}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-orange-200 mt-4 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700">Program Fee</span>
                      <span className="font-semibold text-orange-900">
                        {formatCurrency(state.selectedSession.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <p>✓ Additional services can be added in the next step</p>
                  <p>✓ Secure payment with Razorpay</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/yoga')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Personal Details</h1>
                    <p className="text-gray-600">Please provide your information for the booking</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" />
                    Personal Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+91 9999999999"
                      />
                      {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yoga Experience
                      </label>
                      <select
                        name="yogaExperience"
                        value={formData.yogaExperience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="teacher">Yoga Teacher</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-orange-600" />
                    Emergency Contact
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.emergencyContact ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Contact person name"
                      />
                      {errors.emergencyContact && <p className="text-red-600 text-xs mt-1">{errors.emergencyContact}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          errors.emergencyPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+91 9999999999"
                      />
                      {errors.emergencyPhone && <p className="text-red-600 text-xs mt-1">{errors.emergencyPhone}</p>}
                    </div>
                  </div>
                </div>

                {/* Health & Preferences */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-600" />
                    Health & Preferences
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical Conditions / Injuries
                      </label>
                      <textarea
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Please mention any medical conditions, injuries, or physical limitations we should know about"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dietary Requirements
                        </label>
                        <input
                          type="text"
                          name="dietaryRequirements"
                          value={formData.dietaryRequirements}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Vegetarian, vegan, allergies, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accommodation Preference
                        </label>
                        <select
                          name="accommodationNeeds"
                          value={formData.accommodationNeeds}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="shared">Shared Room</option>
                          <option value="private">Private Room</option>
                          <option value="dormitory">Dormitory</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Any special requests or additional information"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/yoga')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Yoga
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    Continue to Services
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