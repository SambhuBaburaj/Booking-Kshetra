'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Star,
  Instagram,
  Facebook,
  Twitter
} from 'lucide-react'
import Header from '../../components/Header'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 1500)
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
            <h1 className="text-4xl md:text-5xl font-light mb-4">Get in Touch</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              We're here to help you plan your perfect retreat at Kshetra Resort
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-6">Contact Information</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Located in the serene coastal town of Varkala, Kerala, Kshetra Retreat Resort
                offers you a perfect blend of spirituality, adventure, and relaxation.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">
                      88 Varkala Beach Road<br />
                      Varkala, Kerala 695141<br />
                      India
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+91 98470 12345</p>
                    <p className="text-gray-600">+91 94470 67890</p>
                    <p className="text-sm text-gray-500 mt-1">Available 24/7</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@kshetraretreat.com</p>
                    <p className="text-gray-600">bookings@kshetraretreat.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Operating Hours</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Check-in: 2:00 PM onwards</p>
                      <p>Check-out: 11:00 AM</p>
                      <p>Reception: 24/7</p>
                      <p>Yoga Sessions: 6:00 AM & 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </a>
                <a href="#" className="p-3 bg-pink-100 rounded-lg hover:bg-pink-200 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-600" />
                </a>
                <a href="#" className="p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                  <Twitter className="w-5 h-5 text-blue-600" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-xl shadow-sm"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-light text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600">We'll get back to you within 24 hours</p>
            </div>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thank you for contacting us. We'll respond within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Room Booking</option>
                      <option value="yoga">Yoga Programs</option>
                      <option value="services">Additional Services</option>
                      <option value="group">Group Booking</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please describe your inquiry or requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-white rounded-xl shadow-sm p-8"
        >
          <h2 className="text-3xl font-light text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What is the cancellation policy?</h3>
                <p className="text-gray-600 text-sm">
                  Free cancellation up to 24 hours before check-in. After that, one night's stay will be charged.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you provide airport transfers?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, we offer pickup and drop services from Kochi and Trivandrum airports at ₹1,500.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are meals included?</h3>
                <p className="text-gray-600 text-sm">
                  We offer various meal plans. Please check with our team for current packages and pricing.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What yoga programs do you offer?</h3>
                <p className="text-gray-600 text-sm">
                  We offer 200hr and 300hr yoga teacher training programs, daily yoga sessions, and personalized instruction.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is WiFi available?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, complimentary WiFi is available throughout the resort premises.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What's nearby?</h3>
                <p className="text-gray-600 text-sm">
                  We're located near Varkala Beach, cliff-top temples, and local markets. Perfect for surfing and sightseeing.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light mb-4">What Our Guests Say</h2>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xl opacity-90">4.8/5 based on 200+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm opacity-90 mb-3">
                "Amazing yoga retreat experience! The location is perfect and the instructors are world-class."
              </p>
              <p className="font-semibold">- Sarah M., USA</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm opacity-90 mb-3">
                "Peaceful, clean, and well-organized. The staff went above and beyond to make our stay comfortable."
              </p>
              <p className="font-semibold">- Raj P., Mumbai</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm opacity-90 mb-3">
                "Perfect location near the beach. The sunset views and yoga sessions were unforgettable."
              </p>
              <p className="font-semibold">- Emma L., UK</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}