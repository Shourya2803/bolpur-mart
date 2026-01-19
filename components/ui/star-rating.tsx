"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (
    rating: number,
    event: React.MouseEvent<SVGSVGElement>
  ) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  totalRatings?: number;
  disabled?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showCount = false,
  totalRatings = 0,
  disabled = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const isInteractive = !readonly && !disabled && onRatingChange;

  return (
    <div className="flex items-center space-x-1">
      <div
        className="flex items-center space-x-0.5"
        onClick={(e) => e.stopPropagation()} // Prevent parent click events
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverRating || rating) >= star;
          return (
            <Star
              key={star}
              className={cn(sizeClasses[size], "transition-all duration-150", {
                "fill-yellow-400 text-yellow-400": isFilled,
                "text-gray-300 hover:text-yellow-300":
                  !isFilled && isInteractive,
                "text-gray-200": !isFilled && !isInteractive,
                "cursor-pointer hover:scale-110": isInteractive,
                "cursor-default": !isInteractive,
                "opacity-50": disabled,
              })}
              onClick={(event: React.MouseEvent<SVGSVGElement>) => {
                event.preventDefault();
                event.stopPropagation();

                if (isInteractive) {
                  console.log(`Star ${star} clicked`); // Debug log
                  onRatingChange(star, event);
                }
              }}
              onMouseEnter={() => {
                if (isInteractive) {
                  setHoverRating(star);
                }
              }}
              onMouseLeave={() => {
                if (isInteractive) {
                  setHoverRating(0);
                }
              }}
            />
          );
        })}
      </div>
      {showCount && totalRatings > 0 && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          ({totalRatings})
        </span>
      )}
      {isInteractive && rating === 0 && (
        <span
          className={cn("text-muted-foreground ml-2", textSizeClasses[size])}
        >
          Tap to rate
        </span>
      )}
    </div>
  );
}
