import { AuthTabs } from "@/components/auth-tabs"
import { LottiePlayer } from "@/components/lottie-player"
import deliveryAnimation from "@/data/delivery-animation.json"

export default function LoginPage() {
  return (
    <div className="mobile-container">
      {/* Header with Logo and Animation */}
      <div className="flex flex-col items-center pt-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-foreground">Bolpur Mart</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            World-class quick commerce app for groceries, vegetables, fruits, medicine, and food delivery in Bolpur
          </p>
        </div>

        {/* Lottie Animation */}
        <div className="w-32 h-32 ">
          <LottiePlayer
            animationData={deliveryAnimation}
            className="w-full h-full"
            autoplay={true}
            loop={true}
            speed={1}
          />
        </div>
      </div>

      {/* Auth Tabs */}
      <div className="flex-1 px-6 pb-8">
        <AuthTabs />
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
