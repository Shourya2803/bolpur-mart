import type { TimeSlotType } from "@/types"

export interface TimeSlotInfo {
  label: string
  time: string
  description: string
  startsAt: Date
  endsAt: Date
}

export function getCurrentTimeSlot(): TimeSlotType {
  const now = new Date()
  const hour = now.getHours()

  if (hour >= 6 && hour < 12) {
    return "morning"      // 6 AM - 12 PM
  } else if (hour >= 12 && hour < 17) {
    return "afternoon"    // 12 PM - 5 PM
  } else if (hour >= 17 && hour < 22) {
    return "evening"      // 5 PM - 10 PM
  } else {
    return "night"        // 10 PM - 6 AM
  }
}

export function getTimeSlotDisplay(timeSlot: TimeSlotType): { 
  label: string
  time: string
  description: string 
} {
  switch (timeSlot) {
    case "morning":
      return {
        label: "Morning Fresh",
        time: "6:00 AM - 12:00 PM",
        description: "Fresh Vegetables, Fruits & Breakfast Items",
      }
    case "afternoon":
      return {
        label: "Afternoon Essentials",
        time: "12:00 PM - 5:00 PM", 
        description: "Groceries, Medicine & Lunch Specials",
      }
    case "evening":
      return {
        label: "Evening Delights",
        time: "5:00 PM - 10:00 PM",
        description: "Biryani, Snacks & Evening Meals",
      }
    case "night":
      return {
        label: "Night Service",
        time: "10:00 PM - 6:00 AM",
        description: "24/7 Essentials & Late Night Delivery",
      }
    default:
      return {
        label: "Always Open",
        time: "24/7 Available",
        description: "Quick commerce available around the clock",
      }
  }
}

export function getNextTimeSlot(): { timeSlot: TimeSlotType; startsAt: Date } {
  const now = new Date()
  const hour = now.getHours()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (hour < 6) {
    // Before 6 AM - next is morning today
    return { 
      timeSlot: "morning", 
      startsAt: new Date(today.getTime() + 6 * 60 * 60 * 1000) 
    }
  } else if (hour < 12) {
    // Morning - next is afternoon today
    return { 
      timeSlot: "afternoon", 
      startsAt: new Date(today.getTime() + 12 * 60 * 60 * 1000) 
    }
  } else if (hour < 17) {
    // Afternoon - next is evening today
    return { 
      timeSlot: "evening", 
      startsAt: new Date(today.getTime() + 17 * 60 * 60 * 1000) 
    }
  } else if (hour < 22) {
    // Evening - next is night today
    return { 
      timeSlot: "night", 
      startsAt: new Date(today.getTime() + 22 * 60 * 60 * 1000) 
    }
  } else {
    // Night - next is morning tomorrow
    return { 
      timeSlot: "morning", 
      startsAt: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000) 
    }
  }
}

export function getRemainingTimeInSlot(): {
  hours: number
  minutes: number
  totalMinutes: number
  message: string
} {
  const now = new Date()
  const currentSlot = getCurrentTimeSlot()
  const nextSlot = getNextTimeSlot()
  
  const timeDiff = nextSlot.startsAt.getTime() - now.getTime()
  const totalMinutes = Math.max(0, Math.floor(timeDiff / (1000 * 60)))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  let message = ""
  if (totalMinutes <= 0) {
    message = "Time slot ending soon"
  } else if (hours > 0) {
    message = `${hours}h ${minutes}m remaining`
  } else {
    message = `${minutes}m remaining`
  }
  
  return { hours, minutes, totalMinutes, message }
}

export function getTimeSlotEmoji(timeSlot: TimeSlotType): string {
  switch (timeSlot) {
    case "morning":
      return "🌅"
    case "afternoon":
      return "☀️"
    case "evening":
      return "🌆"
    case "night":
      return "🌙"
    default:
      return "⏰"
  }
}

export function getTimeSlotBgColor(timeSlot: TimeSlotType): string {
  switch (timeSlot) {
    case "morning":
      return "from-orange-400 to-amber-500"
    case "afternoon":
      return "from-blue-500 to-cyan-500"
    case "evening":
      return "from-purple-500 to-indigo-600"
    case "night":
      return "from-indigo-900 to-purple-900"
    default:
      return "from-green-500 to-emerald-600"
  }
}
