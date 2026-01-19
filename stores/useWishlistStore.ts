// stores/useWishlistStore.ts - Update the store to remove global loading
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { FirebaseWishlistService } from '@/lib/firebase-wishlist-service'
import { toast } from '@/hooks/use-toast'

interface WishlistState {
  wishlistedProducts: Set<string>
  initialized: boolean

  init: (userId: string | null) => Promise<void>
  addToWishlist: (userId: string | null, productId: string) => Promise<void>
  removeFromWishlist: (userId: string | null, productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: (userId: string | null) => Promise<void>
}

export const useWishlistStore = create<WishlistState>()(
  devtools((set, get) => ({
    wishlistedProducts: new Set(),
    initialized: false,

    init: async (userId) => {
      const state = get()
      
      if (state.initialized) return

      try {
        if (!userId) {
          // Guest user - load from localStorage
          const storedWishlist = localStorage.getItem('bolpur-mart-guest-wishlist')
          const guestWishlist = storedWishlist ? JSON.parse(storedWishlist) : []
          set({ 
            wishlistedProducts: new Set(guestWishlist), 
            initialized: true 
          })
        } else {
          // Logged in user - load from Firebase
          const wishlistItems = await FirebaseWishlistService.getUserWishlist(userId)
          const productIds = wishlistItems.map(item => item.productId)
          set({ 
            wishlistedProducts: new Set(productIds), 
            initialized: true 
          })
        }
      } catch (error) {
        console.error('Wishlist initialization error:', error)
        set({ wishlistedProducts: new Set(), initialized: true })
      }
    },

    addToWishlist: async (userId, productId) => {
      try {
        if (!userId) {
          // Guest user - save to localStorage
          set(state => {
            const newWishlist = new Set(state.wishlistedProducts)
            newWishlist.add(productId)
            
            localStorage.setItem('bolpur-mart-guest-wishlist', JSON.stringify([...newWishlist]))
            
            return { 
              wishlistedProducts: newWishlist
            }
          })
        } else {
          // Logged in user - save to Firebase
          await FirebaseWishlistService.addToWishlist(userId, productId)
          
          set(state => ({
            wishlistedProducts: new Set([...state.wishlistedProducts, productId])
          }))
        }

        toast({
          title: "Added to Wishlist",
          description: "Product has been added to your wishlist."
        })
      } catch (error) {
        console.error('Add to wishlist error:', error)
        throw error // Re-throw to handle in component
      }
    },

    removeFromWishlist: async (userId, productId) => {
      try {
        if (!userId) {
          // Guest user - remove from localStorage
          set(state => {
            const newWishlist = new Set(state.wishlistedProducts)
            newWishlist.delete(productId)
            
            localStorage.setItem('bolpur-mart-guest-wishlist', JSON.stringify([...newWishlist]))
            
            return { 
              wishlistedProducts: newWishlist
            }
          })
        } else {
          // Logged in user - remove from Firebase
          await FirebaseWishlistService.removeFromWishlist(userId, productId)
          
          set(state => {
            const newWishlist = new Set(state.wishlistedProducts)
            newWishlist.delete(productId)
            return {
              wishlistedProducts: newWishlist
            }
          })
        }

        toast({
          title: "Removed from Wishlist",
          description: "Product has been removed from your wishlist."
        })
      } catch (error) {
        console.error('Remove from wishlist error:', error)
        throw error // Re-throw to handle in component
      }
    },

    isInWishlist: (productId) => {
      const { wishlistedProducts } = get()
      return wishlistedProducts.has(productId)
    },

    clearWishlist: async (userId) => {
      try {
        if (!userId) {
          localStorage.removeItem('bolpur-mart-guest-wishlist')
          set({ wishlistedProducts: new Set() })
        } else {
          await FirebaseWishlistService.clearWishlist(userId)
          set({ wishlistedProducts: new Set() })
        }

        toast({
          title: "Wishlist Cleared",
          description: "All items have been removed from your wishlist."
        })
      } catch (error) {
        console.error('Clear wishlist error:', error)
        throw error
      }
    }
  }))
)
