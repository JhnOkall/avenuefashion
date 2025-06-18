"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// =================================================================
// TYPES
// =================================================================

/**
 * Extends the base Event interface to include properties specific to the
 * 'beforeinstallprompt' event for PWA installation.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// =================================================================
// MAIN COMPONENT
// =================================================================

/**
 * A client component that provides a user-friendly prompt to install the
 * website as a Progressive Web App (PWA). It handles different UIs for
 * iOS and other supported platforms.
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (already installed).
    const checkIfStandalone = () => {
      const isStandaloneMode = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      // Also check for the proprietary Apple-specific property.
      const isWebAppCapable = (window.navigator as any).standalone === true;
      if (isStandaloneMode || isWebAppCapable) {
        setIsStandalone(true);
      }
    };

    // Detect if the user is on an iOS device.
    const checkIfIOS = () => {
      // A simple regex to check the user agent for iPhone, iPad, or iPod.
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(isIOSDevice);
    };

    checkIfStandalone();
    checkIfIOS();

    // Event listener for the 'beforeinstallprompt' event.
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // Prevent the default browser prompt.
      setDeferredPrompt(e);

      // Show the custom prompt after a delay to improve user experience,
      // but only if it's not installed and hasn't been dismissed before.
      if (!isStandalone && !localStorage.getItem("pwa-install-dismissed")) {
        setTimeout(() => setShowPrompt(true), 10000);
      }
    };

    // Event listener for when the app is successfully installed.
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Persist the choice so we don't ask again.
      localStorage.setItem("pwa-install-dismissed", "true");
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      localStorage.setItem(
        `pwa-install-${outcome}`, // 'accepted' or 'dismissed'
        "true"
      );
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error during PWA installation prompt:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Do not render anything if the app is already in standalone mode.
  if (isStandalone) {
    return null;
  }

  // Render specific instructions for iOS users, as they have a manual process.
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                Install Avenue Fashion
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Add to your home screen for a better shopping experience. Just
                tap the share icon and then 'Add to Home Screen'.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-m-2 h-8 w-8 shrink-0"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render the standard install prompt for other supported browsers.
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
        <Card className="border-none bg-gradient-to-r from-primary to-purple-600 p-4 text-primary-foreground">
          <div className="flex items-start gap-4">
            <Monitor className="h-8 w-8 shrink-0" />
            <div className="flex-1">
              <h3 className="mb-1 text-sm font-semibold">
                Get the Avenue Fashion App
              </h3>
              <p className="mb-3 text-xs text-primary-foreground/80">
                Install for a faster, richer experience with offline access.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleInstallClick}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-white/20 hover:text-primary-foreground"
                  onClick={handleDismiss}
                >
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

// =================================================================
// HOOK
// =================================================================

/**
 * A custom hook to manage PWA installation state and actions.
 *
 * @returns An object with installation status and an install trigger function.
 * @example
 * const { isInstalled, isInstallable, install } = usePWA();
 * if (isInstallable) {
 *   return <button onClick={install}>Install App</button>;
 * }
 */
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    setIsInstalled(isStandalone);

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        return true;
      }
      return false;
    } catch (error) {
      console.error("PWA installation failed:", error);
      return false;
    }
  };

  return { isInstalled, isInstallable, install };
}
