'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Car,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Plane,
  CheckCircle,
  ArrowRight,
  Users,
  Shield,
  Star,
  ChevronDown
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

interface TransportBooking {
  pickup: boolean
  drop: boolean
  pickupDetails?: {
    flightNumber?: string
    arrivalTime?: string
    terminal?: 'T1' | 'T2' | 'T3'
  }
  dropDetails?: {
    flightNumber?: string
    departureTime?: string
    terminal?: 'T1' | 'T2' | 'T3'
  }
  airportLocation: 'kochi' | 'trivandrum'
}


export default function AirportTransportPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<TransportBooking>({
    pickup: false,
    drop: false,
    airportLocation: 'kochi'
  })


  const [totalAmount, setTotalAmount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateTotal = () => {
    let total = 0
    if (bookingData.pickup) total += 1500
    if (bookingData.drop) total += 1500
    setTotalAmount(total)
  }

  // Calculate total on component mount and when bookingData changes
  useEffect(() => {
    calculateTotal()
  }, [bookingData.pickup, bookingData.drop])

  const handlePickupChange = (enabled: boolean) => {
    setBookingData(prev => ({
      ...prev,
      pickup: enabled,
      pickupDetails: enabled ? (prev.pickupDetails || {}) : undefined
    }))
  }

  const handleDropChange = (enabled: boolean) => {
    setBookingData(prev => ({
      ...prev,
      drop: enabled,
      dropDetails: enabled ? (prev.dropDetails || {}) : undefined
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Prepare booking data
    const completeBookingData = {
      ...bookingData,
      totalAmount
    }

    console.log('Submitting booking data:', completeBookingData) // Debug log

    // Store booking data in localStorage for payment page
    localStorage.setItem('airportTransportBooking', JSON.stringify(completeBookingData))

    // Redirect to payment page
    router.push('/airport-transport/payment')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Car className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Airport Transportation</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Seamless Airport
              <span className="block text-purple-200">Transport Service</span>
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Professional airport pickup and drop services with flight tracking,
              terminal selection, and comfortable vehicles. Travel with peace of mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Drivers</h3>
              <p className="text-gray-600">Licensed, experienced drivers with airport pickup expertise</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flight Tracking</h3>
              <p className="text-gray-600">Real-time flight monitoring and delay notifications</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Meet & Greet</h3>
              <p className="text-gray-600">Personal assistance at arrivals with name board</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Transfer</h2>
              <p className="text-xl text-gray-600">
                Select your services and provide flight details for seamless transfers
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
              {/* Airport Selection */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Select Airport</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    bookingData.airportLocation === 'kochi'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="airport"
                      value="kochi"
                      checked={bookingData.airportLocation === 'kochi'}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        airportLocation: e.target.value as 'kochi' | 'trivandrum'
                      }))}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Plane className="w-6 h-6 text-purple-600" />
                        <h4 className="text-lg font-semibold">Kochi Airport (COK)</h4>
                      </div>
                      <p className="text-gray-600">Cochin International Airport</p>
                      <p className="text-sm text-gray-500 mt-1">Distance: ~45 km from resort</p>
                    </div>
                    {bookingData.airportLocation === 'kochi' && (
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    )}
                  </label>

                  <label className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    bookingData.airportLocation === 'trivandrum'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="airport"
                      value="trivandrum"
                      checked={bookingData.airportLocation === 'trivandrum'}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        airportLocation: e.target.value as 'kochi' | 'trivandrum'
                      }))}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Plane className="w-6 h-6 text-purple-600" />
                        <h4 className="text-lg font-semibold">Trivandrum Airport (TRV)</h4>
                      </div>
                      <p className="text-gray-600">Thiruvananthapuram International Airport</p>
                      <p className="text-sm text-gray-500 mt-1">Distance: ~55 km from resort</p>
                    </div>
                    {bookingData.airportLocation === 'trivandrum' && (
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    )}
                  </label>
                </div>
              </div>

              {/* Service Selection */}
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Select Services</h3>

                {/* Pickup Service */}
                <div className="mb-6">
                  <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="checkbox"
                      checked={bookingData.pickup}
                      onChange={(e) => handlePickupChange(e.target.checked)}
                      className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-6 h-6 text-purple-600" />
                        <h4 className="text-lg font-semibold">Airport Pickup Service</h4>
                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">₹1,500</span>
                      </div>
                      <p className="text-gray-600">Professional pickup service from airport to resort</p>
                    </div>
                  </label>

                  {bookingData.pickup && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-6 bg-gray-50 rounded-lg"
                    >
                      <h5 className="font-semibold text-gray-900 mb-4">Pickup Details</h5>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Flight Number
                          </label>
                          <input
                            type="text"
                            value={bookingData.pickupDetails?.flightNumber || ''}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              pickupDetails: {
                                ...prev.pickupDetails,
                                flightNumber: e.target.value
                              }
                            }))}
                            placeholder="AI123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Arrival Time
                          </label>
                          <input
                            type="datetime-local"
                            value={bookingData.pickupDetails?.arrivalTime || ''}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              pickupDetails: {
                                ...prev.pickupDetails,
                                arrivalTime: e.target.value
                              }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Terminal
                          </label>
                          <div className="relative">
                            <select
                              value={bookingData.pickupDetails?.terminal || ''}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                pickupDetails: {
                                  ...prev.pickupDetails,
                                  terminal: e.target.value as 'T1' | 'T2' | 'T3'
                                }
                              }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 appearance-none"
                            >
                              <option value="">Select Terminal</option>
                              <option value="T1">Terminal 1</option>
                              <option value="T2">Terminal 2</option>
                              <option value="T3">Terminal 3</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Drop Service */}
                <div className="mb-6">
                  <label className="flex items-center p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                    <input
                      type="checkbox"
                      checked={bookingData.drop}
                      onChange={(e) => handleDropChange(e.target.checked)}
                      className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-6 h-6 text-purple-600" />
                        <h4 className="text-lg font-semibold">Airport Drop Service</h4>
                        <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">₹1,500</span>
                      </div>
                      <p className="text-gray-600">Safe drop service from resort to airport</p>
                    </div>
                  </label>

                  {bookingData.drop && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-6 bg-gray-50 rounded-lg"
                    >
                      <h5 className="font-semibold text-gray-900 mb-4">Drop Details</h5>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Flight Number
                          </label>
                          <input
                            type="text"
                            value={bookingData.dropDetails?.flightNumber || ''}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              dropDetails: {
                                ...prev.dropDetails,
                                flightNumber: e.target.value
                              }
                            }))}
                            placeholder="AI456"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Departure Time
                          </label>
                          <input
                            type="datetime-local"
                            value={bookingData.dropDetails?.departureTime || ''}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              dropDetails: {
                                ...prev.dropDetails,
                                departureTime: e.target.value
                              }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Terminal
                          </label>
                          <div className="relative">
                            <select
                              value={bookingData.dropDetails?.terminal || ''}
                              onChange={(e) => setBookingData(prev => ({
                                ...prev,
                                dropDetails: {
                                  ...prev.dropDetails,
                                  terminal: e.target.value as 'T1' | 'T2' | 'T3'
                                }
                              }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 appearance-none"
                            >
                              <option value="">Select Terminal</option>
                              <option value="T1">Terminal 1</option>
                              <option value="T2">Terminal 2</option>
                              <option value="T3">Terminal 3</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Show Drop Option hint when only pickup is selected */}
                {bookingData.pickup && !bookingData.drop && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-600" />
                      <p className="text-blue-800">
                        <strong>Tip:</strong> You can also add drop service for your return journey!
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>


              {/* Summary and Submit */}
              {(bookingData.pickup || bookingData.drop) && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-8"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-gray-600">
                        {bookingData.pickup && <p>✓ Airport Pickup - ₹1,500</p>}
                        {bookingData.drop && <p>✓ Airport Drop - ₹1,500</p>}
                        <p className="font-semibold text-gray-900">
                          Total Amount: ₹{totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || (!bookingData.pickup && !bookingData.drop)}
                      className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Service Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Transport Service?</h2>
              <p className="text-lg text-gray-600">
                Professional, reliable, and comfortable airport transfers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Features</h3>
                <ul className="space-y-3">
                  {[
                    'Professional drivers with airport experience',
                    'Real-time flight tracking and delay notifications',
                    'Meet and greet service at arrivals',
                    'Comfortable, air-conditioned vehicles',
                    '24/7 customer support',
                    'Fixed pricing with no hidden charges'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Car className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Sedan (1-4 passengers)</h4>
                      <p className="text-sm text-gray-600">Comfortable sedan with AC and luggage space</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">SUV (5-7 passengers)</h4>
                      <p className="text-sm text-gray-600">Spacious SUV for larger groups and extra luggage</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800">
                      <strong>Note:</strong> Vehicle will be assigned based on group size and availability.
                      All vehicles are sanitized and well-maintained.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Our team is available 24/7 to assist you with your transport booking
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+919847012345" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                  <Phone className="w-5 h-5" />
                  +91 98470 12345
                </a>
                <a href="mailto:transport@kshetraretreat.com" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                  <Mail className="w-5 h-5" />
                  transport@kshetraretreat.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}