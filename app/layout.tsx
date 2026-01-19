import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
// import "./index.css"
import Providers from "./providers"
import { RegisterSW } from "@/components/pwa/register-sw"
import { Suspense } from "react"
import { AuthInitializer } from "@/components/auth/auth-initializer"

export const metadata: Metadata = {
  title: "Bolpur Mart - Quick Commerce",
  description:
    "World-class quick commerce app for groceries, vegetables, fruits, medicine, and food delivery in Bolpur",
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#0D7377",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Use className instead of inline styles to avoid hydration mismatch */}
        <style dangerouslySetInnerHTML={{
          __html: `
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        ` }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0D7377" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bolpur Mart" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Providers>
          <AuthInitializer />
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        <RegisterSW />
      </body>
    </html>
  )
}
