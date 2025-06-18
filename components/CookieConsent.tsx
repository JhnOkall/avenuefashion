"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cookie,
  Settings,
  Check,
  Shield,
  BarChart3,
  Target,
  LucideIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// =================================================================
// TYPES & DEFAULTS
// =================================================================

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  personalization: false,
};

// =================================================================
// SUB-COMPONENTS
// =================================================================

interface PreferenceItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Renders a single cookie preference item with a title, description, and toggle switch.
 */
const PreferenceItem = ({
  icon: Icon,
  title,
  description,
  ...switchProps
}: PreferenceItemProps) => (
  <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-4">
      <Icon className="mt-1 h-6 w-6 shrink-0 text-muted-foreground" />
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="flex items-center justify-end gap-2 sm:justify-start">
      {switchProps.disabled && (
        <span className="text-xs font-medium text-primary">Always Active</span>
      )}
      <Switch
        checked={switchProps.checked}
        onCheckedChange={switchProps.onCheckedChange}
        disabled={switchProps.disabled}
        aria-label={`Toggle ${title}`}
      />
    </div>
  </div>
);

// =================================================================
// MAIN COMPONENT
// =================================================================

/**
 * A client component that displays a cookie consent banner and allows users to manage
 * their cookie preferences in a dialog modal. It persists choices to localStorage.
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("avenue-fashion-cookie-consent");
    const savedPreferences = localStorage.getItem(
      "avenue-fashion-cookie-preferences"
    );

    if (!consent) {
      // Show banner after a delay to avoid being intrusive
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else if (savedPreferences) {
      const parsedPrefs = JSON.parse(savedPreferences);
      setPreferences(parsedPrefs);
      // Silently apply preferences on subsequent visits
      applyPreferences(parsedPrefs);
    }
  }, []);

  const applyPreferences = (prefs: CookiePreferences) => {
    // This is where you would integrate with your analytics, marketing, etc.
    // Example for Google Tag Manager:
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: prefs.analytics ? "granted" : "denied",
        ad_storage: prefs.marketing ? "granted" : "denied",
        ad_user_data: prefs.marketing ? "granted" : "denied",
        ad_personalization: prefs.marketing ? "granted" : "denied",
      });
    }

    // Example for a simple class-based feature toggle
    if (prefs.personalization) {
      document.documentElement.classList.add("personalization-enabled");
    } else {
      document.documentElement.classList.remove("personalization-enabled");
    }
  };

  const handleAction = async (
    consentType: "accepted" | "necessary-only" | "custom",
    newPreferences: CookiePreferences
  ) => {
    setIsLoading(true);

    setPreferences(newPreferences);
    applyPreferences(newPreferences);

    localStorage.setItem("avenue-fashion-cookie-consent", consentType);
    localStorage.setItem(
      "avenue-fashion-cookie-preferences",
      JSON.stringify(newPreferences)
    );

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsLoading(false);
    setShowPreferences(false);
    setShowBanner(false);
  };

  const handleAcceptAll = () =>
    handleAction("accepted", {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    });

  const handleAcceptNecessary = () =>
    handleAction("necessary-only", defaultPreferences);

  const handleSavePreferences = () => handleAction("custom", preferences);

  const handlePreferenceChange = (
    key: keyof Omit<CookiePreferences, "necessary">,
    value: boolean
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const preferenceOptions: Omit<PreferenceItemProps, "checked">[] = [
    {
      icon: Shield,
      title: "Necessary Cookies",
      description:
        "Essential for the website to function. They enable security, network management, and accessibility.",
      disabled: true,
    },
    {
      icon: BarChart3,
      title: "Analytics Cookies",
      description:
        "Help us understand how you interact with our website by collecting and reporting information anonymously.",
      onCheckedChange: (checked) =>
        handlePreferenceChange("analytics", checked),
    },
    {
      icon: Target,
      title: "Marketing Cookies",
      description:
        "Used to track visitors across websites to display relevant and engaging advertisements.",
      onCheckedChange: (checked) =>
        handlePreferenceChange("marketing", checked),
    },
    {
      icon: Cookie,
      title: "Personalization Cookies",
      description:
        "Enable us to remember your preferences and provide personalized content to enhance your experience.",
      onCheckedChange: (checked) =>
        handlePreferenceChange("personalization", checked),
    },
  ];

  if (!showBanner) return null;

  return (
    <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-md">
        <div className="container mx-auto flex flex-col items-center gap-4 p-4 md:flex-row">
          <div className="flex flex-1 items-start gap-4">
            <Cookie className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience, serve personalized
                content, and analyze traffic. By clicking "Accept All", you
                consent to our use of cookies.{" "}
                <Link
                  href="/privacy-policy"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Learn more.
                </Link>
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-center gap-2 md:w-auto md:flex-nowrap">
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full sm:w-auto">
                Customize
              </Button>
            </DialogTrigger>
            <Button
              variant="outline"
              onClick={handleAcceptNecessary}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Necessary Only
            </Button>
            <Button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie settings below. You can change your preferences
            at any time. For more details, please read our{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 py-4">
          {preferenceOptions.map((opt) => (
            <PreferenceItem
              key={opt.title}
              {...opt}
              checked={
                preferences[
                  opt.title
                    .split(" ")[0]
                    .toLowerCase() as keyof CookiePreferences
                ]
              }
            />
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
