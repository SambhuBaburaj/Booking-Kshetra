'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Lock,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  Shield,
  Smartphone,
  Loader,
  Activity,
  Heart,
  BookOpen,
  Percent
} from 'lucide-react'
import Header from '../../../../components/Header'
import { bookingAPI } from '../../../../lib/api'
import { initiatePayment } from '../../../../utils/razorpay'
import { validateCoupon } from '../../../../lib/api/coupons'

// Types for our simplified booking
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

type BookingData = {
  session: SessionData
  user: FormData
  timestamp: string
}


export default function YogaBookingPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    // Get booking data from localStorage
    const storedData = localStorage.getItem('yogaBookingData')
    if (!storedData) {
      router.push('/yoga')
      return
    }

    try {
      const data: BookingData = JSON.parse(storedData)
      setBookingData(data)
    } catch (error) {
      console.error('Error parsing booking data:', error)
      router.push('/yoga')
    }
  }, [router])

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !bookingData) return

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        serviceType: 'yoga',
        orderValue: bookingData.session.price,
        phoneNumber: bookingData.user.phone
      })

      if (response.data.success && response.data.data) {
        setAppliedCoupon(response.data.data.coupon)
        setCouponDiscount(response.data.data.discount)
        setCouponError('')
      }
    } catch (error: any) {
      setCouponError(error.message || 'Invalid coupon code')
      setAppliedCoupon(null)
      setCouponDiscount(0)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponError('')
  }

  const getFinalAmount = () => {
    if (!bookingData) return 0
    return bookingData.session.price - couponDiscount
  }

  const createYogaBooking = async () => {
    if (!bookingData) return null

    try {
      console.log('🚀 Creating yoga booking...')

      // Create booking payload that passes backend validation
      // Use a dummy room ID for yoga bookings to satisfy validation
      const YOGA_DUMMY_ROOM_ID = '000000000000000000000000' // Valid MongoDB ObjectId format

      const bookingPayload = {
        // Use dummy room ID to pass validation (backend should handle this as special case)
        roomId: YOGA_DUMMY_ROOM_ID,
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        primaryGuestInfo: {
          name: bookingData.user.name,
          email: bookingData.user.email,
          phone: bookingData.user.phone,
          address: bookingData.user.address,
          city: bookingData.user.city,
          state: bookingData.user.state,
          pincode: bookingData.user.pincode,
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        },
        guests: [{
          name: bookingData.user.name,
          age: 25,
          gender: 'Other' as const
          // Skip ID fields for yoga bookings - not needed
        }],
        includeFood: false,
        includeBreakfast: false,
        transport: {
          pickup: false,
          drop: false,
          // Remove flightNumber field entirely to avoid validation error
          arrivalTime: '',
          departureTime: '',
          airportFrom: 'Kochi'
        },
        selectedServices: [],
        specialRequests: `Yoga Session: ${bookingData.session.name} - ${bookingData.session.description} - Experience Level: ${bookingData.user.experience}`,
        totalAmount: bookingData.session.price,
        couponCode: appliedCoupon ? couponCode : undefined,
        paymentStatus: 'pending',
        // Add yoga-specific data
        yogaSessionId: bookingData.session.id,
        bookingType: 'yoga'
      }

      const response = await bookingAPI.createPublicBooking(bookingPayload)

      if (response.data?.success) {
        console.log('✅ Yoga booking created successfully:', response.data.data)
        const bookingId = response.data.data.booking._id
        console.log('📋 Extracted booking ID:', bookingId)
        return bookingId
      } else {
        throw new Error(response.data?.message || 'Failed to create yoga booking')
      }
    } catch (error) {
      console.error('Yoga booking creation error:', error)
      throw error
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)

    // Clear localStorage
    localStorage.removeItem('yogaBookingData')

    // Redirect to success page with proper parameters
    router.push(`/yoga/booking/success?payment_id=${paymentData.razorpay_payment_id}&order_id=${paymentData.razorpay_order_id}&booking_id=${paymentData.bookingId}`)
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    alert('Payment failed: ' + (error.message || 'Unknown error'))
    setLoading(false)
  }

  const handlePayment = async () => {
    if (!bookingData) return

    setLoading(true)

    try {
      console.log('🚀 Starting yoga booking flow...')

      // Create booking first
      const createdBookingId = await createYogaBooking()

      console.log('✅ Yoga booking created, now opening Razorpay...')

      // Immediately trigger payment after booking creation using the proper utils
      await initiatePayment({
        amount: getFinalAmount(),
        bookingId: createdBookingId,
        userDetails: {
          name: bookingData.user.name,
          email: bookingData.user.email,
          phone: bookingData.user.phone,
        },
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError
      })

    } catch (error) {
      console.error('❌ Yoga booking/Payment flow error:', error)
      alert('Failed to create yoga booking: ' + (error as Error).message)
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
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
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-400">Details</span>
            </div>
            <div className="w-16 h-px bg-green-400"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium text-orange-400">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Booking Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-8">Booking Summary</h3>

              <div className="space-y-6">
                {/* Session Icon */}
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl mx-auto">
                  {bookingData.session.type === 'program' ? (
                    <BookOpen className="w-10 h-10 text-white" />
                  ) : bookingData.session.type === 'daily_therapy' ? (
                    <Heart className="w-10 h-10 text-white" />
                  ) : (
                    <Activity className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Session Details */}
                <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold text-white">{bookingData.session.name}</h4>
                    <p className="text-gray-300 text-sm mt-2">{bookingData.session.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Duration</p>
                        <p className="text-gray-300 text-sm">{bookingData.session.duration}</p>
                      </div>
                    </div>

                    {bookingData.session.schedule && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Schedule</p>
                          <p className="text-gray-300 text-sm">{bookingData.session.schedule}</p>
                        </div>
                      </div>
                    )}

                    {bookingData.session.startDate && bookingData.session.endDate && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Program Dates</p>
                          <p className="text-gray-300 text-sm">
                            {formatDate(bookingData.session.startDate)} - {formatDate(bookingData.session.endDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {bookingData.session.instructor && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Instructor</p>
                          <p className="text-gray-300 text-sm">{bookingData.session.instructor}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-white mb-4">Your Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{bookingData.user.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{bookingData.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{bookingData.user.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300 capitalize">{bookingData.user.experience} Level</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl p-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Have a Coupon Code?
                  </h4>

                  {!appliedCoupon ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || validatingCoupon}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {validatingCoupon ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-red-400 text-sm">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-600/20 rounded-lg border border-green-400/30">
                        <div>
                          <p className="text-green-400 font-medium">{appliedCoupon.code}</p>
                          <p className="text-green-300 text-sm">{appliedCoupon.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">-{formatCurrency(couponDiscount)}</p>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-400 text-sm hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl p-6 text-center">
                  {appliedCoupon && (
                    <div className="mb-4 pb-4 border-b border-white/20">
                      <div className="flex justify-between text-gray-300 text-sm mb-2">
                        <span>Subtotal</span>
                        <span>{formatCurrency(bookingData.session.price)}</span>
                      </div>
                      <div className="flex justify-between text-green-400 text-sm">
                        <span>Coupon Discount</span>
                        <span>-{formatCurrency(couponDiscount)}</span>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-300 text-sm mb-2">
                    {appliedCoupon ? 'Final Amount' : 'Total Amount'}
                  </p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(getFinalAmount())}</p>
                  {appliedCoupon && (
                    <p className="text-green-400 text-sm mt-2">
                      You saved {formatCurrency(couponDiscount)}!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payment Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Secure Payment</h1>
                  <p className="text-gray-300">Complete your yoga booking</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    Payment Method
                  </h2>

                  <div className="border border-orange-400/30 rounded-2xl p-6 bg-orange-500/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500/20 rounded-xl">
                        <CreditCard className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">Razorpay</h3>
                        <p className="text-sm text-gray-300">Cards, UPI, Net Banking, Wallets</p>
                      </div>
                      <div className="w-5 h-5 border-2 border-orange-400 rounded-full bg-orange-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Your Payment is Secure
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Bank-grade Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Trusted Platform</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Icons */}
                <div>
                  <h3 className="font-medium text-white mb-4">Accepted Payment Methods</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <CreditCard className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">Cards</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <Smartphone className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">UPI</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <span className="text-xs text-gray-400">Net Banking</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl text-center">
                      <span className="text-xs text-gray-400">Wallets</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="text-xs text-gray-400 bg-white/5 p-4 rounded-xl">
                  <p className="mb-2">By proceeding with the payment, you agree to our:</p>
                  <ul className="space-y-1 text-gray-500">
                    <li>• Terms and Conditions</li>
                    <li>• Privacy Policy</li>
                    <li>• Cancellation and Refund Policy</li>
                  </ul>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {formatCurrency(getFinalAmount())}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}