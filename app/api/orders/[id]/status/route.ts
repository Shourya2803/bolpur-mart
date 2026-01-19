import { type NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    const updated = await storage.updateOrderStatus(params.id, status)
    if (!updated) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 })
  }
}
