"use client"

import { useEffect, useRef } from "react"

interface LottiePlayerProps {
  animationData?: any
  src?: string
  className?: string
  autoplay?: boolean
  loop?: boolean
  speed?: number
}

export function LottiePlayer({
  animationData,
  src,
  className = "",
  autoplay = true,
  loop = true,
  speed = 1,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationInstance: any = null

    const loadLottie = async () => {
      try {
        const lottie = (await import("lottie-web")).default

        if (containerRef.current) {
          const config: any = {
            container: containerRef.current,
            renderer: "svg",
            loop,
            autoplay,
          }

          if (animationData) {
            config.animationData = animationData
          } else if (src) {
            config.path = src
          } else {
            console.error("LottiePlayer: Either animationData or src must be provided")
            return
          }

          if (containerRef.current && !containerRef.current.hasChildNodes()) {
            animationInstance = lottie.loadAnimation(config)

            if (speed !== 1 && animationInstance) {
              animationInstance.setSpeed(speed)
            }

            animationInstance?.addEventListener("error", (error: any) => {
              console.error("Lottie animation error:", error)
            })
          }
        }
      } catch (error) {
        console.error("Failed to load Lottie animation:", error)
      }
    }

    loadLottie()

    return () => {
      if (animationInstance) {
        try {
          animationInstance.destroy()
        } catch (error) {
          console.error("Error destroying Lottie animation:", error)
        }
      }
    }
  }, [animationData, src, autoplay, loop, speed])

  return <div ref={containerRef} className={className} />
}
