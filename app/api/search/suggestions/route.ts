import { generateSearchSuggestions } from "@/lib/services/gemini"
import { storage } from "@/lib/storage"
import { type NextRequest, NextResponse } from "next/server"


export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")
    if (!q) return NextResponse.json([])

    const products = await storage.getProducts()
    const suggestions = await generateSearchSuggestions(q, products)
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ message: "Failed to generate search suggestions" }, { status: 500 })
  }
}
