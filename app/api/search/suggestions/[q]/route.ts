import { generateSearchSuggestions } from "@/lib/services/gemini"
import { storage } from "@/lib/storage"
import { NextResponse } from "next/server"


export async function GET(_req: Request, { params }: { params: { q: string } }) {
  try {
    if (!params.q) return NextResponse.json([])
    const products = await storage.getProducts()
    const suggestions = await generateSearchSuggestions(params.q, products)
    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json({ message: "Failed to generate search suggestions" }, { status: 500 })
  }
}
