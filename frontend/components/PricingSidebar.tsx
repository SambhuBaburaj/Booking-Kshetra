'use client'

import { motion } from 'framer-motion'
import { Calculator, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { BookingFormData, PricingBreakdown } from '../types'

interface PricingSidebarProps {
  formData: BookingFormData
  pricing: PricingBreakdown
}

export default function PricingSidebar({ formData, pricing }: PricingSidebarProps) {
  const hasAddons = pricing.transportCharges > 0 || 
                   pricing.breakfastCharges > 0 || 
                   pricing.serviceCharges > 0 || 
                   pricing.yogaCharges > 0

  return (
    <div className="space-y-6">
      {/* Price Breakdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-4"
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Price Breakdown</h3>
          </div>
          <div className="text-2xl font-bold">₹{pricing.totalAmount.toLocaleString()}</div>
          <div className="text-sm opacity-90">Total Amount</div>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Room Charges */}
          {pricing.roomCharges > 0 && (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Room ({formData.room.roomType})</div>
                <div className="text-sm text-gray-600">
                  {formData.dates.nights} nights × ₹{formData.room.pricePerNight}
                </div>
              </div>
              <div className="font-semibold">₹{pricing.roomCharges.toLocaleString()}</div>
            </div>
          )}
          
          {/* Food Charges */}
          {pricing.foodCharges > 0 && (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Food</div>
                <div className="text-sm text-gray-600">
                  {formData.guests.adults} adults × {formData.dates.nights} days × ₹150
                </div>
              </div>
              <div className="font-semibold">₹{pricing.foodCharges.toLocaleString()}</div>
            </div>
          )}
          
          {/* Transport Charges */}
          {pricing.transportCharges > 0 && (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Transport</div>
                <div className="text-sm text-gray-600">
                  {formData.transport.pickup && 'Pickup'} 
                  {formData.transport.pickup && formData.transport.drop && ' + '}
                  {formData.transport.drop && 'Drop'}
                </div>
              </div>
              <div className="font-semibold">₹{pricing.transportCharges.toLocaleString()}</div>
            </div>
          )}
          
          {/* Breakfast Charges */}
          {pricing.breakfastCharges > 0 && (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Extra Breakfast</div>
                <div className="text-sm text-gray-600">
                  {formData.breakfast.persons} persons × {formData.breakfast.days} days × ₹200
                </div>
              </div>
              <div className="font-semibold">₹{pricing.breakfastCharges.toLocaleString()}</div>
            </div>
          )}
          
          {/* Service Charges */}
          {pricing.serviceCharges > 0 && (
            <div className="space-y-2">
              <div className="font-medium text-gray-900">Activities</div>
              
              {formData.services.bikeRental.enabled && (
                <div className="flex justify-between items-center pl-4">
                  <div className="text-sm text-gray-600">
                    Bike Rental ({formData.services.bikeRental.quantity} × {formData.services.bikeRental.days} days)
                  </div>
                  <div className="text-sm font-medium">
                    ₹{(formData.services.bikeRental.quantity * formData.services.bikeRental.days * 500).toLocaleString()}
                  </div>
                </div>
              )}
              
              {formData.services.sightseeing.enabled && (
                <div className="flex justify-between items-center pl-4">
                  <div className="text-sm text-gray-600">
                    Sightseeing ({formData.services.sightseeing.persons} persons)
                  </div>
                  <div className="text-sm font-medium">
                    ₹{(formData.services.sightseeing.persons * 1500).toLocaleString()}
                  </div>
                </div>
              )}
              
              {formData.services.surfing.enabled && (
                <div className="flex justify-between items-center pl-4">
                  <div className="text-sm text-gray-600">
                    Surfing ({formData.services.surfing.persons} persons)
                  </div>
                  <div className="text-sm font-medium">
                    ₹{(formData.services.surfing.persons * 2000).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Yoga Charges */}
          {pricing.yogaCharges > 0 && (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900">Yoga TTC</div>
                <div className="text-sm text-gray-600">
                  {formData.yogaSession.type} Program
                </div>
              </div>
              <div className="font-semibold">₹{pricing.yogaCharges.toLocaleString()}</div>
            </div>
          )}
          
          {hasAddons && <hr className="border-gray-200" />}
          
          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold text-primary-600">
            <div>Total Amount</div>
            <div>₹{pricing.totalAmount.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>
      
      {/* Payment Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Secure Payment</h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Razorpay secure gateway</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Email & WhatsApp alerts</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-sm">Accepted Payment Methods</span>
          </div>
          <div className="text-xs text-gray-600">
            Credit Cards • Debit Cards • UPI • Net Banking • Wallets
          </div>
        </div>
      </motion.div>
      
      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4"
      >
        <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
        <p className="text-sm text-primary-700 mb-3">
          Our team is available 24/7 to assist you with your booking.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-primary-600">Phone:</span>
            <span className="font-medium text-primary-900">+91 98470 12345</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-600">Email:</span>
            <span className="font-medium text-primary-900">info@kshetraretreat.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary-600">WhatsApp:</span>
            <span className="font-medium text-primary-900">+91 98470 12345</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}