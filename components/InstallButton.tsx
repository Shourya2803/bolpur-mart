"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>
}

export function InstallButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
            console.log('App installed')
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
            setDeferredPrompt(null)
        }
    }

    if (isInstalled || !deferredPrompt) return null

    return (
        <Button
            onClick={handleInstallClick}
            variant="outline"
            size="sm"
            className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
        >
            <img src="/icons/bolpur-mart-192.png" alt="Icon" className="w-5 h-5 rounded-sm" />
            Install App
        </Button>
    )
}
