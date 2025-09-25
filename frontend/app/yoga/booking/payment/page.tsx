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
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Shield,
  Smartphone,
  Loader
} from 'lucide-react'
import Header from '../../../../components/Header'
import { useYogaBooking } from '../../../../contexts/YogaBookingContext'

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

export default function YogaBookingPaymentPage() {
  const router = useRouter()
  const { state, setStep, resetBooking } = useYogaBooking()
  const [loading, setLoading] = useState(false)
  const [paymentMethods] = useState([
    { id: 'razorpay', name: 'Razorpay', icon: CreditCard, description: 'Credit/Debit Cards, UPI, Net Banking, Wallets' }
  ])

  useEffect(() => {
    console.log('=== Payment page useEffect triggered ===')
    console.log('Selected session:', state.selectedSession)
    console.log('User details:', state.userDetails)
    console.log('User name:', state.userDetails.name)

    if (!state.selectedSession) {
      console.log('❌ No selected session, redirecting to yoga')
      setTimeout(() => router.push('/yoga'), 100)
      return
    }

    if (!state.userDetails.name) {
      console.log('❌ No user details, redirecting to details page')
      setTimeout(() => router.push('/yoga/booking/details'), 100)
      return
    }

    console.log('✅ Payment page initialized successfully')
    console.log('Total amount to pay:', state.totalAmount)
    console.log('Selected services count:', state.selectedServices.length)
    setStep('payment')
  }, [state.selectedSession, state.userDetails, setStep, router])

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

  const handlePayment = async () => {
    if (!state.selectedSession) return

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
      const simulatedOrderId = `yoga_order_${Date.now()}`

      // Razorpay options
      const options = {
        key: 'rzp_test_RHyWk20J1eq916', // Use your actual Razorpay key
        amount: state.totalAmount * 100,
        currency: 'INR',
        name: 'Kshetra Retreat Resort',
        description: `${state.selectedSession.type === '200hr' ? state.selectedSession.type + ' Training' : state.selectedSession.batchName}`,
        order_id: simulatedOrderId,
        handler: async function (response: any) {
          try {
            // In a real app, verify payment on backend
            console.log('Payment successful:', response)

            // For demo, we'll simulate success
            resetBooking()
            router.push(`/yoga/booking/success?payment_id=${response.razorpay_payment_id || 'demo_payment'}&order_id=${response.razorpay_order_id || simulatedOrderId}`)
          } catch (error) {
            console.error('Payment verification error:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: state.userDetails.name,
          email: state.userDetails.email,
          contact: state.userDetails.phone
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
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-600">Details</span>
            </div>
            <div className="w-16 h-px bg-green-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="text-sm font-medium text-green-600">Services</span>
            </div>
            <div className="w-16 h-px bg-orange-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-orange-600">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>

              <div className="space-y-6">
                {/* Yoga Session */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">
                      {state.selectedSession.type === '200hr' ? state.selectedSession.type + ' Training' : state.selectedSession.batchName}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-orange-800 font-medium">
                      {state.selectedSession.batchName}
                    </p>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-700">
                        {formatDate(state.selectedSession.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-700">
                        Time: {state.selectedSession.schedule.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-700">
                        {state.selectedSession.instructor.name}
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

                {/* Customer Details */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{state.userDetails.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{state.userDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{state.userDetails.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Services */}
                {state.selectedServices.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Additional Services</h4>
                    {state.selectedServices.map((service) => (
                      <div key={service._id} className="flex justify-between items-start p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {service.name}
                          </span>
                          {(service.quantity || 1) > 1 && (
                            <span className="text-xs text-gray-500 ml-2">
                              x{service.quantity}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(service.price * (service.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Services</h4>
                    <p className="text-sm text-gray-600">
                      No additional services selected. You're only paying for your yoga session.
                    </p>
                  </div>
                )}

                {/* Total Amount */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(state.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/yoga/booking/services')}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Secure Payment</h1>
                    <p className="text-gray-600">Complete your yoga booking with secure payment</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Payment Method Selection */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="border border-orange-200 rounded-lg p-4 bg-orange-50 cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <method.icon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-orange-900">{method.name}</h3>
                            <p className="text-sm text-orange-700">{method.description}</p>
                          </div>
                          <div className="w-4 h-4 border-2 border-orange-600 rounded-full bg-orange-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Your Payment is Secure
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">SSL Encrypted Payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Bank-grade Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Trusted by Millions</span>
                    </div>
                  </div>
                </div>

                {/* Supported Payment Options */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Accepted Payment Methods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                      <span className="ml-2 text-sm text-gray-700">Cards</span>
                    </div>
                    <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white">
                      <Smartphone className="w-6 h-6 text-gray-600" />
                      <span className="ml-2 text-sm text-gray-700">UPI</span>
                    </div>
                    <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white">
                      <span className="text-sm text-gray-700">Net Banking</span>
                    </div>
                    <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg bg-white">
                      <span className="text-sm text-gray-700">Wallets</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Payment Button */}
                <div className="space-y-4">
                  <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2">By proceeding with the payment, you agree to our:</p>
                    <ul className="space-y-1">
                      <li>• Terms and Conditions</li>
                      <li>• Privacy Policy</li>
                      <li>• Cancellation and Refund Policy</li>
                    </ul>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay {formatCurrency(state.totalAmount)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}