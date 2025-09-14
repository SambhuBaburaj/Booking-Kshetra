'use client'

import { useState, useEffect } from 'react'

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
        const params = new URLSearchParams({
          checkIn: queryCheckIn,
          checkOut: queryCheckOut,
        })

        if (capacity) {
          params.append('capacity', capacity.toString())
        }

        const response = await fetch(`http://localhost:3001/api/rooms/availability?${params}`)

        if (!response.ok) {
          throw new Error('Failed to fetch room availability')
        }

        const result = await response.json()

        if (result.success) {
          setData(prev => ({
            ...prev,
            availableRooms: result.data.availableRooms || [],
            totalAvailable: result.data.availableRooms?.length || 0,
            isLoading: false
          }))
        } else {
          throw new Error(result.message || 'Failed to fetch availability')
        }
      } catch (error) {
        setData(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
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