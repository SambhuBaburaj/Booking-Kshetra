import { format, differenceInDays, parseISO, addDays } from 'date-fns'
import { SERVICE_PRICES } from '../lib/api'
import { BookingFormData, PricingBreakdown, GuestInfo } from '../types'

// Date utility functions
export const formatDate = (date: Date | string, formatString: string = 'yyyy-MM-dd'): string => {
  if (typeof date === 'string') {
    return format(parseISO(date), formatString)
  }
  return format(date, formatString)
}

export const formatDisplayDate = (date: Date | string): string => {
  return formatDate(date, 'MMM dd, yyyy')
}

export const calculateNights = (checkIn: Date | string, checkOut: Date | string): number => {
  const start = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const end = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut
  return Math.max(0, differenceInDays(end, start))
}

export const addDaysToDate = (date: Date | string, days: number): Date => {
  const baseDate = typeof date === 'string' ? parseISO(date) : date
  return addDays(baseDate, days)
}

export const isDateInRange = (
  date: Date | string, 
  startDate: Date | string, 
  endDate: Date | string
): boolean => {
  const checkDate = typeof date === 'string' ? parseISO(date) : date
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate
  
  return checkDate >= start && checkDate <= end
}

// Pricing calculation utilities
export const calculateRoomCharges = (
  pricePerNight: number, 
  nights: number
): number => {
  return pricePerNight * nights
}

export const calculateFoodCharges = (
  adults: number, 
  nights: number, 
  pricePerAdultPerDay: number = SERVICE_PRICES.FOOD
): number => {
  return adults * nights * pricePerAdultPerDay
}

export const calculateTransportCharges = (
  hasPickup: boolean, 
  hasDrop: boolean
): number => {
  let total = 0
  if (hasPickup) total += SERVICE_PRICES.TRANSPORT.PICKUP
  if (hasDrop) total += SERVICE_PRICES.TRANSPORT.DROP
  return total
}

export const calculateBreakfastCharges = (
  persons: number, 
  days: number
): number => {
  return persons * days * SERVICE_PRICES.BREAKFAST
}

export const calculateServiceCharges = (
  bikeRental: { enabled: boolean; quantity: number; days: number },
  sightseeing: { enabled: boolean; persons: number },
  surfing: { enabled: boolean; persons: number }
): number => {
  let total = 0
  
  if (bikeRental.enabled) {
    total += bikeRental.quantity * bikeRental.days * SERVICE_PRICES.BIKE_RENTAL
  }
  
  if (sightseeing.enabled) {
    total += sightseeing.persons * SERVICE_PRICES.SIGHTSEEING
  }
  
  if (surfing.enabled) {
    total += surfing.persons * SERVICE_PRICES.SURFING
  }
  
  return total
}

export const calculateYogaCharges = (
  enabled: boolean, 
  type: '200hr' | '300hr'
): number => {
  if (!enabled) return 0
  return SERVICE_PRICES.YOGA[type]
}

export const calculateTotalPricing = (formData: BookingFormData): PricingBreakdown => {
  const { room, dates, guests, transport, breakfast, services, yogaSession } = formData
  
  // Room charges
  const roomCharges = calculateRoomCharges(room.pricePerNight, dates.nights)
  
  // Food charges (included in room booking)
  const foodCharges = calculateFoodCharges(guests.adults, dates.nights)
  
  // Transport charges
  const transportCharges = calculateTransportCharges(
    transport.pickup, 
    transport.drop
  )
  
  // Breakfast charges
  const breakfastCharges = breakfast.enabled 
    ? calculateBreakfastCharges(breakfast.persons, breakfast.days)
    : 0
  
  // Service charges
  const serviceCharges = calculateServiceCharges(
    services.bikeRental,
    services.sightseeing,
    services.surfing
  )
  
  // Yoga charges
  const yogaCharges = calculateYogaCharges(
    yogaSession.enabled, 
    yogaSession.type || '200hr'
  )
  
  const totalAmount = roomCharges + foodCharges + transportCharges + 
                     breakfastCharges + serviceCharges + yogaCharges
  
  return {
    roomCharges,
    foodCharges,
    transportCharges,
    breakfastCharges,
    serviceCharges,
    yogaCharges,
    totalAmount
  }
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+91|91)?[6789]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateBookingDates = (checkIn: Date | null, checkOut: Date | null): {
  isValid: boolean
  error?: string
} => {
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'Both check-in and check-out dates are required' }
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (checkIn < today) {
    return { isValid: false, error: 'Check-in date cannot be in the past' }
  }
  
  if (checkOut <= checkIn) {
    return { isValid: false, error: 'Check-out date must be after check-in date' }
  }
  
  const nights = calculateNights(checkIn, checkOut)
  if (nights > 30) {
    return { isValid: false, error: 'Maximum stay duration is 30 nights' }
  }
  
  return { isValid: true }
}

export const validateGuestInfo = (guests: GuestInfo): {
  isValid: boolean
  error?: string
} => {
  if (guests.adults < 1) {
    return { isValid: false, error: 'At least one adult is required' }
  }
  
  if (guests.adults > 6) {
    return { isValid: false, error: 'Maximum 6 adults allowed per booking' }
  }
  
  if (guests.children < 0 || guests.children > 4) {
    return { isValid: false, error: 'Maximum 4 children allowed per booking' }
  }
  
  if (guests.children > 0 && guests.childrenAges.length !== guests.children) {
    return { isValid: false, error: 'Please provide ages for all children' }
  }
  
  return { isValid: true }
}

export const validateSurfingAge = (persons: number, guestAges: number[]): {
  isValid: boolean
  error?: string
} => {
  const adultAges = guestAges.filter(age => age >= 15)
  
  if (persons > adultAges.length) {
    return { 
      isValid: false, 
      error: 'Surfing requires minimum age of 15. Not enough eligible participants.' 
    }
  }
  
  return { isValid: true }
}

// Formatting utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num)
}

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Check if it starts with country code
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}

// Local storage utilities
export const saveToStorage = (key: string, data: any): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }
}

export const getFromStorage = (key: string): any => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }
  return null
}

export const removeFromStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }
}

// URL utilities
export const buildBookingUrl = (params: {
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  roomType?: string
}): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString())
    }
  })
  
  return `/booking?${searchParams.toString()}`
}

export const parseBookingUrl = (searchParams: URLSearchParams) => {
  return {
    checkIn: searchParams.get('checkIn'),
    checkOut: searchParams.get('checkOut'),
    adults: searchParams.get('adults') ? parseInt(searchParams.get('adults')!) : 2,
    children: searchParams.get('children') ? parseInt(searchParams.get('children')!) : 0,
    roomType: searchParams.get('roomType') as 'AC' | 'Non-AC' | undefined
  }
}

// Error handling utilities
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error
  
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

// Booking status utilities
export const getBookingStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'text-green-600 bg-green-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'cancelled':
      return 'text-red-600 bg-red-100'
    case 'completed':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}