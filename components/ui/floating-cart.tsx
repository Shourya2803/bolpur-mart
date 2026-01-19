"use client"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/useCartStore"
import { useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { FirebaseProductService } from "@/lib/firebase-products"
import type { Product } from "@/types"

interface FloatingCartProps {
  userId: string
  onOpenCart: () => void
}

export function FloatingCart({ userId, onOpenCart }: FloatingCartProps) {
  const { items } = useCartStore()

  // Fetch product details for cart items
  const { data: products = [], refetch } = useQuery<Product[]>({
    queryKey: ["floating-cart-products", items.map(item => item.productId)],
    queryFn: async () => {
      if (items.length === 0) return [];

      const productIds = [...new Set(items.map(item => item.productId))];
      const productPromises = productIds.map(id =>
        FirebaseProductService.getProductById(id)
      );

      const products = await Promise.all(productPromises);
      return products.filter(Boolean) as Product[];
    },
    enabled: items.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (items.length <= 0) {
      refetch();
    }
  }, [items, refetch]);

  // Calculate cart summary with dynamic pricing
  const cartSummary = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const subtotal = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return sum;

      // Use discounted price if available, otherwise use regular price
      const price = product.hasDiscount && product.discountedPrice
        ? product.discountedPrice
        : product.price;

      return sum + (price * item.quantity);
    }, 0);

    // const deliveryFee = subtotal > 500 ? 0 : 50;
    // const taxes = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal

    return {
      itemCount,
      subtotal,
      total
    }
  }, [items, products])

  if (cartSummary.itemCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto" data-testid="floating-cart">
      <Button
        onClick={onOpenCart}
        className="floating-btn w-full bg-primary text-primary-foreground py-4 rounded-2xl flex items-center justify-between px-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
        data-testid="view-cart-button"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground text-primary rounded-full flex items-center justify-center font-bold">
            <span data-testid="cart-item-count">{cartSummary.itemCount}</span>
          </div>
          <span className="font-semibold">View Cart</span>
        </div>
        <div className="text-right">
          <div className="font-bold" data-testid="cart-total">
            ₹{cartSummary.total.toFixed(0)}
          </div>
          <div className="text-xs opacity-80">Plus taxes</div>
        </div>
      </Button>
    </div>
  )
}
