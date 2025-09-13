'use client'

import { useState } from 'react'
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
  Globe
} from 'lucide-react'
import Header from '../../components/Header'

interface YogaProgram {
  id: string
  title: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  price: number
  description: string
  highlights: string[]
  schedule: string[]
  includes: string[]
  instructor: string
  maxStudents: number
  image: string
}

const yogaPrograms: YogaProgram[] = [
  {
    id: '1',
    title: '200-Hour Yoga Teacher Training',
    duration: '28 Days',
    level: 'Beginner',
    price: 150000,
    description: 'Comprehensive yoga teacher training program covering asanas, pranayama, meditation, philosophy, anatomy, and teaching methodology. Perfect for beginners looking to deepen their practice or become certified instructors.',
    highlights: [
      'Yoga Alliance Certified',
      'Traditional Hatha & Vinyasa',
      'Meditation & Pranayama',
      'Yoga Philosophy & History',
      'Anatomy & Physiology',
      'Teaching Methodology'
    ],
    schedule: [
      '6:00 AM - Morning Meditation',
      '6:30 AM - Asana Practice',
      '8:30 AM - Breakfast',
      '10:00 AM - Philosophy Class',
      '12:00 PM - Lunch',
      '3:00 PM - Anatomy/Teaching',
      '5:00 PM - Pranayama',
      '6:00 PM - Evening Practice',
      '8:00 PM - Dinner'
    ],
    includes: [
      'All meals (vegetarian)',
      'Accommodation',
      'Study materials',
      'Yoga props',
      'Certificate',
      'Post-training support'
    ],
    instructor: 'Guru Rajeesh Kumar',
    maxStudents: 15,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3'
  },
  {
    id: '2',
    title: '300-Hour Advanced Teacher Training',
    duration: '35 Days',
    level: 'Advanced',
    price: 200000,
    description: 'Advanced training for certified teachers looking to deepen their knowledge and expand their teaching skills. Covers advanced asanas, adjustments, sequencing, and business aspects of yoga teaching.',
    highlights: [
      'Advanced Asana Practice',
      'Hands-on Adjustments',
      'Sequencing & Class Design',
      'Business of Yoga',
      'Ayurveda Integration',
      'Advanced Philosophy'
    ],
    schedule: [
      '5:30 AM - Personal Practice',
      '7:00 AM - Advanced Asanas',
      '9:00 AM - Breakfast',
      '10:30 AM - Philosophy/Business',
      '12:30 PM - Lunch',
      '2:30 PM - Adjustments Training',
      '4:30 PM - Teaching Practice',
      '6:00 PM - Meditation',
      '8:00 PM - Dinner'
    ],
    includes: [
      'All meals (organic)',
      'Private accommodation',
      'Advanced study materials',
      'Teaching practice sessions',
      'Business mentorship',
      'Lifetime support'
    ],
    instructor: 'Acharya Vishnu Das',
    maxStudents: 12,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3'
  },
  {
    id: '3',
    title: 'Weekly Yoga Retreat',
    duration: '7 Days',
    level: 'All Levels',
    price: 35000,
    description: 'A rejuvenating week-long retreat combining daily yoga practice, meditation, healthy meals, and free time to explore the beautiful Kerala coast.',
    highlights: [
      'Daily Yoga Classes',
      'Guided Meditation',
      'Ayurvedic Meals',
      'Beach Access',
      'Cultural Excursions',
      'Relaxation Time'
    ],
    schedule: [
      '6:30 AM - Morning Yoga',
      '8:00 AM - Breakfast',
      '10:00 AM - Free Time/Activities',
      '12:00 PM - Lunch',
      '2:00 PM - Rest/Spa Time',
      '4:00 PM - Workshop/Excursion',
      '6:00 PM - Evening Yoga',
      '7:30 PM - Dinner'
    ],
    includes: [
      'All vegetarian meals',
      'Accommodation',
      'Yoga classes',
      'Meditation sessions',
      'Local excursions',
      'Yoga props'
    ],
    instructor: 'Various Instructors',
    maxStudents: 20,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3'
  },
  {
    id: '4',
    title: 'Drop-in Yoga Classes',
    duration: '90 Minutes',
    level: 'All Levels',
    price: 1500,
    description: 'Daily yoga classes open to all levels. Perfect for guests staying at the resort or locals looking for regular practice.',
    highlights: [
      'Morning & Evening Sessions',
      'All Levels Welcome',
      'Traditional Hatha Yoga',
      'Experienced Instructors',
      'Small Group Setting',
      'Flexible Schedule'
    ],
    schedule: [
      '6:30 AM - Morning Session',
      '6:00 PM - Evening Session'
    ],
    includes: [
      'Yoga mat provided',
      'Props available',
      'Water bottle',
      'Relaxation music'
    ],
    instructor: 'Daily Instructor',
    maxStudents: 25,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3'
  }
]

const instructors = [
  {
    name: 'Guru Rajeesh Kumar',
    title: 'Lead Yoga Instructor',
    experience: '20+ years',
    specialization: 'Hatha Yoga, Meditation',
    description: 'Guru Rajeesh is a traditional yoga master from Rishikesh with over two decades of teaching experience. He specializes in classical Hatha Yoga and Vedic meditation.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3'
  },
  {
    name: 'Acharya Vishnu Das',
    title: 'Senior Yoga Teacher',
    experience: '15+ years',
    specialization: 'Ashtanga, Philosophy',
    description: 'A dedicated practitioner and teacher of Ashtanga Yoga with deep knowledge of yoga philosophy and Sanskrit texts. Known for his precise alignment and spiritual teachings.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3'
  },
  {
    name: 'Maya Krishnan',
    title: 'Yoga Instructor',
    experience: '8+ years',
    specialization: 'Vinyasa, Pranayama',
    description: 'Maya brings a modern approach to traditional yoga practices, specializing in dynamic Vinyasa flows and advanced breathing techniques.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3'
  }
]

export default function YogaPage() {
  const [selectedProgram, setSelectedProgram] = useState<YogaProgram | null>(null)

  const handleBookProgram = (program: YogaProgram) => {
    // Store selected program and redirect to booking
    localStorage.setItem('selectedYogaProgram', JSON.stringify(program))
    // In a real app, you'd redirect to booking page or open booking modal
    alert(`Booking ${program.title} - Implementation needed!`)
  }

  const ProgramCard = ({ program }: { program: YogaProgram }) => (
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
            program.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            program.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            program.level === 'Advanced' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {program.level}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Max {program.maxStudents} students</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{program.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{program.description}</p>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Instructor: {program.instructor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-orange-600">
              ₹{program.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">per person</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedProgram(program)}
              className="px-4 py-2 border border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={() => handleBookProgram(program)}
              className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

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
              From beginner-friendly classes to intensive teacher training, find the perfect program for your journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {yogaPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
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
            {instructors.map((instructor, index) => (
              <motion.div
                key={instructor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="h-64 bg-gray-200">
                  <img
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{instructor.name}</h3>
                  <p className="text-orange-600 font-medium mb-2">{instructor.title}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{instructor.experience}</span>
                    <span>•</span>
                    <span>{instructor.specialization}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{instructor.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
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
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
              <button className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                View All Programs
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">{selectedProgram.title}</h2>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Highlights</h3>
                  <ul className="space-y-2 mb-6">
                    {selectedProgram.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                  <ul className="space-y-2">
                    {selectedProgram.includes.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Daily Schedule</h3>
                  <div className="space-y-2 mb-6">
                    {selectedProgram.schedule.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      ₹{selectedProgram.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Duration: {selectedProgram.duration} • Level: {selectedProgram.level}
                    </div>
                    <button
                      onClick={() => handleBookProgram(selectedProgram)}
                      className="w-full px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Book This Program
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}