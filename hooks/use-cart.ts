"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import type { CartItem, Product } from "@/types"
import { toast } from "@/hooks/use-toast"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export function useCart(userId: string) {
  const queryClient = useQueryClient()

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart/user", userId],
    enabled: !!userId,
  })

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number; variant?: string }) => {
      const response = await apiRequest("POST", "/api/cart", {
        userId,
        ...data,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart/user", userId] })
      toast.success({
        title: "Added to cart",
        description: "Item has been added to your cart",
      })
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to add item to cart",
      })
    },
  })

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async (data: { id: string; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/item/${data.id}`, {
        quantity: data.quantity,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart/user", userId] })
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to update cart item",
      })
    },
  })

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      const response = await apiRequest("DELETE", `/api/cart/item/${cartItemId}`)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart/user", userId] })
      toast.success({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      })
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to remove item from cart",
      })
    },
  })

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/cart/user/${userId}`)
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart/user", userId] })
      toast.success({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      })
    },
    onError: () => {
      toast.error({
        title: "Error",
        description: "Failed to clear cart",
      })
    },
  })

  // Calculate cart totals
const cartSummary = {
  itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: cartItems.reduce((sum, item) => {
    const price = item.product
      ? (item.product.discountedPrice !== undefined ? item.product.discountedPrice : item.product.price)
      : 0;
    return sum + (price ?? 0) * item.quantity;
  }, 0),
  get deliveryFee() {
    return this.subtotal >= 299 ? 0 : 30; // Free delivery above ₹299
  },
  get taxes() {
    return Math.round(this.subtotal * 0.05); // 5% tax
  },
  get total() {
    return this.subtotal + this.deliveryFee + this.taxes;
  },
};


  // Helper functions
  const addToCart = (productId: string, quantity = 1, variant?: string) => {
    addToCartMutation.mutate({ productId, quantity, variant })
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartMutation.mutate(cartItemId)
    } else {
      updateCartMutation.mutate({ id: cartItemId, quantity })
    }
  }

  const removeItem = (cartItemId: string) => {
    removeFromCartMutation.mutate(cartItemId)
  }

  const clearCart = () => {
    clearCartMutation.mutate()
  }

  const getCartItemQuantity = (productId: string, variant?: string): number => {
    const item = cartItems.find((item) => item.productId === productId && item.variant === variant)
    return item?.quantity || 0
  }

  const isInCart = (productId: string, variant?: string): boolean => {
    return getCartItemQuantity(productId, variant) > 0
  }

  return {
    cartItems,
    cartSummary,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCartItemQuantity,
    isInCart,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateCartMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  }
}
