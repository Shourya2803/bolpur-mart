import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await storage.getProduct(params.id)
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 })
  }
}
