'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  User, 
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Camera,
  Car,
  Utensils
} from 'lucide-react'
import Header from '../../components/Header'
import { apiClient } from '../../lib/api-client'
import PaymentButton from '../../components/PaymentButton'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'

interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'AC' | 'Non-AC';
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  description?: string;
  images: string[];
}

interface Guest {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idType: 'Aadhar' | 'Passport' | 'Driving License' | 'PAN Card';
  idNumber: string;
  email?: string;
  phone?: string;
}

interface BookingData {
  // Step 1: Room & Dates
  roomId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  
  // Step 2: Guest Details
  primaryGuest: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  guests: Guest[];
  
  // Step 3: Services & Preferences
  services: {
    includeFood: boolean;
    includeBreakfast: boolean;
    transport: {
      pickup: boolean;
      drop: boolean;
      flightNumber?: string;
      arrivalTime?: string;
      departureTime?: string;
      airportLocation: 'Kochi' | 'Trivandrum';
    };
    additionalServices: string[];
  };
  
  specialRequests: string;
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [priceBreakdown, setPriceBreakdown] = useState<{
    nights: number;
    baseAmount: number;
    foodAmount: number;
    breakfastAmount: number;
    transportAmount: number;
    total: number;
  }>({ nights: 0, baseAmount: 0, foodAmount: 0, breakfastAmount: 0, transportAmount: 0, total: 0 })
  
  const [bookingData, setBookingData] = useState<BookingData>(() => ({
    roomId: '',
    checkIn: null,
    checkOut: null,
    primaryGuest: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    guests: [],
    services: {
      includeFood: true,
      includeBreakfast: false,
      transport: {
        pickup: false,
        drop: false,
        airportLocation: 'Kochi'
      },
      additionalServices: []
    },
    specialRequests: ''
  }))

  // Initialize from URL params
  useEffect(() => {
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = searchParams.get('adults')
    const children = searchParams.get('children')

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      setBookingData(prev => ({
        ...prev,
        checkIn: checkInDate,
        checkOut: checkOutDate
      }))
      
      // Initialize guests array
      const totalGuests = parseInt(adults || '1') + parseInt(children || '0')
      const guestArray: Guest[] = []
      
      for (let i = 0; i < totalGuests; i++) {
        guestArray.push({
          name: '',
          age: i < parseInt(adults || '1') ? 25 : 8,
          gender: 'Male',
          idType: 'Aadhar',
          idNumber: '',
          email: i === 0 ? '' : undefined,
          phone: i === 0 ? '' : undefined
        })
      }
      
      setBookingData(prev => ({
        ...prev,
        guests: guestArray
      }))
      
      fetchAvailableRooms(checkInDate, checkOutDate, totalGuests)
    }
  }, [searchParams])

  const fetchAvailableRooms = async (checkIn: Date, checkOut: Date, capacity: number) => {
    setLoading(true)
    try {
      const response = await apiClient.get(
        `/rooms/availability?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&capacity=${capacity}`
      )
      
      if (response.success) {
        setAvailableRooms(response.data.availableRooms)
      } else {
        setError(response.error || 'Failed to fetch available rooms')
      }
    } catch (err) {
      setError('Failed to fetch available rooms')
    } finally {
      setLoading(false)
    }
  }

  const calculatePricing = () => {
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      setPriceBreakdown({ nights: 0, baseAmount: 0, foodAmount: 0, breakfastAmount: 0, transportAmount: 0, total: 0 })
      setTotalAmount(0)
      return
    }

    const nights = Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const adults = bookingData.guests.filter(g => g.age >= 5).length

    const baseAmount = selectedRoom.pricePerNight * nights
    let foodAmount = 0
    let breakfastAmount = 0
    let transportAmount = 0

    // Food charges
    if (bookingData.services.includeFood) {
      foodAmount = adults * nights * 150
    }

    // Breakfast charges
    if (bookingData.services.includeBreakfast) {
      breakfastAmount = adults * nights * 200
    }

    // Transport charges
    if (bookingData.services.transport.pickup) transportAmount += 1500
    if (bookingData.services.transport.drop) transportAmount += 1500

    const total = baseAmount + foodAmount + breakfastAmount + transportAmount

    setPriceBreakdown({
      nights,
      baseAmount,
      foodAmount,
      breakfastAmount,
      transportAmount,
      total
    })
    setTotalAmount(total)
  }

  useEffect(() => {
    calculatePricing()
  }, [selectedRoom, bookingData])

  const handleStepSubmit = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final booking submission
      await createBooking()
    }
  }

  const createBooking = async () => {
    setLoading(true)
    try {
      const bookingPayload = {
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests.map(guest => ({
          name: guest.name,
          age: guest.age,
          isChild: guest.age < 5,
          gender: guest.gender,
          idType: guest.idType,
          idNumber: guest.idNumber
        })),
        primaryGuestInfo: bookingData.primaryGuest,
        includeFood: bookingData.services.includeFood,
        includeBreakfast: bookingData.services.includeBreakfast,
        transport: bookingData.services.transport,
        specialRequests: bookingData.specialRequests
      }

      const response = await apiClient.post('/bookings', bookingPayload, true)
      
      if (response.success) {
        setBookingId(response.data.booking._id)
        setCurrentStep(5) // Payment step
      } else {
        setError(response.error || 'Failed to create booking')
      }
    } catch (err) {
      setError('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentData: any) => {
    setCurrentStep(6) // Success step
  }

  const handlePaymentError = (error: any) => {
    setError(error.message || 'Payment failed')
  }

  // Step 1: Room Selection
  const RoomSelectionStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Room</h2>
        <p className="text-gray-600">
          {bookingData.checkIn && bookingData.checkOut && (
            <>
              {bookingData.checkIn.toLocaleDateString()} - {bookingData.checkOut.toLocaleDateString()} 
              • {bookingData.guests.length} guests
            </>
          )}
        </p>
      </div>

      {loading && <LoadingSpinner text="Finding available rooms..." />}
      
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)} 
        />
      )}

      <div className="grid gap-6">
        {availableRooms.map(room => (
          <motion.div
            key={room._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white rounded-xl shadow-lg p-6 border-2 cursor-pointer transition-all duration-300 ${
              selectedRoom?._id === room._id
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
            }`}
            onClick={() => {
              setSelectedRoom(room)
              setBookingData(prev => ({ ...prev, roomId: room._id }))
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-md">
                    {room.images.length > 0 ? (
                      <img
                        src={room.images[0]}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Room {room.roomNumber}
                      </h3>
                      {selectedRoom?._id === room._id && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {room.roomType}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Up to {room.capacity} guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {room.amenities.slice(0, 6).map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-medium rounded-full border"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 6 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        +{room.amenities.length - 6} more
                      </span>
                    )}
                  </div>
                )}
                
                {room.description && (
                  <p className="text-gray-600 text-sm">{room.description}</p>
                )}
              </div>
              
              <div className="text-right">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">
                    ₹{room.pricePerNight.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-90">per night</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  // Step 2: Primary Guest Details
  const GuestDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Primary Guest Information</h2>
        <p className="text-gray-600">Please provide the primary booker's details</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={bookingData.primaryGuest.name}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, name: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={bookingData.primaryGuest.email}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, email: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={bookingData.primaryGuest.phone}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, phone: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={bookingData.primaryGuest.address}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, address: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              value={bookingData.primaryGuest.city}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, city: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              value={bookingData.primaryGuest.state}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, state: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN Code *
            </label>
            <input
              type="text"
              value={bookingData.primaryGuest.pincode}
              onChange={(e) => {
                const value = e.target.value
                setBookingData(prev => ({
                  ...prev,
                  primaryGuest: { ...prev.primaryGuest, pincode: value }
                }))
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={bookingData.primaryGuest.emergencyContact.name}
                onChange={(e) => {
                  const value = e.target.value
                  setBookingData(prev => ({
                    ...prev,
                    primaryGuest: {
                      ...prev.primaryGuest,
                      emergencyContact: { ...prev.primaryGuest.emergencyContact, name: value }
                    }
                  }))
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={bookingData.primaryGuest.emergencyContact.phone}
                onChange={(e) => {
                  const value = e.target.value
                  setBookingData(prev => ({
                    ...prev,
                    primaryGuest: {
                      ...prev.primaryGuest,
                      emergencyContact: { ...prev.primaryGuest.emergencyContact, phone: value }
                    }
                  }))
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <select
                value={bookingData.primaryGuest.emergencyContact.relationship}
                onChange={(e) => setBookingData(prev => ({
                  ...prev,
                  primaryGuest: {
                    ...prev.primaryGuest,
                    emergencyContact: { ...prev.primaryGuest.emergencyContact, relationship: e.target.value }
                  }
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Step 3: All Guest Details
  const AllGuestsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Guest Details</h2>
        <p className="text-gray-600">Please provide details for all guests</p>
      </div>

      <div className="space-y-4">
        {bookingData.guests.map((guest, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guest {index + 1} {index === 0 && '(Primary)'}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={guest.name}
                  onChange={(e) => {
                    const value = e.target.value
                    setBookingData(prev => {
                      const updatedGuests = [...prev.guests]
                      updatedGuests[index] = { ...updatedGuests[index], name: value }
                      return { ...prev, guests: updatedGuests }
                    })
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder={index === 0 ? bookingData.primaryGuest.name : ''}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={guest.age}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setBookingData(prev => {
                      const updatedGuests = [...prev.guests]
                      updatedGuests[index] = { ...updatedGuests[index], age: value }
                      return { ...prev, guests: updatedGuests }
                    })
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={guest.gender}
                  onChange={(e) => {
                    const updatedGuests = [...bookingData.guests]
                    updatedGuests[index].gender = e.target.value as 'Male' | 'Female' | 'Other'
                    setBookingData(prev => ({ ...prev, guests: updatedGuests }))
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Type *
                </label>
                <select
                  value={guest.idType}
                  onChange={(e) => {
                    const updatedGuests = [...bookingData.guests]
                    updatedGuests[index].idType = e.target.value as any
                    setBookingData(prev => ({ ...prev, guests: updatedGuests }))
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Aadhar">Aadhar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Number *
                </label>
                <input
                  type="text"
                  value={guest.idNumber}
                  onChange={(e) => {
                    const value = e.target.value
                    setBookingData(prev => {
                      const updatedGuests = [...prev.guests]
                      updatedGuests[index] = { ...updatedGuests[index], idNumber: value }
                      return { ...prev, guests: updatedGuests }
                    })
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {index === 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={guest.email || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setBookingData(prev => {
                        const updatedGuests = [...prev.guests]
                        updatedGuests[index] = { ...updatedGuests[index], email: value }
                        return { ...prev, guests: updatedGuests }
                      })
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={bookingData.primaryGuest.email}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Step 4: Services & Preferences
  const ServicesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Services & Preferences</h2>
        <p className="text-gray-600">Customize your stay experience</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Food Services</h3>
        <div className="space-y-4">
          <motion.label
            className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
            animate={{
              borderColor: bookingData.services.includeFood ? '#3B82F6' : '#E5E7EB',
              backgroundColor: bookingData.services.includeFood ? '#EFF6FF' : '#FFFFFF'
            }}
          >
            <input
              type="checkbox"
              checked={bookingData.services.includeFood}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                services: { ...prev.services, includeFood: e.target.checked }
              }))}
              className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-gray-900">Include Meals</span>
                  <p className="text-sm text-gray-600 mt-1">3 meals per day for all guests</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">+₹150</span>
                  <p className="text-xs text-gray-500">per person/day</p>
                </div>
              </div>
            </div>
          </motion.label>

          <motion.label
            className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
            animate={{
              borderColor: bookingData.services.includeBreakfast ? '#3B82F6' : '#E5E7EB',
              backgroundColor: bookingData.services.includeBreakfast ? '#EFF6FF' : '#FFFFFF'
            }}
          >
            <input
              type="checkbox"
              checked={bookingData.services.includeBreakfast}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                services: { ...prev.services, includeBreakfast: e.target.checked }
              }))}
              className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-gray-900">Breakfast Only</span>
                  <p className="text-sm text-gray-600 mt-1">Daily breakfast service</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">+₹200</span>
                  <p className="text-xs text-gray-500">per person/day</p>
                </div>
              </div>
            </div>
          </motion.label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Services</h3>
        <div className="space-y-4">
          <motion.label
            className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
            animate={{
              borderColor: bookingData.services.transport.pickup ? '#3B82F6' : '#E5E7EB',
              backgroundColor: bookingData.services.transport.pickup ? '#EFF6FF' : '#FFFFFF'
            }}
          >
            <input
              type="checkbox"
              checked={bookingData.services.transport.pickup}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                services: {
                  ...prev.services,
                  transport: { ...prev.services.transport, pickup: e.target.checked }
                }
              }))}
              className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-semibold text-gray-900">Airport Pickup</span>
                    <p className="text-sm text-gray-600 mt-1">Comfortable pickup service from airport</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">+₹1,500</span>
                  <p className="text-xs text-gray-500">one-time</p>
                </div>
              </div>
            </div>
          </motion.label>

          <motion.label
            className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50"
            animate={{
              borderColor: bookingData.services.transport.drop ? '#3B82F6' : '#E5E7EB',
              backgroundColor: bookingData.services.transport.drop ? '#EFF6FF' : '#FFFFFF'
            }}
          >
            <input
              type="checkbox"
              checked={bookingData.services.transport.drop}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                services: {
                  ...prev.services,
                  transport: { ...prev.services.transport, drop: e.target.checked }
                }
              }))}
              className="mr-4 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-semibold text-gray-900">Airport Drop</span>
                    <p className="text-sm text-gray-600 mt-1">Safe drop service to airport</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">+₹1,500</span>
                  <p className="text-xs text-gray-500">one-time</p>
                </div>
              </div>
            </div>
          </motion.label>

          {(bookingData.services.transport.pickup || bookingData.services.transport.drop) && (
            <div className="pl-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Airport Location
                </label>
                <select
                  value={bookingData.services.transport.airportLocation}
                  onChange={(e) => setBookingData(prev => ({
                    ...prev,
                    services: {
                      ...prev.services,
                      transport: { ...prev.services.transport, airportLocation: e.target.value as 'Kochi' | 'Trivandrum' }
                    }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Kochi">Kochi Airport</option>
                  <option value="Trivandrum">Trivandrum Airport</option>
                </select>
              </div>

              {bookingData.services.transport.pickup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flight Number (for pickup)
                  </label>
                  <input
                    type="text"
                    value={bookingData.services.transport.flightNumber || ''}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        transport: { ...prev.services.transport, flightNumber: e.target.value }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. AI 674"
                  />
                </div>
              )}

              {bookingData.services.transport.pickup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.services.transport.arrivalTime || ''}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      services: {
                        ...prev.services,
                        transport: { ...prev.services.transport, arrivalTime: e.target.value }
                      }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
        <textarea
          value={bookingData.specialRequests}
          onChange={(e) => {
            const value = e.target.value
            setBookingData(prev => ({ ...prev, specialRequests: value }))
          }}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Any special requests or requirements..."
        />
      </div>
    </div>
  )

  // Step 5: Payment
  const PaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
        <p className="text-gray-600">Secure payment with Razorpay</p>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
        </div>

        {selectedRoom && bookingData.checkIn && bookingData.checkOut && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-900">Room {selectedRoom.roomNumber}</span>
                  <p className="text-sm text-gray-600">{selectedRoom.roomType}</p>
                </div>
                <span className="font-bold text-gray-900">₹{selectedRoom.pricePerNight.toLocaleString()}/night</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Check-in</span>
                </div>
                <p className="text-sm text-gray-900">{bookingData.checkIn.toLocaleDateString()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Check-out</span>
                </div>
                <p className="text-sm text-gray-900">{bookingData.checkOut.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Guests</span>
              </div>
              <p className="text-sm text-gray-900">{bookingData.guests.length} guests</p>
            </div>

            <div className="border-t pt-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</span>
                </div>
                <p className="text-sm opacity-90 mt-1">Includes all selected services</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {bookingId && (
        <div className="mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Booking Created Successfully!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">Complete your payment to confirm the booking</p>
          </div>

          <PaymentButton
            amount={totalAmount}
            bookingId={bookingId}
            userDetails={{
              name: bookingData.primaryGuest.name,
              email: bookingData.primaryGuest.email,
              phone: bookingData.primaryGuest.phone
            }}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      )}
    </div>
  )

  // Step 6: Success
  const SuccessStep = () => (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-6">
        Your booking has been confirmed. A confirmation email has been sent to {bookingData.primaryGuest.email}.
      </p>
      <div className="text-sm text-gray-500 mb-6">
        <p>Booking ID: {bookingId}</p>
      </div>
      <button
        onClick={() => router.push('/dashboard')}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
      >
        View My Bookings
      </button>
    </div>
  )

  const steps = [
    { number: 1, title: 'Select Room', component: <RoomSelectionStep /> },
    { number: 2, title: 'Primary Guest', component: <GuestDetailsStep /> },
    { number: 3, title: 'All Guests', component: <AllGuestsStep /> },
    { number: 4, title: 'Services', component: <ServicesStep /> },
    { number: 5, title: 'Payment', component: <PaymentStep /> },
    { number: 6, title: 'Confirmation', component: <SuccessStep /> }
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedRoom !== null
      case 2:
        return bookingData.primaryGuest.name && 
               bookingData.primaryGuest.email && 
               bookingData.primaryGuest.phone &&
               bookingData.primaryGuest.address &&
               bookingData.primaryGuest.city &&
               bookingData.primaryGuest.state &&
               bookingData.primaryGuest.pincode
      case 3:
        return bookingData.guests.every(guest => 
          guest.name && guest.age && guest.idNumber
        )
      case 4:
        return true
      default:
        return false
    }
  }

  // Price Summary Component
  const PriceSummary = () => {
    if (!selectedRoom || currentStep === 1) return null

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Room {selectedRoom.roomNumber}</span>
            <span className="font-medium">₹{selectedRoom.pricePerNight.toLocaleString()}/night</span>
          </div>

          {priceBreakdown.nights > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">{priceBreakdown.nights} nights</span>
              <span className="font-medium">₹{priceBreakdown.baseAmount.toLocaleString()}</span>
            </div>
          )}

          {priceBreakdown.foodAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Meals included</span>
              <span className="font-medium">+ ₹{priceBreakdown.foodAmount.toLocaleString()}</span>
            </div>
          )}

          {priceBreakdown.breakfastAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Breakfast</span>
              <span className="font-medium">+ ₹{priceBreakdown.breakfastAmount.toLocaleString()}</span>
            </div>
          )}

          {priceBreakdown.transportAmount > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Airport transport</span>
              <span className="font-medium">+ ₹{priceBreakdown.transportAmount.toLocaleString()}</span>
            </div>
          )}

          {bookingData.checkIn && bookingData.checkOut && (
            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in</span>
                <span className="text-sm">{bookingData.checkIn.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out</span>
                <span className="text-sm">{bookingData.checkOut.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests</span>
                <span className="text-sm">{bookingData.guests.length}</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.slice(0, 5).map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > step.number ? <CheckCircle className="w-6 h-6" /> : step.number}
                      </div>
                      <span className={`ml-2 text-sm transition-colors ${
                        currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-600'
                      }`}>{step.title}</span>
                      {index < steps.length - 2 && (
                        <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
                          currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <ErrorMessage
                  message={error}
                  onDismiss={() => setError(null)}
                  className="mb-6"
                />
              )}

              {/* Step Content */}
              <div className="mb-8">
                {steps[currentStep - 1]?.component}
              </div>

              {/* Navigation Buttons */}
              {currentStep < 6 && (
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 flex items-center gap-2 disabled:opacity-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    onClick={handleStepSubmit}
                    disabled={!canProceed() || loading || (currentStep === 5 && !bookingId)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : currentStep === 4 ? (
                      <>
                        Create Booking
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : currentStep === 5 ? (
                      'Complete Payment'
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Price Summary Sidebar */}
            <div className="lg:col-span-1">
              <PriceSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}