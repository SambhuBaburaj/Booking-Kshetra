'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  Car,
  Plane,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  Home,
  Clock,
  Shield,
  Star
} from 'lucide-react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

interface BookingData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    emergencyContact: {
      name: string
      phone: string
      relation: string
    }
  }
  pickup: boolean
  drop: boolean
  pickupDetails?: {
    flightNumber?: string
    arrivalTime?: string
    terminal?: string
  }
  dropDetails?: {
    flightNumber?: string
    departureTime?: string
    terminal?: string
  }
  airportLocation: string
  totalAmount: number
  paymentId: string
  orderId: string
  bookingId: string
  bookingDate: string
}

export default function SuccessPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem('lastTransportBooking')
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push('/airport-transport')
    }

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000)
  }, [router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadBookingDetails = () => {
    if (!bookingData) return

    const details = `
KSHETRA RETREAT RESORT
Airport Transport Booking Confirmation

Booking ID: ${bookingData.bookingId}
Booking Date: ${formatDateTime(bookingData.bookingDate)}
Payment ID: ${bookingData.paymentId}

GUEST DETAILS:
Name: ${bookingData.personalInfo.firstName} ${bookingData.personalInfo.lastName}
Email: ${bookingData.personalInfo.email}
Phone: ${bookingData.personalInfo.phone}
Address: ${bookingData.personalInfo.address}, ${bookingData.personalInfo.city}, ${bookingData.personalInfo.state} - ${bookingData.personalInfo.pincode}

EMERGENCY CONTACT:
Name: ${bookingData.personalInfo.emergencyContact.name}
Phone: ${bookingData.personalInfo.emergencyContact.phone}
Relation: ${bookingData.personalInfo.emergencyContact.relation}

TRANSPORT DETAILS:
Airport: ${bookingData.airportLocation === 'kochi' ? 'Kochi Airport (COK)' : 'Trivandrum Airport (TRV)'}
${bookingData.pickup ? `
PICKUP SERVICE:
${bookingData.pickupDetails?.flightNumber ? `Flight: ${bookingData.pickupDetails.flightNumber}` : ''}
${bookingData.pickupDetails?.arrivalTime ? `Arrival: ${formatDateTime(bookingData.pickupDetails.arrivalTime)}` : ''}
${bookingData.pickupDetails?.terminal ? `Terminal: ${bookingData.pickupDetails.terminal}` : ''}
Cost: ₹1,500` : ''}

${bookingData.drop ? `
DROP SERVICE:
${bookingData.dropDetails?.flightNumber ? `Flight: ${bookingData.dropDetails.flightNumber}` : ''}
${bookingData.dropDetails?.departureTime ? `Departure: ${formatDateTime(bookingData.dropDetails.departureTime)}` : ''}
${bookingData.dropDetails?.terminal ? `Terminal: ${bookingData.dropDetails.terminal}` : ''}
Cost: ₹1,500` : ''}

TOTAL AMOUNT PAID: ${formatCurrency(bookingData.totalAmount)}

For any queries, contact us at:
Phone: +91 98470 12345
Email: transport@kshetraretreat.com

Thank you for choosing Kshetra Retreat Resort!
    `

    const blob = new Blob([details], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Booking_${bookingData.bookingId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <Header />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                rotate: 0,
              }}
              animate={{
                y: window.innerHeight + 10,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "easeOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Hero */}
      <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-16 h-16 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Booking Confirmed!
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-6">
              Your airport transport has been successfully booked
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="font-semibold">Booking ID:</span>
              <span className="font-mono text-lg">{bookingData.bookingId}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Guest Information */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="w-6 h-6 text-purple-600" />
                Guest Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Personal Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {bookingData.personalInfo.firstName} {bookingData.personalInfo.lastName}</p>
                    <p><span className="font-medium">Email:</span> {bookingData.personalInfo.email}</p>
                    <p><span className="font-medium">Phone:</span> {bookingData.personalInfo.phone}</p>
                    <p><span className="font-medium">Address:</span> {bookingData.personalInfo.address}, {bookingData.personalInfo.city}, {bookingData.personalInfo.state} - {bookingData.personalInfo.pincode}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {bookingData.personalInfo.emergencyContact.name}</p>
                    <p><span className="font-medium">Phone:</span> {bookingData.personalInfo.emergencyContact.phone}</p>
                    <p><span className="font-medium">Relation:</span> {bookingData.personalInfo.emergencyContact.relation}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transport Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Car className="w-6 h-6 text-purple-600" />
                Transport Details
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Plane className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {bookingData.airportLocation === 'kochi' ? 'Kochi Airport (COK)' : 'Trivandrum Airport (TRV)'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {bookingData.airportLocation === 'kochi'
                        ? 'Cochin International Airport'
                        : 'Thiruvananthapuram International Airport'}
                    </p>
                  </div>
                </div>

                {bookingData.pickup && (
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="font-semibold text-green-700 mb-2">Airport Pickup Service</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {bookingData.pickupDetails?.flightNumber && (
                        <p><span className="font-medium">Flight Number:</span> {bookingData.pickupDetails.flightNumber}</p>
                      )}
                      {bookingData.pickupDetails?.arrivalTime && (
                        <p><span className="font-medium">Arrival Time:</span> {formatDateTime(bookingData.pickupDetails.arrivalTime)}</p>
                      )}
                      {bookingData.pickupDetails?.terminal && (
                        <p><span className="font-medium">Terminal:</span> {bookingData.pickupDetails.terminal}</p>
                      )}
                      <p className="text-green-700 font-semibold">Cost: ₹1,500</p>
                    </div>
                  </div>
                )}

                {bookingData.drop && (
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="font-semibold text-blue-700 mb-2">Airport Drop Service</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      {bookingData.dropDetails?.flightNumber && (
                        <p><span className="font-medium">Flight Number:</span> {bookingData.dropDetails.flightNumber}</p>
                      )}
                      {bookingData.dropDetails?.departureTime && (
                        <p><span className="font-medium">Departure Time:</span> {formatDateTime(bookingData.dropDetails.departureTime)}</p>
                      )}
                      {bookingData.dropDetails?.terminal && (
                        <p><span className="font-medium">Terminal:</span> {bookingData.dropDetails.terminal}</p>
                      )}
                      <p className="text-blue-700 font-semibold">Cost: ₹1,500</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Payment Confirmation
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-sm">{bookingData.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono text-sm">{bookingData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span>{formatDateTime(bookingData.bookingDate)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(bookingData.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-600">Amount Paid</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions & Support */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>

                <div className="space-y-3">
                  <button
                    onClick={downloadBookingDetails}
                    className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Booking Details
                  </button>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    Back to Home
                  </button>

                  <button
                    onClick={() => router.push('/airport-transport')}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 px-4 rounded-lg transition-colors"
                  >
                    <Car className="w-5 h-5" />
                    Book Another Transfer
                  </button>
                </div>
              </motion.div>

              {/* Support Information */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need Assistance?</h3>
                <p className="text-gray-600 mb-4">
                  Our team is available 24/7 to assist you with your transport booking.
                </p>

                <div className="space-y-3">
                  <a
                    href="tel:+919847012345"
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>+91 98470 12345</span>
                  </a>
                  <a
                    href="mailto:transport@kshetraretreat.com"
                    className="flex items-center gap-3 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>transport@kshetraretreat.com</span>
                  </a>
                </div>
              </motion.div>

              {/* Service Information */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Confirmation Email</h4>
                      <p className="text-sm text-gray-600">You'll receive a confirmation email with all booking details</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Driver Contact</h4>
                      <p className="text-sm text-gray-600">Driver details will be shared 24 hours before pickup</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Pickup Time</h4>
                      <p className="text-sm text-gray-600">Driver will arrive 15 minutes before scheduled time</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Rating Prompt */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 text-center"
              >
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Love our service?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Help others discover Kshetra Retreat Resort by leaving a review
                </p>
                <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                  Leave a Review →
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}