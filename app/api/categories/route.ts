import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const categories = await storage.getCategories()
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
  }
}
