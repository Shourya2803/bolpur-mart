import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { TimeSlotType } from "@/shared/schema"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const category = searchParams.get("category")
    const timeSlot = searchParams.get("timeSlot")
    const search = searchParams.get("search")

    let products
    if (search) {
      products = await storage.searchProducts(search)
    } else if (timeSlot) {
      products = await storage.getProductsByTimeSlot(timeSlot as TimeSlotType)
    } else if (category) {
      products = await storage.getProductsByCategory(category)
    } else {
      products = await storage.getProducts()
    }

    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 })
  }
}
