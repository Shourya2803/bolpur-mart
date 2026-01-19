import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { generateProductRecommendations } from "@/lib/services/gemini";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const timeSlot = searchParams.get("timeSlot");
    
    if (!userId || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required parameters: userId and timeSlot" },
        { status: 400 }
      );
    }

    // Get user's purchase history
    const purchaseHistory = await storage.getUserPurchaseHistory(userId);
    
    // Get all products for recommendation processing
    const allProducts = await storage.getProducts();
    
    // Generate recommendations using the Gemini service
    const recommendations = await generateProductRecommendations({
      userId,
      timeSlot,
      purchaseHistory,
      allProducts
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error in recommendations API:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}