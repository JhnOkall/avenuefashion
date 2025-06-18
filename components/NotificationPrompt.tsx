"use client";

import React, { useState, useEffect } from "react";
import { BellRing, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { subscribeUserToPush } from "@/lib/notification";

/**
 * A client component that prompts users to enable push notifications.
 * It only appears if notifications are supported, not yet granted or denied,
 * and haven't been dismissed by the user previously.
 */
export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Check if notifications are supported and a service worker is available.
    const isSupported =
      "Notification" in window && "serviceWorker" in navigator;

    if (!isSupported) {
      return;
    }

    setPermissionStatus(Notification.permission);
    const hasDismissed = localStorage.getItem("notification-prompt-dismissed");

    // Only show prompt if permission is in the default state and not dismissed.
    if (Notification.permission === "default" && !hasDismissed) {
      // Delay the prompt to avoid being intrusive on page load.
      const timer = setTimeout(() => setShowPrompt(true), 15000); // 15 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        await subscribeUserToPush();
        toast.success("Notifications Enabled!", {
          description: "You'll now receive updates from Avenue Fashion.",
        });
        setShowPrompt(false);
      } else {
        toast.info("Notifications Denied", {
          description: "You can enable them in your browser settings later.",
        });
        handleDismiss(); // Also dismiss if they deny
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      toast.error("Subscription Failed", {
        description: "Could not enable notifications. Please try again.",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("notification-prompt-dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || permissionStatus !== "default") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 mx-auto max-w-sm">
      <Card className="p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BellRing className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              Stay in the Know
            </h3>
            <p className="text-xs text-muted-foreground">
              Enable notifications to get updates on new arrivals and exclusive
              offers.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Enable
              </Button>
              <Button size="sm" variant="outline" onClick={handleDismiss}>
                Not Now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-m-2 h-8 w-8 shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss notification prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
