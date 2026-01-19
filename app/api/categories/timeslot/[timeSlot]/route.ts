import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { TimeSlotType } from "@/shared/schema"

export async function GET(_req: Request, { params }: { params: { timeSlot: string } }) {
  try {
    const categories = await storage.getCategoriesByTimeSlot(params.timeSlot as TimeSlotType)
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ message: "Failed to fetch categories for time slot" }, { status: 500 })
  }
}
