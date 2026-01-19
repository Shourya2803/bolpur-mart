// lib/auth/token-manager.ts
import Cookies from 'js-cookie'

const TOKEN_KEY = 'bolpur_mart_token'
const REFRESH_TOKEN_KEY = 'bolpur_mart_refresh_token'
const USER_DATA_KEY = 'bolpur_mart_user'

export class TokenManager {
  // Set authentication token with 7-day expiry (regardless of rememberMe)
  static setToken(token: string, rememberMe: boolean = false) {
    const expires = 7 // Always 7 days
    
    Cookies.set(TOKEN_KEY, token, {
      expires,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  }

  // Get authentication token
  static getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || null
  }

  // Set refresh token
  static setRefreshToken(refreshToken: string) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30, // 30 days for refresh token
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      httpOnly: false // Note: js-cookie can't set httpOnly, this should be handled server-side
    })
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    return Cookies.get(REFRESH_TOKEN_KEY) || null
  }

  // Store user data
  static setUserData(userData: any) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
  }

  // Get user data
  static getUserData(): any | null {
    try {
      const userData = localStorage.getItem(USER_DATA_KEY)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  // Clear all auth data
  static clearAuthData() {
    Cookies.remove(TOKEN_KEY, { path: '/' })
    Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' })
    localStorage.removeItem(USER_DATA_KEY)
  }

  // Check if token exists and is valid
  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      // Basic token validation (you can enhance this)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch {
      return false
    }
  }

  // Get token expiration time
  static getTokenExpiration(): number | null {
    const token = this.getToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 // Convert to milliseconds
    } catch {
      return null
    }
  }

  // Check if token needs refresh (expires in next 10 minutes)
  static needsRefresh(): boolean {
    const expiration = this.getTokenExpiration()
    if (!expiration) return false

    const tenMinutesFromNow = Date.now() + (10 * 60 * 1000)
    return expiration < tenMinutesFromNow
  }

  // Get remaining token time in human readable format
  static getTokenTimeRemaining(): string | null {
    const expiration = this.getTokenExpiration()
    if (!expiration) return null

    const now = Date.now()
    const timeLeft = expiration - now

    if (timeLeft <= 0) return 'Expired'

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  // Check if user has been active recently (useful for auto-logout)
  static updateLastActivity() {
    localStorage.setItem('last_activity', Date.now().toString())
  }

  static getLastActivity(): number | null {
    const lastActivity = localStorage.getItem('last_activity')
    return lastActivity ? parseInt(lastActivity) : null
  }

  // Check if user has been inactive for too long (e.g., 24 hours)
  static isInactive(maxInactiveHours: number = 24): boolean {
    const lastActivity = this.getLastActivity()
    if (!lastActivity) return false

    const maxInactiveMs = maxInactiveHours * 60 * 60 * 1000
    return (Date.now() - lastActivity) > maxInactiveMs
  }
}
