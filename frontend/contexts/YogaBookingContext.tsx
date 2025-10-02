'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface YogaSession {
  _id: string;
  type: '200hr' | '300hr';
  batchName: string;
  startDate: string;
  endDate: string;
  capacity: number;
  bookedSeats: number;
  price: number;
  instructor: {
    _id: string;
    name: string;
    bio: string;
    profileImage?: string;
  };
  schedule: {
    days: string[];
    time: string;
  };
  isActive: boolean;
  description?: string;
  prerequisites: string[];
  availableSeats?: number;
}

export interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  description: string;
  isActive: boolean;
  quantity?: number;
}

export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions: string;
  yogaExperience: string;
  dietaryRequirements: string;
  accommodationNeeds: string;
  specialRequests: string;
}

export interface BookingState {
  selectedSession: YogaSession | null;
  userDetails: UserDetails;
  selectedServices: Service[];
  totalAmount: number;
  currentStep: 'details' | 'services' | 'payment' | 'success';
}

type BookingAction =
  | { type: 'SET_SESSION'; payload: YogaSession }
  | { type: 'SET_USER_DETAILS'; payload: UserDetails }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'REMOVE_SERVICE'; payload: string }
  | { type: 'UPDATE_SERVICE_QUANTITY'; payload: { serviceId: string; quantity: number } }
  | { type: 'SET_STEP'; payload: BookingState['currentStep'] }
  | { type: 'CALCULATE_TOTAL' }
  | { type: 'RESET_BOOKING' }

const initialState: BookingState = {
  selectedSession: null,
  userDetails: {
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    yogaExperience: 'beginner',
    dietaryRequirements: '',
    accommodationNeeds: 'shared',
    specialRequests: ''
  },
  selectedServices: [],
  totalAmount: 0,
  currentStep: 'details'
}

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        selectedSession: action.payload,
        totalAmount: calculateTotal(action.payload, state.selectedServices)
      }

    case 'SET_USER_DETAILS':
      return {
        ...state,
        userDetails: action.payload
      }

    case 'ADD_SERVICE':
      const serviceExists = state.selectedServices.find(s => s._id === action.payload._id)
      let newServices: Service[]

      if (serviceExists) {
        newServices = state.selectedServices.map(s =>
          s._id === action.payload._id
            ? { ...s, quantity: (s.quantity || 1) + 1 }
            : s
        )
      } else {
        newServices = [...state.selectedServices, { ...action.payload, quantity: 1 }]
      }

      return {
        ...state,
        selectedServices: newServices,
        totalAmount: calculateTotal(state.selectedSession, newServices)
      }

    case 'REMOVE_SERVICE':
      const filteredServices = state.selectedServices.filter(s => s._id !== action.payload)
      return {
        ...state,
        selectedServices: filteredServices,
        totalAmount: calculateTotal(state.selectedSession, filteredServices)
      }

    case 'UPDATE_SERVICE_QUANTITY':
      const updatedServices = state.selectedServices.map(s =>
        s._id === action.payload.serviceId
          ? { ...s, quantity: Math.max(0, action.payload.quantity) }
          : s
      ).filter(s => (s.quantity || 0) > 0)

      return {
        ...state,
        selectedServices: updatedServices,
        totalAmount: calculateTotal(state.selectedSession, updatedServices)
      }

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      }

    case 'CALCULATE_TOTAL':
      return {
        ...state,
        totalAmount: calculateTotal(state.selectedSession, state.selectedServices)
      }

    case 'RESET_BOOKING':
      return initialState

    default:
      return state
  }
}

function calculateTotal(session: YogaSession | null, services: Service[]): number {
  const sessionPrice = session?.price || 0
  const servicesTotal = services.reduce((total, service) => {
    return total + (service.price * (service.quantity || 1))
  }, 0)
  return sessionPrice + servicesTotal
}

interface BookingContextType {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  setSession: (session: YogaSession) => void;
  setUserDetails: (details: UserDetails) => void;
  addService: (service: Service) => void;
  removeService: (serviceId: string) => void;
  updateServiceQuantity: (serviceId: string, quantity: number) => void;
  setStep: (step: BookingState['currentStep']) => void;
  resetBooking: () => void;
}

const YogaBookingContext = createContext<BookingContextType | undefined>(undefined)

export function YogaBookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const contextValue: BookingContextType = {
    state,
    dispatch,
    setSession: (session) => dispatch({ type: 'SET_SESSION', payload: session }),
    setUserDetails: (details) => dispatch({ type: 'SET_USER_DETAILS', payload: details }),
    addService: (service) => dispatch({ type: 'ADD_SERVICE', payload: service }),
    removeService: (serviceId) => dispatch({ type: 'REMOVE_SERVICE', payload: serviceId }),
    updateServiceQuantity: (serviceId, quantity) =>
      dispatch({ type: 'UPDATE_SERVICE_QUANTITY', payload: { serviceId, quantity } }),
    setStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    resetBooking: () => dispatch({ type: 'RESET_BOOKING' })
  }

  return (
    <YogaBookingContext.Provider value={contextValue}>
      {children}
    </YogaBookingContext.Provider>
  )
}

export function useYogaBooking() {
  const context = useContext(YogaBookingContext)
  if (context === undefined) {
    throw new Error('useYogaBooking must be used within a YogaBookingProvider')
  }
  return context
}