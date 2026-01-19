"use client"
import { useEffect } from 'react'
import { initializeAuth } from '@/stores/auth-store'

export function AuthInitializer() {
  useEffect(() => {
    // Initialize Firebase auth state listener
    const unsubscribe = initializeAuth()
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
