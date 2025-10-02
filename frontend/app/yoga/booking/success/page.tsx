'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CheckCircle,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Home,
  Copy,
  Package,
  CheckCircle2
} from 'lucide-react'
import Header from '../../../../components/Header'

function YogaBookingSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const orderId = searchParams.get('order_id')
  const bookingId = searchParams.get('booking_id')

  const [bookingDetails] = useState({
    bookingId: bookingId || `68de0794dd1de844fe67e37d`,
    bookingReference: `YB${Date.now().toString().slice(-6)}`,
    paymentId: paymentId || 'demo_payment_id',
    orderId: orderId || 'demo_order_id',
    bookingDate: new Date().toLocaleDateString('en-IN'),
    sessionType: 'Yoga Session',
    batchName: 'Demo Booking',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 90 minutes
    instructor: 'Demo Instructor',
    location: 'Kshetra Retreat Resort, Varkala',
    customerName: 'Demo Customer',
    customerEmail: 'demo@example.com',
    customerPhone: '+91 9999999999',
    totalAmount: 1500
  })

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`/api/yoga/booking/${bookingDetails.bookingId}/receipt`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `yoga-booking-receipt-${bookingDetails.bookingId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error downloading receipt. Please try again.')
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      alert('Error downloading receipt. Please try again.')
    }
  }

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Yoga Booking Confirmation',
        text: `I just booked a yoga session at Kshetra Retreat Resort!`,
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Booking link copied to clipboard!')
    }
  }

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingDetails.bookingId)
    toast.success('Booking ID copied to clipboard!')
  }

  const handleTrackBooking = () => {
    router.push(`/track-booking?booking_id=${bookingDetails.bookingId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your yoga session has been successfully booked
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Confirmation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Reference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareBooking}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownloadReceipt}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="min-w-0">
                  <span className="text-gray-600">Booking ID</span>
                  <div className="flex items-start gap-2 mt-1">
                    <p className="font-bold text-sm md:text-lg text-orange-600 font-mono break-all flex-1 leading-relaxed">
                      {bookingDetails.bookingId}
                    </p>
                    <button
                      onClick={handleCopyBookingId}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex-shrink-0 mt-0.5"
                      title="Copy Booking ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Booking Date</span>
                  <p className="font-medium text-gray-900">{bookingDetails.bookingDate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Payment ID</span>
                  <p className="font-medium text-gray-900 font-mono text-xs">{bookingDetails.paymentId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Amount Paid</span>
                  <p className="font-bold text-lg text-green-600">{formatCurrency(bookingDetails.totalAmount)}</p>
                </div>
              </div>
            </motion.div>

            {/* Session Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Information</h2>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-900">
                    {bookingDetails.sessionType}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-800">
                      <strong>Date:</strong> {formatDate(bookingDetails.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-800">
                      <strong>Duration:</strong> 90 minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-800">
                      <strong>Instructor:</strong> {bookingDetails.instructor}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-orange-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-600 mt-1" />
                    <span className="text-orange-800">
                      <strong>Location:</strong> {bookingDetails.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll receive a confirmation email with detailed instructions</li>
                  <li>• Please arrive 15 minutes early for check-in</li>
                  <li>• Bring comfortable yoga clothes and a water bottle</li>
                  <li>• Yoga mats and props will be provided</li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">info@kshetraretreat.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600">+91 XXXXXXXXXX</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Please save your booking ID for future correspondence and tracking.
                </p>
                <p className="text-sm text-yellow-800 mt-2 font-mono break-all bg-yellow-100 p-2 rounded border">
                  <strong>{bookingDetails.bookingId}</strong>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar with Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>

              <div className="space-y-4">
                <button
                  onClick={handleTrackBooking}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Track Booking
                </button>

                <button
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>

                <button
                  onClick={handleShareBooking}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Booking
                </button>

                <button
                  onClick={() => router.push('/yoga')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Yoga
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </button>
              </div>

              {/* Booking Status */}
              <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Status</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your booking is confirmed and ready
                  </p>
                  <button
                    onClick={handleTrackBooking}
                    className="text-sm text-green-600 font-medium hover:text-green-700"
                  >
                    Track Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-6 bg-green-50 border border-green-200 rounded-xl"
        >
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <p className="text-green-800 font-medium mb-2">
            Thank you for choosing Kshetra Retreat Resort!
          </p>
          <p className="text-sm text-green-700">
            We're excited to be part of your yoga journey. See you soon! 🧘‍♀️
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function YogaBookingSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <YogaBookingSuccessPageContent />
    </Suspense>
  );
}