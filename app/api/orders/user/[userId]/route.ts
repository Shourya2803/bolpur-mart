import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  try {
    const orders = await storage.getOrders(params.userId)
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 })
  }
}
