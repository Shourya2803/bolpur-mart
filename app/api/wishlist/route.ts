import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { insertWishlistSchema } from "@/shared/schema" // fix schema import path to local shared module
import { z } from "zod"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    const wishlistItems = await storage.getWishlistItems(userId)
    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error("Error fetching wishlist items:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist items" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = insertWishlistSchema.parse(body)
    const item = await storage.addToWishlist(validated)
    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid wishlist data", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Failed to add to wishlist" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: "Missing required parameters: userId and productId" },
        { status: 400 }
      )
    }

    await storage.removeFromWishlist(userId, productId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing item from wishlist:", error)
    return NextResponse.json(
      { error: "Failed to remove item from wishlist" },
      { status: 500 }
    )
  }
}
