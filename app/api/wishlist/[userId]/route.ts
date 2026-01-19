import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"


export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  try {
    const wishlist = await storage.getWishlistItems(params.userId)
    const itemsWithProducts = await Promise.all(
      wishlist.map(async (item) => {
        const product = await storage.getProduct(item.productId!)
        return { ...item, product }
      }),
    )
    return NextResponse.json(itemsWithProducts)
  } catch {
    return NextResponse.json({ message: "Failed to fetch wishlist" }, { status: 500 })
  }
}
