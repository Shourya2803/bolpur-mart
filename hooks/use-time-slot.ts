"use client"

import { useState, useEffect, useCallback } from "react"
import type { TimeSlotType } from "@/types"
import { 
  getCurrentTimeSlot, 
  getTimeSlotDisplay, 
  getNextTimeSlot,
  getRemainingTimeInSlot,
  getTimeSlotEmoji,
  getTimeSlotBgColor
} from "@/lib/time-utils"

export function useTimeSlot() {
  const [currentTimeSlot, setCurrentTimeSlot] = useState<TimeSlotType>(getCurrentTimeSlot())
  const [timeSlotDisplay, setTimeSlotDisplay] = useState(getTimeSlotDisplay(currentTimeSlot))
  const [nextTimeSlot, setNextTimeSlot] = useState(getNextTimeSlot())
  const [remainingTime, setRemainingTime] = useState(getRemainingTimeInSlot())

  const updateTimeSlot = useCallback(() => {
    const newTimeSlot = getCurrentTimeSlot()
    setCurrentTimeSlot(newTimeSlot)
    setTimeSlotDisplay(getTimeSlotDisplay(newTimeSlot))
    setNextTimeSlot(getNextTimeSlot())
    setRemainingTime(getRemainingTimeInSlot())
  }, [])

  useEffect(() => {
    // Update immediately
    updateTimeSlot()

    // Update every minute
    const interval = setInterval(updateTimeSlot, 60000)

    return () => clearInterval(interval)
  }, [updateTimeSlot])

  const getTimeUntilNext = (): string => {
    const now = new Date()
    const timeDiff = nextTimeSlot.startsAt.getTime() - now.getTime()

    if (timeDiff <= 0) return "Available now"

    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatRemainingTime = (): string => {
    return remainingTime.message
  }

  return {
    // Current state
    currentTimeSlot,
    timeSlotDisplay,
    nextTimeSlot,
    remainingTime,
    
    // Computed values
    currentEmoji: getTimeSlotEmoji(currentTimeSlot),
    currentBgColor: getTimeSlotBgColor(currentTimeSlot),
    
    // Helper functions
    getTimeUntilNext,
    formatRemainingTime,
    updateTimeSlot, // Manual refresh
  }
}
