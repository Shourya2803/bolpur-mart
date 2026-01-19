"use client";

import { Clock, Zap, Truck } from "lucide-react";
import { useTimeSlot } from "@/hooks/use-time-slot";

export function TimeBanner() {
  const {
    timeSlotDisplay,
    currentTimeSlot,
    formatRemainingTime,
    currentEmoji,
    currentBgColor,
  } = useTimeSlot();

  const getTimeSlotInfo = () => {
    switch (currentTimeSlot) {
      case "morning":
        return {
          label: "Good Morning!",
          time: "6:00 AM - 12:00 PM",
          description: "Start your day with fresh groceries and quick delivery",
        };
      case "afternoon":
        return {
          label: "Good Afternoon!",
          time: "12:00 PM - 5:00 PM",
          description: "Perfect time for lunch essentials and household needs",
        };
      case "evening":
        return {
          label: "Good Evening!",
          time: "5:00 PM - 10:00 PM",
          description: "Evening specials and dinner delights available",
        };
      case "night":
        return {
          label: "Night Service!",
          time: "10:00 PM - 6:00 AM",
          description: "24/7 essentials and late-night delivery available",
        };
      default:
        return {
          label: "Welcome!",
          time: "Always Open",
          description: "Quick commerce available 24/7",
        };
    }
  };

  const timeInfo = getTimeSlotInfo();

  return (
    <div
      className={`bg-gradient-to-r ${currentBgColor} text-white relative overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full -translate-x-12 sm:-translate-x-16 -translate-y-12 sm:-translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-x-8 sm:translate-x-12 translate-y-8 sm:translate-y-12"></div>
      </div>

      <div className="relative p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col mb-3 sm:mb-4">
              {/* Top Row - Label and Time */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1 mb-2">
                {/* Label */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="time-indicator w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/80 rounded-full animate-pulse"></div>
                  <span
                    className="font-bold text-lg sm:text-xl"
                    data-testid="time-slot-label"
                  >
                    {timeInfo.label}
                  </span>
                </div>

                {/* Time */}
                <div className="">
                  <span
                    className="text-xs sm:text-sm opacity-90 bg-white/20 px-2 sm:px-3 py-1 rounded-full font-medium"
                    data-testid="time-slot-hours"
                  >
                    {timeInfo.time}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p
                className="text-xs sm:text-sm opacity-90 leading-relaxed pr-2"
                data-testid="time-slot-description"
              >
                {timeInfo.description}
              </p>
            </div>

            {/* Delivery info */}
            <div className="flex flex-col gap-y-2">
              {/* Top Row - Express + Delivery Time */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs font-medium">Express</span>
                </div>

                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs">15-20 min delivery</span>
                </div>
              </div>

              {/* Bottom Row - Free Delivery */}
              <div className="flex items-center space-x-1 bg-white/30 text-white border-white/30 hover:bg-white/40 px-2 py-1 rounded-full w-fit">
                <span className="text-xs">Free delivery above ₹299</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-center ml-3 sm:ml-4 shrink-0">
            <div className="relative mb-1 sm:mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-pulse border-2 border-white flex items-center justify-center">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
            <span className="text-xs text-green-300 font-bold bg-white/20 px-2 py-0.5 sm:py-1 rounded-full">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
