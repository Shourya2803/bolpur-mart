import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { insertOrderSchema } from "@/shared/schema" // fix schema import path to local shared module
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

    const orders = await storage.getOrders(userId);
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = insertOrderSchema.parse(body)
    const order = await storage.createOrder(validated)

    // Clear user's cart after order
    if (validated.userId) {
      await storage.clearCart(validated.userId)
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid order data", errors: error.errors }, { status: 400 })
    }
    return NextResponse.json({ message: "Failed to create order" }, { status: 500 })
  }
}
