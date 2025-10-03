'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  Plane,
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Lock,
  Smartphone,
  Loader,
  Clock,
  Percent
} from 'lucide-react'
import Header from '../../../components/Header'
import { bookingAPI } from '../../../lib/api'
import { initiatePayment } from '../../../utils/razorpay'
import { validateCoupon } from '../../../lib/api/coupons'

interface BookingDetails {
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
}

interface PersonalInfo {
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

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  })
  const [loading, setLoading] = useState(false)

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    // Load booking details from localStorage
    const bookingData = localStorage.getItem('airportTransportBooking')
    if (bookingData) {
      const parsedData = JSON.parse(bookingData)
      console.log('Loaded booking data:', parsedData)
      setBookingDetails(parsedData)

      // Personal info will be filled by user on this page
    } else {
      // Redirect back if no booking data
      router.push('/airport-transport')
    }
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !bookingDetails) return

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await validateCoupon({
        code: couponCode.trim(),
        serviceType: 'airport',
        orderValue: bookingDetails.totalAmount,
        phoneNumber: personalInfo.phone
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
    if (!bookingDetails) return 0
    return bookingDetails.totalAmount - couponDiscount
  }

  const createTransportBooking = async () => {
    if (!bookingDetails) return null

    try {
      console.log('🚀 Creating transport booking...')

      // Create booking payload for transport service
      const TRANSPORT_DUMMY_ROOM_ID = '000000000000000000000000' // Valid MongoDB ObjectId format

      const bookingPayload = {
        roomId: TRANSPORT_DUMMY_ROOM_ID,
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        primaryGuestInfo: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: personalInfo.address,
          city: personalInfo.city,
          state: personalInfo.state,
          pincode: personalInfo.pincode,
          emergencyContact: {
            name: personalInfo.emergencyContact.name,
            phone: personalInfo.emergencyContact.phone,
            relationship: personalInfo.emergencyContact.relation
          }
        },
        guests: [{
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          age: 25,
          gender: 'Other' as const
        }],
        includeFood: false,
        includeBreakfast: false,
        transport: {
          pickup: bookingDetails.pickup,
          drop: bookingDetails.drop,
          arrivalTime: bookingDetails.pickupDetails?.arrivalTime || '',
          departureTime: bookingDetails.dropDetails?.departureTime || '',
          airportFrom: bookingDetails.airportLocation === 'kochi' ? 'Kochi' : 'Trivandrum',
          ...(bookingDetails.pickupDetails?.terminal && { pickupTerminal: bookingDetails.pickupDetails.terminal }),
          ...(bookingDetails.dropDetails?.terminal && { dropTerminal: bookingDetails.dropDetails.terminal }),
          pickupFlightNumber: bookingDetails.pickupDetails?.flightNumber || '',
          dropFlightNumber: bookingDetails.dropDetails?.flightNumber || ''
        },
        selectedServices: [],
        specialRequests: `Airport Transport Service - ${bookingDetails.pickup ? 'Pickup' : ''} ${bookingDetails.pickup && bookingDetails.drop ? '& ' : ''}${bookingDetails.drop ? 'Drop' : ''} - Airport: ${bookingDetails.airportLocation}`,
        totalAmount: bookingDetails.totalAmount,
        couponCode: appliedCoupon ? couponCode : undefined,
        paymentStatus: 'pending',
        bookingType: 'transport'
      }

      const response = await bookingAPI.createPublicBooking(bookingPayload)

      if (response.data?.success) {
        console.log('✅ Transport booking created successfully:', response.data.data)
        const bookingId = response.data.data.booking._id
        console.log('📋 Extracted booking ID:', bookingId)
        return bookingId
      } else {
        throw new Error(response.data?.message || 'Failed to create transport booking')
      }
    } catch (error) {
      console.error('Transport booking creation error:', error)
      throw error
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData)

    // Store final booking data
    const finalBookingData = {
      ...bookingDetails,
      personalInfo,
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      bookingId: paymentData.bookingId,
      status: 'completed',
      bookingDate: new Date().toISOString()
    }

    localStorage.setItem('lastTransportBooking', JSON.stringify(finalBookingData))
    localStorage.removeItem('airportTransportBooking')

    // Redirect to success page
    router.push('/airport-transport/success')
  }

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error)
    alert('Payment failed: ' + (error.message || 'Unknown error'))
    setLoading(false)
  }

  const handlePayment = async () => {
    if (!bookingDetails) return

    // Validate personal info
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.phone || !personalInfo.address || !personalInfo.city || !personalInfo.state || !personalInfo.pincode || !personalInfo.emergencyContact.name || !personalInfo.emergencyContact.phone || !personalInfo.emergencyContact.relation) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      console.log('🚀 Starting transport booking flow...')

      // Create booking first
      const createdBookingId = await createTransportBooking()

      console.log('✅ Transport booking created, now opening Razorpay...')

      // Immediately trigger payment after booking creation
      await initiatePayment({
        amount: getFinalAmount(),
        bookingId: createdBookingId,
        userDetails: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          phone: personalInfo.phone,
        },
        onSuccess: handlePaymentSuccess,
        onError: handlePaymentError
      })

    } catch (error) {
      console.error('❌ Transport booking/Payment flow error:', error)
      alert('Failed to create transport booking: ' + (error as Error).message)
      setLoading(false)
    }
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
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
              <span className="text-sm font-medium text-green-400">Service Details</span>
            </div>
            <div className="w-16 h-px bg-green-400"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-400">Personal Info</span>
            </div>
            <div className="w-16 h-px bg-purple-400"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-purple-400">Payment</span>
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
                {/* Service Icon */}
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl mx-auto">
                  <Car className="w-10 h-10 text-white" />
                </div>

                {/* Airport Details */}
                <div className="bg-white/10 rounded-2xl p-6 space-y-4">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold text-white">Airport Transport Service</h4>
                    <p className="text-gray-300 text-sm mt-2">Professional airport transfer service</p>
                  </div>

                  <div className="flex items-center gap-3 justify-center">
                    <Plane className="w-5 h-5 text-purple-400" />
                    <div className="text-center">
                      <p className="text-white font-medium">
                        {bookingDetails.airportLocation === 'kochi' ? 'Kochi Airport (COK)' : 'Trivandrum Airport (TRV)'}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {bookingDetails.airportLocation === 'kochi'
                          ? 'Cochin International Airport'
                          : 'Thiruvananthapuram International Airport'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Services Selected */}
                <div className="space-y-4">
                  {bookingDetails.pickup && (
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <h5 className="font-semibold text-green-400">Airport Pickup Service</h5>
                      </div>
                      <div className="space-y-2 text-sm ml-5">
                        {bookingDetails.pickupDetails?.flightNumber && (
                          <p className="text-gray-300">Flight: {bookingDetails.pickupDetails.flightNumber}</p>
                        )}
                        {bookingDetails.pickupDetails?.arrivalTime && (
                          <p className="text-gray-300">Arrival: {formatDateTime(bookingDetails.pickupDetails.arrivalTime)}</p>
                        )}
                        {bookingDetails.pickupDetails?.terminal && (
                          <p className="text-gray-300">Terminal: {bookingDetails.pickupDetails.terminal}</p>
                        )}
                        <p className="text-green-400 font-medium">₹1,500</p>
                      </div>
                    </div>
                  )}

                  {bookingDetails.drop && (
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <h5 className="font-semibold text-blue-400">Airport Drop Service</h5>
                      </div>
                      <div className="space-y-2 text-sm ml-5">
                        {bookingDetails.dropDetails?.flightNumber && (
                          <p className="text-gray-300">Flight: {bookingDetails.dropDetails.flightNumber}</p>
                        )}
                        {bookingDetails.dropDetails?.departureTime && (
                          <p className="text-gray-300">Departure: {formatDateTime(bookingDetails.dropDetails.departureTime)}</p>
                        )}
                        {bookingDetails.dropDetails?.terminal && (
                          <p className="text-gray-300">Terminal: {bookingDetails.dropDetails.terminal}</p>
                        )}
                        <p className="text-blue-400 font-medium">₹1,500</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Details */}
                <div className="bg-white/10 rounded-2xl p-6">
                  <h4 className="font-semibold text-white mb-4">Your Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{personalInfo.firstName} {personalInfo.lastName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{personalInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{personalInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{personalInfo.city}, {personalInfo.state}</span>
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
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl p-6 text-center">
                  {appliedCoupon && (
                    <div className="mb-4 pb-4 border-b border-white/20">
                      <div className="flex justify-between text-gray-300 text-sm mb-2">
                        <span>Subtotal</span>
                        <span>{formatCurrency(bookingDetails.totalAmount)}</span>
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

          {/* Payment Form & Personal Info */}
          <div className="space-y-8">
            {/* Personal Information Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">Complete Your Information</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
                  <textarea
                    required
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={personalInfo.city}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                    <input
                      type="text"
                      required
                      value={personalInfo.state}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={personalInfo.pincode}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <h4 className="text-sm font-semibold text-white mb-3">Emergency Contact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        value={personalInfo.emergencyContact.name}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        value={personalInfo.emergencyContact.phone}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                        placeholder="Contact phone"
                      />
                    </div>
                    <div>
                      <select
                        required
                        value={personalInfo.emergencyContact.relation}
                        onChange={(e) => setPersonalInfo(prev => ({
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                        }))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                      >
                        <option className='text-black bg-gray-400 ' value="" disabled>Relationship</option>
                        <option className='text-black bg-gray-400 ' value="spouse">Spouse</option>
                        <option className='text-black bg-gray-400 ' value="parent">Parent</option>
                        <option className='text-black bg-gray-400 ' value="sibling">Sibling</option>
                        <option className='text-black bg-gray-400 ' value="friend">Friend</option>
                        <option className='text-black bg-gray-400 ' value="relative">Relative</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
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
                  <p className="text-gray-300">Complete your transport booking</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    Payment Method
                  </h2>

                  <div className="border border-purple-400/30 rounded-2xl p-6 bg-purple-500/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl">
                        <CreditCard className="w-6 h-6 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white">Razorpay</h3>
                        <p className="text-sm text-gray-300">Cards, UPI, Net Banking, Wallets</p>
                      </div>
                      <div className="w-5 h-5 border-2 border-purple-400 rounded-full bg-purple-400 flex items-center justify-center">
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
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay {formatCurrency(bookingDetails.totalAmount)}
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