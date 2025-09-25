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
  Car,
  Plane,
  Waves
} from 'lucide-react'
import Header from '../../../../components/Header'

// Types for services booking
interface Service {
  _id: string
  name: string
  category: 'airport_pickup' | 'vehicle_rental' | 'surfing'
  price: number
  priceUnit: string
  description: string
  duration?: string
  features: string[]
  maxQuantity?: number
  isActive: boolean
}

interface SelectedService extends Service {
  quantity: number
}

interface FormData {
  name: string
  email: string
  phone: string
  specialRequests: string
}

interface CompleteBookingData {
  services: SelectedService[]
  date: string
  totalAmount: number
  user: FormData
  timestamp: string
}

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export default function ServicesBookingPaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<CompleteBookingData | null>(null)
  const [paymentMethods] = useState([
    { id: 'razorpay', name: 'Razorpay', icon: CreditCard, description: 'Credit/Debit Cards, UPI, Net Banking, Wallets' }
  ])

  useEffect(() => {
    // Get complete booking data from localStorage
    const storedData = localStorage.getItem('servicesCompleteBookingData')
    if (!storedData) {
      router.push('/services')
      return
    }

    try {
      const data: CompleteBookingData = JSON.parse(storedData)
      setBookingData(data)
    } catch (error) {
      console.error('Error parsing booking data:', error)
      router.push('/services')
    }
  }, [router])

  const getServiceIcon = (category: 'airport_pickup' | 'vehicle_rental' | 'surfing') => {
    switch (category) {
      case 'airport_pickup':
        return Plane
      case 'vehicle_rental':
        return Car
      case 'surfing':
        return Waves
      default:
        return Activity
    }
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

  const handlePayment = async () => {
    if (!bookingData) return

    setLoading(true)

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert('Failed to load payment gateway. Please try again.')
        setLoading(false)
        return
      }

      // For demo purposes, create a mock order ID
      const simulatedOrderId = `services_order_${Date.now()}`

      // Razorpay options
      const options = {
        key: 'rzp_test_RHyWk20J1eq916', // Use your actual Razorpay key
        amount: bookingData.totalAmount * 100,
        currency: 'INR',
        name: 'Kshetra Retreat Resort',
        description: `Services: ${bookingData.services.map(s => s.name).join(', ')}`,
        order_id: simulatedOrderId,
        handler: async function (response: any) {
          try {
            // In a real app, verify payment on backend
            console.log('Payment successful:', response)

            // Clear localStorage
            localStorage.removeItem('servicesBookingData')
            localStorage.removeItem('servicesCompleteBookingData')

            // Redirect to success page
            router.push(`/services/booking/success?payment_id=${response.razorpay_payment_id || 'demo_payment'}&order_id=${response.razorpay_order_id || simulatedOrderId}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: bookingData.user.name,
          email: bookingData.user.email,
          contact: bookingData.user.phone
        },
        theme: {
          color: '#ea580c'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
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
                {/* Service Date */}
                <div className="bg-white/10 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Service Date</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatDate(bookingData.date)}
                  </div>
                </div>

                {/* Selected Services */}
                <div className="space-y-4">
                  {bookingData.services.map((service) => {
                    const ServiceIcon = getServiceIcon(service.category)
                    return (
                      <div key={service._id} className="bg-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-xl">
                            <ServiceIcon className="w-6 h-6 text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{service.name}</h4>
                            <p className="text-gray-300 text-sm">Quantity: {service.quantity}</p>
                          </div>
                          <div className="text-orange-400 font-bold">
                            {formatCurrency(service.price * service.quantity)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
                    {bookingData.user.specialRequests && (
                      <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/20">
                        <Activity className="w-4 h-4 text-orange-400 mt-0.5" />
                        <div>
                          <div className="text-white font-medium mb-1">Special Requests</div>
                          <span className="text-gray-300 text-sm">{bookingData.user.specialRequests}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl p-6 text-center">
                  <p className="text-gray-300 text-sm mb-2">Total Amount</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(bookingData.totalAmount)}</p>
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
                  <p className="text-gray-300">Complete your services booking</p>
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
                      Pay {formatCurrency(bookingData.totalAmount)}
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