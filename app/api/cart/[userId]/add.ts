// api/cart/[userId]/add.ts
import type { NextApiRequest, NextApiResponse } from "next"
import { FirebaseCartService } from "@/lib/firebase-cart-service"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const { userId } = req.query
  if (typeof userId !== "string") {
    return res.status(400).json({ message: "Invalid userId" })
  }

  const { productId, quantity, variant } = req.body
  if (typeof productId !== "string" || typeof quantity !== "number") {
    return res.status(400).json({ message: "Invalid productId or quantity" })
  }

  try {
    const updatedCart = await FirebaseCartService.addItem(userId, productId, quantity, variant)
    return res.status(200).json(updatedCart)
  } catch (err) {
    return res.status(500).json({ message: "Failed to add cart item" })
  }
}
