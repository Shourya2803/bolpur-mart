import { type NextRequest, NextResponse } from "next/server"

import type { TimeSlotType } from "@/shared/schema"
import { storage } from "@/lib/storage"
import { generateProductRecommendations } from "@/lib/services/gemini"

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const timeSlot = (req.nextUrl.searchParams.get("timeSlot") as TimeSlotType) || ("evening" as TimeSlotType)

    const orders = await storage.getOrders(params.userId)
    const purchaseHistory = orders.map((o) => o.items)

    const availableProducts = timeSlot ? await storage.getProductsByTimeSlot(timeSlot) : await storage.getProducts()

    const recommendations = await generateProductRecommendations({
      userId: params.userId,
      currentTimeSlot: timeSlot,
      purchaseHistory,
      availableProducts,
      userPreferences: {},
    })

    // store generated recommendations
    for (const rec of recommendations) {
      await storage.saveRecommendation({
        userId: params.userId,
        productId: rec.productId,
        score: rec.score.toString(),
        reason: rec.reason,
      })
    }

    return NextResponse.json(recommendations)
  } catch {
    return NextResponse.json({ message: "Failed to generate recommendations" }, { status: 500 })
  }
}
