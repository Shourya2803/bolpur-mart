// stores/useCartStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { FirebaseCartService } from '@/lib/firebase-cart-service'
import type { CartItem } from '@/types'
import { toast } from '@/hooks/use-toast'

interface CartState {
  userId: string | null
  items: CartItem[]
  loading: boolean
  initialized: boolean

  init: (userId: string | null) => Promise<void>
  addItem: (productId: string, quantity?: number, variant?: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  clear: () => Promise<void>
  mergeGuestCart: (userId: string) => Promise<void>
}

export const useCartStore = create<CartState>()(
  devtools((set, get) => ({
    userId: null,
    items: [],
    loading: false,
    initialized: false,

    init: async (userId) => {
      const state = get()
      
      // Prevent multiple initializations
      if (state.initialized && state.userId === userId) {
        return
      }

      set({ loading: true, userId: userId || null })
      
      try {
        if (!userId) {
          // Guest user - load from localStorage
          const storedCart = localStorage.getItem('bolpur-mart-guest-cart')
          const guestItems = storedCart ? JSON.parse(storedCart) : []
          set({ 
            items: guestItems, 
            loading: false, 
            initialized: true 
          })
        } else {
          // Logged in user
          // First check if there's a guest cart to merge
          const guestCart = localStorage.getItem('bolpur-mart-guest-cart')
          const guestItems = guestCart ? JSON.parse(guestCart) : []
          
          // Load existing user cart
          const userCart = await FirebaseCartService.getCart(userId)
          
          if (guestItems.length > 0) {
            // Merge guest cart with user cart
            const mergedCart = await FirebaseCartService.mergeGuestCart(userId, guestItems)
            localStorage.removeItem('bolpur-mart-guest-cart') // Clear guest cart
            set({ 
              items: mergedCart, 
              loading: false, 
              initialized: true 
            })
          } else {
            // No guest cart, just use user cart
            set({ 
              items: userCart, 
              loading: false, 
              initialized: true 
            })
          }
        }
      } catch (error) {
        console.error('Cart initialization error:', error)
        set({ items: [], loading: false, initialized: true })
        toast({
          title: "Cart Load Error",
          description: "Unable to load cart.",
          variant: "destructive"
        })
      }
    },

    addItem: async (productId, quantity = 1, variant) => {
      const { userId } = get()
      
      // Validate inputs
      if (!productId || quantity <= 0) {
        toast({
          title: "Invalid Item",
          description: "Cannot add invalid item to cart.",
          variant: "destructive"
        })
        return
      }

      set({ loading: true })

      try {
        if (!userId) {
          // Guest cart in localStorage
          set(state => {
            const newItems = [...state.items]
            const existingItemIndex = newItems.findIndex(
              item => item.productId === productId && item.variant === variant
            )

            if (existingItemIndex > -1) {
              newItems[existingItemIndex].quantity += quantity
              newItems[existingItemIndex].updatedAt = new Date().toISOString()
            } else {
              const newItem: CartItem = {
                id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                productId,
                quantity,
                variant: variant || undefined, // Ensure undefined instead of empty string
                userId: 'guest',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              newItems.push(newItem)
            }

            // Save to localStorage
            localStorage.setItem('bolpur-mart-guest-cart', JSON.stringify(newItems))
            return { items: newItems, loading: false }
          })
        } else {
          // Logged in user - save to Firestore
          const updated = await FirebaseCartService.addItem(userId, productId, quantity, variant)
          set({ items: updated, loading: false })
        }

        toast({
          title: "Added to Cart",
          description: "Product added successfully."
        })
      } catch (error) {
        console.error('Add to cart error:', error)
        set({ loading: false })
        toast({
          title: "Add to Cart Failed",
          description: "Unable to add product.",
          variant: "destructive"
        })
      }
    },

    updateQuantity: async (cartItemId, quantity) => {
      const { userId } = get()
      
      if (quantity < 0) {
        return
      }

      set({ loading: true })

      try {
        if (!userId) {
          // Guest local cart handling
          set(state => {
            const newItems = [...state.items]
            const itemIndex = newItems.findIndex(item => item.id === cartItemId)
            
            if (itemIndex === -1) {
              return { ...state, loading: false }
            }

            if (quantity === 0) {
              newItems.splice(itemIndex, 1)
            } else {
              newItems[itemIndex].quantity = quantity
              newItems[itemIndex].updatedAt = new Date().toISOString()
            }

            localStorage.setItem('bolpur-mart-guest-cart', JSON.stringify(newItems))
            return { items: newItems, loading: false }
          })
        } else {
          // Logged in user
          const updated = await FirebaseCartService.updateItem(userId, cartItemId, quantity)
          set({ items: updated, loading: false })
        }

        toast({
          title: "Cart Updated",
          description: "Quantity updated."
        })
      } catch (error) {
        console.error('Update quantity error:', error)
        set({ loading: false })
        toast({
          title: "Update Failed",
          description: "Unable to update quantity.",
          variant: "destructive"
        })
      }
    },

    removeItem: async (cartItemId) => {
      const { userId } = get()

      set({ loading: true })

      try {
        if (!userId) {
          set(state => {
            const newItems = state.items.filter(item => item.id !== cartItemId)
            localStorage.setItem('bolpur-mart-guest-cart', JSON.stringify(newItems))
            return { items: newItems, loading: false }
          })
        } else {
          const updated = await FirebaseCartService.removeItem(userId, cartItemId)
          set({ items: updated, loading: false })
        }

        toast({
          title: "Item Removed",
          description: "Item removed successfully."
        })
      } catch (error) {
        console.error('Remove item error:', error)
        set({ loading: false })
        toast({
          title: "Remove Failed",
          description: "Unable to remove item.",
          variant: "destructive"
        })
      }
    },

    clear: async () => {
      const { userId } = get()

      set({ loading: true })

      try {
        if (!userId) {
          localStorage.removeItem('bolpur-mart-guest-cart')
          set({ items: [], loading: false })
        } else {
          await FirebaseCartService.clearCart(userId)
          set({ items: [], loading: false })
        }

        toast({
          title: "Cart Cleared",
          description: "All items removed."
        })
      } catch (error) {
        console.error('Clear cart error:', error)
        set({ loading: false })
        toast({
          title: "Clear Failed",
          description: "Unable to clear cart.",
          variant: "destructive"
        })
      }
    },

    mergeGuestCart: async (userId) => {
      try {
        const guestCart = localStorage.getItem('bolpur-mart-guest-cart')
        if (!guestCart) return

        const guestItems = JSON.parse(guestCart)
        if (guestItems.length === 0) return

        const mergedCart = await FirebaseCartService.mergeGuestCart(userId, guestItems)
        localStorage.removeItem('bolpur-mart-guest-cart')
        set({ items: mergedCart })
        
        toast({
          title: "Cart Synced",
          description: "Your cart has been synced successfully."
        })
      } catch (error) {
        console.error('Merge guest cart error:', error)
        toast({
          title: "Sync Failed",
          description: "Unable to sync cart.",
          variant: "destructive"
        })
      }
    }
  }))
)
