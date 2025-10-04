'use client'

import { useState, useEffect } from 'react'
import { roomAPI } from '../lib/api'

interface UseRoomAvailabilityParams {
  checkIn?: string
  checkOut?: string
  capacity?: number
}

interface RoomAvailabilityData {
  availableRooms: any[]
  totalAvailable: number
  isLoading: boolean
  error: string | null
}

export function useRoomAvailability({ checkIn, checkOut, capacity }: UseRoomAvailabilityParams = {}): RoomAvailabilityData {
  const [data, setData] = useState<RoomAvailabilityData>({
    availableRooms: [],
    totalAvailable: 0,
    isLoading: false,
    error: null
  })

  useEffect(() => {
    const fetchAvailability = async () => {
      // If no dates provided, fetch general availability for today
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const queryCheckIn = checkIn || today
      const queryCheckOut = checkOut || tomorrowStr

      setData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const params: any = {
          checkIn: queryCheckIn,
          checkOut: queryCheckOut,
        }

        if (capacity) {
          params.capacity = capacity
        }

        const response = await roomAPI.checkAvailability(params)

        if (response.data.success) {
          setData(prev => ({
            ...prev,
            availableRooms: response.data.data.availableRooms || [],
            totalAvailable: response.data.data.availableRooms?.length || 0,
            isLoading: false
          }))
        } else {
          throw new Error(response.data.message || 'Failed to fetch availability')
        }
      } catch (error: any) {
        setData(prev => ({
          ...prev,
          error: error.response?.data?.message || error.message || 'Unknown error occurred',
          isLoading: false,
          totalAvailable: 0,
          availableRooms: []
        }))
      }
    }

    fetchAvailability()
  }, [checkIn, checkOut, capacity])

  return data
}