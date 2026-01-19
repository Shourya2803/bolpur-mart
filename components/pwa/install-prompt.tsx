"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setInstallPrompt(null)
      setIsInstallable(false)
      console.log('PWA was installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) {
      // Fallback for browsers that don't support the install prompt
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        alert('To install this app on iOS: tap the Share button and then "Add to Home Screen"')
      } else if (navigator.userAgent.includes('Android')) {
        alert('To install this app: tap the menu button in your browser and select "Add to Home Screen" or "Install App"')
      } else {
        alert('To install this app: look for "Install" or "Add to Home Screen" option in your browser menu')
      }
      return
    }

    // Show the install prompt
    await installPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    // Clear the prompt
    setInstallPrompt(null)
    setIsInstallable(false)
  }

  return {
    installApp,
    isInstallable,
    canInstall: isInstallable || installPrompt !== null
  }
}

export function InstallPrompt() {
  return null // This is just a hook provider
}