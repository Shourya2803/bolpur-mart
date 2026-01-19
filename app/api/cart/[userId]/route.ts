// api/cart/[userId]/[cartItemId]/route.ts

import type { NextApiRequest, NextApiResponse } from "next"
import { FirebaseCartService } from "@/lib/firebase-cart-service"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query

  if (typeof userId !== "string") {
    return res.status(400).json({ message: "Invalid userId" })
  }

  switch (req.method) {
    case "GET": {
      try {
        const cart = await FirebaseCartService.getCart(userId)
        return res.status(200).json(cart)
      } catch (err) {
        return res.status(500).json({ message: "Failed to fetch cart" })
      }
    }

    case "DELETE": {
      try {
        await FirebaseCartService.clearCart(userId)
        return res.status(200).json({ message: "Cart cleared" })
      } catch (err) {
        return res.status(500).json({ message: "Failed to clear cart" })
      }
    }

    default:
      return res.status(405).json({ message: "Method not allowed" })
  }
}
