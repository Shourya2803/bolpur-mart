 // api/cart/[userId]/merge.ts
 
 import type { NextApiRequest, NextApiResponse } from 'next'
import { FirebaseCartService } from '@/lib/firebase-cart-service'

interface CartItemInput {
  productId: string
  quantity: number
  variant?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { userId } = req.query
  if (typeof userId !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing userId' })
  }

  const { items } = req.body as { items: CartItemInput[] }
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items must be an array' })
  }

  try {
    // Fetch current user's cart
    const existingCart = await FirebaseCartService.getCart(userId)

    // Merge items: sum quantities if same productId+variant
    const mergedMap = new Map<string, CartItemInput>()

    // Add existing items to the map
    for (const item of existingCart) {
      const key = `${item.productId}-${item.variant || ''}`
      mergedMap.set(key, { productId: item.productId, quantity: item.quantity, variant: item.variant })
    }

    // Merge guest items
    for (const item of items) {
      const key = `${item.productId}-${item.variant || ''}`
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!
        existing.quantity += item.quantity
        mergedMap.set(key, existing)
      } else {
        mergedMap.set(key, item)
      }
    }

    // Convert back to array and assign ids and userId
    const mergedCart: CartItem[] = []
    let idCounter = Date.now()
    for (const [, value] of mergedMap) {
      mergedCart.push({
        id: (idCounter++).toString(),
        userId,
        productId: value.productId,
        quantity: value.quantity,
        variant: value.variant,
      })
    }

    // Save merged cart
    await FirebaseCartService.saveCart(userId, mergedCart)

    return res.status(200).json(mergedCart)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to merge carts' })
  }
}
