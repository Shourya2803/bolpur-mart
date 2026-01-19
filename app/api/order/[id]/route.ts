import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await storage.getOrder(params.id)
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 })
  }
}
