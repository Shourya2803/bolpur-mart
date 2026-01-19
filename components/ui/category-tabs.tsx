"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ShoppingBag, Coffee, Utensils, Apple, Package, Pill, Zap, Heart, Store,X } from "lucide-react"
import { useTimeSlot } from "@/hooks/use-time-slot"
import { FirebaseProductService } from "@/lib/firebase-products"
import type { CategoryReference } from "@/types"
import { Button } from "./button"

interface CategoryTabsProps {
  selectedCategory?: string
  onCategorySelect: (categoryId: string) => void
}

const categoryIcons: Record<string, any> = {
  // Match category names from your Firebase data
  "Vegetables": Apple,
  "Medicine": Pill,  
  "Biryani": Utensils,
  "Household": Package,
  "Fruits": Apple,
  "Groceries": Package,
  "Snacks": Coffee,
  "Beverages": Coffee,
  "Dairy": Package,
  "Pharmacy": Pill,
  "Bakery": Coffee,
  "Meat": Package,
  "Seafood": Package,
  "Organic": Heart,
  "Instant": Zap,
  "Store": Store,
  default: ShoppingBag,
}

// Map category names to display colors
const getCategoryColor = (categoryName: string, isSelected: boolean, isAvailable: boolean) => {
  if (isSelected) return "bg-primary text-primary-foreground"
  if (!isAvailable) return "bg-muted text-muted-foreground"
  
  const colorMap: Record<string, string> = {
    "Vegetables": "bg-green-100 text-green-700",
    "Fruits": "bg-red-100 text-red-700",
    "Medicine": "bg-purple-100 text-purple-700",
    "Biryani": "bg-orange-100 text-orange-700",
    "Household": "bg-blue-100 text-blue-700",
    "Snacks": "bg-yellow-100 text-yellow-700",
    "Beverages": "bg-cyan-100 text-cyan-700",
    default: "bg-primary/10 text-primary"
  }
  
  return colorMap[categoryName] || colorMap.default
}

export function CategoryTabs({ selectedCategory, onCategorySelect }: CategoryTabsProps) {
  const { currentTimeSlot } = useTimeSlot()

  // Fetch available categories for current time slot
  const { data: availableCategories = [], isLoading } = useQuery<CategoryReference[]>({
    queryKey: ["availableCategories", currentTimeSlot],
    queryFn: () => FirebaseProductService.getAvailableCategories(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  console.log("📂 Available categories:", availableCategories)

  if (isLoading) {
    return (
      <div className="px-4 mb-6" data-testid="category-tabs-loading">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (availableCategories.length === 0) {
    return (
      <div className="px-4 mb-6" data-testid="category-tabs-empty">
        <div className="text-center py-8">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No categories available for this time slot</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 mb-6" data-testid="category-tabs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Shop by Category</h2>
        <Badge className="text-xs">
          {availableCategories.length} available
        </Badge>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {availableCategories.map((category) => {
          const isSelected = selectedCategory === category.id
          const IconComponent = categoryIcons[category.name] || categoryIcons.default
          
          // Create slug for data-testid
          const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-')

          return (
            <Card
              key={category.id}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105
                ${isSelected ? "ring-2 ring-primary bg-primary/5 shadow-md" : "hover:bg-muted/50"}
              `}
              onClick={() => onCategorySelect(category.id)}
              data-testid={`category-card-${categorySlug}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-2">
                  {/* Icon */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                      ${getCategoryColor(category.name, isSelected, true)}
                    `}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>

                  {/* Category Info */}
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm leading-tight">{category.name}</h3>
                    
                    {/* Availability Status */}
                    <div className="flex items-center justify-center">
                      <Clock className="w-3 h-3 mr-1 text-green-600" />
                      <span className="text-xs font-medium text-green-600">
                        Available Now
                      </span>
                    </div>
                  </div>

                  {/* Delivery Badge */}
                  <Badge  className="text-xs px-2 py-0 bg-green-100 text-green-700">
                    15-20 min
                  </Badge>

                  {/* Active indicator */}
                  {isSelected && (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse mr-1"></div>
                      <span className="text-xs text-primary font-medium">Selected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Show selected category info */}
      {selectedCategory && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2">
            <Badge  className="bg-primary">
              Selected
            </Badge>
            <span className="text-sm font-medium">
              {availableCategories.find(cat => cat.id === selectedCategory)?.name}
            </span>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => onCategorySelect("")}
              className="ml-auto h-6 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
