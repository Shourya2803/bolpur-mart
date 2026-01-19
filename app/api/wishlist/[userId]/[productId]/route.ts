import { storage } from "@/lib/storage";
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: { userId: string; productId: string } }) {
  try {
    const ok = await storage.removeFromWishlist(params.userId, params.productId)
    if (!ok) {
      return NextResponse.json({ message: "Wishlist item not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Item removed from wishlist" })
  } catch {
    return NextResponse.json({ message: "Failed to remove from wishlist" }, { status: 500 })
  }
}
