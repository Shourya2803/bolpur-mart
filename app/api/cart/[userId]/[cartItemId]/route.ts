// api/cart/[userId]/[cartItemId]/route.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { FirebaseCartService } from "@/lib/firebase-cart-service"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, cartItemId } = req.query

  if (typeof userId !== "string" || typeof cartItemId !== "string") {
    return res.status(400).json({ message: "Invalid parameters" })
  }

  switch (req.method) {
    case "PUT": {
      try {
        const { quantity } = req.body
        if (typeof quantity !== "number") {
          return res.status(400).json({ message: "Quantity must be a number" })
        }
        const updatedCart = await FirebaseCartService.updateItem(userId, cartItemId, quantity)
        return res.status(200).json(updatedCart)
      } catch (err) {
        return res.status(500).json({ message: "Failed to update cart item" })
      }
    }

    case "DELETE": {
      try {
        const updatedCart = await FirebaseCartService.removeItem(userId, cartItemId)
        return res.status(200).json(updatedCart)
      } catch (err) {
        return res.status(500).json({ message: "Failed to remove cart item" })
      }
    }

    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}
