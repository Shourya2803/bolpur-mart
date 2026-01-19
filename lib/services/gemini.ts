import { GoogleGenAI } from "@google/genai"
import type { Product } from "@/shared/schema"

const hasGeminiKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)
const ai = hasGeminiKey ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }) : null

export interface ProductRecommendation {
  productId: string
  score: number
  reason: string
}

export interface RecommendationRequest {
  userId: string
  currentTimeSlot: string
  purchaseHistory: any[]
  availableProducts: Product[]
  userPreferences?: any
}

function localProductRecommendations(request: RecommendationRequest): ProductRecommendation[] {
  const timeSlot = (request.currentTimeSlot || "evening").toLowerCase()
  const purchasedIds = new Set<string>()
  try {
    request.purchaseHistory.flat().forEach((item: any) => {
      if (item?.productId) purchasedIds.add(String(item.productId))
    })
  } catch {
    // ignore parsing errors; fallback still works
  }

  const tagForSlot: Record<string, string[]> = {
    morning: ["vegetable", "vegetables", "fruit", "fruits", "fresh", "healthy"],
    afternoon: ["grocery", "groceries", "medicine", "snack", "snacks"],
    evening: ["biryani", "snack", "snacks", "dinner", "evening"],
  }

  const slotTags = tagForSlot[timeSlot] || []

  const scored = request.availableProducts
    .filter((p) => p.isActive !== false)
    .map((p) => {
      const rating = Number.parseFloat(String(p.rating ?? "0")) || 0
      const ratingScore = Math.min(Math.max(rating / 5, 0), 1) // normalize 0..1
      const name = (p.name || "").toLowerCase()
      const tags = (p.tags as string[] | undefined)?.map((t) => t.toLowerCase()) || []
      const slotBoost = tags.some((t) => slotTags.includes(t)) || slotTags.some((t) => name.includes(t)) ? 0.2 : 0
      const repeatBoost = purchasedIds.has(p.id!) ? 0.3 : 0
      const base = ratingScore + slotBoost + repeatBoost
      const score = Math.max(0, Math.min(1, base))

      return {
        productId: p.id!,
        score,
        reason: `${repeatBoost > 0 ? "Previously purchased. " : ""}${slotBoost > 0 ? `Good for ${timeSlot}. ` : ""}${ratingScore > 0.6 ? "Highly rated. " : ""}`,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return scored
}

export async function generateProductRecommendations(
  request: RecommendationRequest
): Promise<ProductRecommendation[]> {
  if (!ai) {
    return localProductRecommendations(request)
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" })

    const availableProductsText = request.availableProducts
      .map(
        (p) =>
          `ID: ${p.id}, Name: ${p.name}, Category: ${p.categoryId}, Price: ${p.price}, Rating: ${p.rating}, Tags: ${JSON.stringify(
            p.tags
          )}`
      )
      .join("\n")

    const purchaseHistoryText =
      request.purchaseHistory.length > 0
        ? request.purchaseHistory
            .map((order) => `Order: ${JSON.stringify(order)}`)
            .join("\n")
        : "No purchase history"

    const prompt = `You are a product recommendation system for an e-commerce app. 
    The current time slot is: ${request.currentTimeSlot}.
    
    User ID: ${request.userId}
    User Preferences: ${JSON.stringify(request.userPreferences || {})}
    
    Purchase History:
    ${purchaseHistoryText}
    
    Available Products:
    ${availableProductsText}
    
    Based on this information, recommend up to 5 products that this user might want to purchase now.
    For each recommendation, provide the product ID, a score between 0 and 1 indicating confidence, and a brief reason.
    
    Format your response as a valid JSON array of objects with productId, score, and reason fields. Example:
    [
      {"productId": "123", "score": 0.95, "reason": "User frequently purchases this item in the evening"},
      {"productId": "456", "score": 0.82, "reason": "Highly rated item that matches user's preference for healthy foods"}
    ]
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]) as ProductRecommendation[]
        return recommendations.slice(0, 10)
      }
    } catch (error) {
      console.error("Error parsing AI recommendations:", error)
    }

    // Fallback to local recommendations
    return localProductRecommendations(request)
  } catch (error) {
    console.error("Error generating AI recommendations:", error)
    return localProductRecommendations(request)
  }
}

export async function generateSearchSuggestions(query: string, products: Product[]): Promise<string[]> {
  if (!ai || !query || query.length < 3) {
    // Simple local fallback
    return products
      .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((p) => p.name!)
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" })

    const productsText = products
      .slice(0, 50) // Limit to 50 products to avoid token limits
      .map((p) => `${p.name} (${p.categoryId})`)
      .join(", ")

    const prompt = `You are a search suggestion system for an e-commerce app.
    User search query: "${query}"
    
    Available products: ${productsText}
    
    Based on this partial search query, suggest 5 possible search terms the user might be looking for.
    Only include search terms that would match products in our catalog.
    Format your response as a JSON array of strings. Example: ["rice", "rice basmati", "rice cooker"]
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[\s*".*"\s*\]/s)
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]) as string[]
        return suggestions.slice(0, 5)
      }
    } catch (error) {
      console.error("Error parsing AI search suggestions:", error)
    }

    // Fallback
    return products
      .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((p) => p.name!)
  } catch (error) {
    console.error("Error generating AI search suggestions:", error)
    return products
      .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map((p) => p.name!)
  }
}