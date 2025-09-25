'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Clock,
  Calendar,
  Star,
  Award,
  Heart,
  Sunrise,
  Sunset,
  MapPin,
  CheckCircle,
  User,
  Globe,
  DollarSign,
  BookOpen,
  Activity
} from 'lucide-react'
import Header from '../../components/Header'
import { useRouter } from 'next/navigation'
import { yogaAPI } from '../../lib/api'

interface YogaSession {
  _id: string
  type: '200hr' | '300hr'
  batchName: string
  startDate: string
  endDate: string
  capacity: number
  bookedSeats: number
  price: number
  instructor: {
    _id: string
    name: string
    bio: string
    profileImage?: string
  }
  schedule: {
    days: string[]
    time: string
  }
  isActive: boolean
  description?: string
  prerequisites: string[]
  availableSeats?: number
}

interface Teacher {
  _id: string
  name: string
  bio: string
  specializations: string[]
  experience: number
  certifications: string[]
  email: string
  phone?: string
  profileImage?: string
  isActive: boolean
  socialMedia?: {
    instagram?: string
    facebook?: string
    website?: string
  }
}

export default function YogaPage() {
  const router = useRouter()
  const [yogaSessions, setYogaSessions] = useState<YogaSession[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<YogaSession | null>(null)

  useEffect(() => {
    fetchYogaSessions()
    fetchTeachers()
  }, [])

  const fetchYogaSessions = async () => {
    try {
      const response = await yogaAPI.getAllSessions({ upcoming: 'true' })
      if (response.data.success) {
        setYogaSessions(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching yoga sessions:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await yogaAPI.getAllTeachers()
      if (response.data.success) {
        setTeachers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookSession = (session: YogaSession) => {
    // Store session data for potential future use
    localStorage.setItem('selectedYogaSession', JSON.stringify(session))
    // Redirect to external booking system
    window.open('https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala', '_blank')
  }

  const handleExternalBooking = () => {
    window.open('https://live.ipms247.com/booking/book-rooms-kshetraretreatvarkala', '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const SessionCard = ({ session }: { session: YogaSession }) => {
    const duration = Math.ceil((new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24))

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="h-64 bg-gradient-to-br from-orange-400 to-pink-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              session.type === '200hr' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {session.type} Training
            </span>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{session.capacity - session.bookedSeats}/{session.capacity} available</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.batchName}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {session.description || `${session.type} Yoga Teacher Training program with comprehensive curriculum covering asanas, pranayama, meditation, and teaching methodology.`}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Instructor: {session.instructor.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDate(session.startDate)} - {formatDate(session.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {session.schedule.days.join(', ')} at {session.schedule.time}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ₹{session.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">per person</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSession(session)}
                className="px-4 py-2 border border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => handleBookSession(session)}
                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                disabled={session.bookedSeats >= session.capacity}
              >
                {session.bookedSeats >= session.capacity ? 'Full' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-pink-600/80" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3)'
          }}
        />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-light mb-6">Yoga Sessions</h1>
            <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto leading-relaxed">
              Transform your life through authentic yoga practice in the serene environment of Kerala
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Our Yoga Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From intensive teacher training to daily practice sessions, find the perfect program for your journey
            </p>
          </motion.div>

          {yogaSessions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {yogaSessions.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No active sessions available</h3>
              <p className="text-gray-600 mb-6">Check back soon for upcoming yoga sessions and teacher training programs.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Why Choose Kshetra</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience authentic yoga in one of the world's most spiritual destinations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Certified Instructors</h3>
              <p className="text-gray-600">
                Learn from experienced, internationally certified yoga teachers with deep knowledge of traditional practices
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Perfect Location</h3>
              <p className="text-gray-600">
                Practice yoga steps away from Varkala Beach, surrounded by the natural beauty and spiritual energy of Kerala
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Holistic Approach</h3>
              <p className="text-gray-600">
                Our programs integrate asanas, pranayama, meditation, philosophy, and Ayurvedic principles for complete wellness
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      {teachers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Meet Our Teachers</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn from experienced masters who embody the true spirit of yoga
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {teachers.slice(0, 6).map((teacher, index) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    {teacher.profileImage ? (
                      <img
                        src={teacher.profileImage}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">
                          {teacher.name[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{teacher.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{teacher.experience} years experience</span>
                      <span>•</span>
                      <span>{teacher.specializations[0]}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{teacher.bio}</p>

                    {teacher.certifications.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {teacher.certifications.slice(0, 2).map((cert, i) => (
                          <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {cert}
                          </span>
                        ))}
                        {teacher.certifications.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{teacher.certifications.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Daily Schedule Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">Daily Yoga Schedule</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our regular classes or book private sessions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-orange-50 to-pink-50 p-8 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sunrise className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Morning Session</h3>
                  <p className="text-gray-600">6:30 AM - 8:00 AM</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span>Traditional Hatha Yoga</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span>Pranayama (Breathing)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span>Meditation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  <span>Perfect for all levels</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">₹1,500 per class</span>
                  <button
                    onClick={handleExternalBooking}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sunset className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Evening Session</h3>
                  <p className="text-gray-600">6:00 PM - 7:30 PM</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span>Vinyasa Flow</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span>Restorative Poses</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span>Sunset Meditation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span>Beach-side location</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">₹1,500 per class</span>
                  <button
                    onClick={handleExternalBooking}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-pink-600">
        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light mb-4">Start Your Yoga Journey Today</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Whether you're a complete beginner or experienced practitioner, we have the perfect program for you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleExternalBooking}
                className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Book Now
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedSession.batchName}</h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Details</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">{selectedSession.type} Training Program</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {formatDate(selectedSession.startDate)} - {formatDate(selectedSession.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {selectedSession.schedule.days.join(', ')} at {selectedSession.schedule.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {selectedSession.capacity - selectedSession.bookedSeats} spots available (out of {selectedSession.capacity})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Instructor: {selectedSession.instructor.name}</span>
                    </div>
                  </div>

                  {selectedSession.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600">{selectedSession.description}</p>
                    </div>
                  )}

                  {selectedSession.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                      <ul className="space-y-2">
                        {selectedSession.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      ₹{selectedSession.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-6">
                      {selectedSession.type} • {Math.ceil((new Date(selectedSession.endDate).getTime() - new Date(selectedSession.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available spots:</span>
                        <span className="font-semibold">{selectedSession.capacity - selectedSession.bookedSeats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total capacity:</span>
                        <span className="font-semibold">{selectedSession.capacity}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookSession(selectedSession)}
                      className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                      disabled={selectedSession.bookedSeats >= selectedSession.capacity}
                    >
                      {selectedSession.bookedSeats >= selectedSession.capacity ? 'Fully Booked' : 'Book This Program'}
                    </button>
                  </div>

                  {selectedSession.instructor.bio && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About Your Instructor</h3>
                      <p className="text-gray-600 text-sm">{selectedSession.instructor.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}