"use client";

import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IVoucher } from "@/types";
import { marketingMessages } from "@/config/marketing";

// =================================================================
// PROPS & MARKETING MESSAGES
// =================================================================

interface DiscountBannerProps {
  voucher: IVoucher | null;
}

// =================================================================
// MAIN CLIENT COMPONENT
// =================================================================

/**
 * A dismissible, dynamic banner that displays a random promotional voucher.
 * It handles its own visibility
 */
export function DiscountBanner({ voucher }: DiscountBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // A 50/50 chance to show the banner. This runs only once on component mount.
  const showBannerRandomly = useMemo(() => Math.random() > 0.5, []);

  // Determine if the banner should be rendered based on multiple conditions.
  const shouldRender = voucher && isVisible && showBannerRandomly;

  // Select a random marketing message once, ensuring no repeats until all are seen.
  const message = useMemo(() => {
    if (typeof window === "undefined") return marketingMessages[0];
    const key = "avenue_seen_messages";
    const seen = JSON.parse(localStorage.getItem(key) || "[]");
    const unseen = marketingMessages.filter((msg) => !seen.includes(msg));
    const pool =
      unseen.length > 0
        ? unseen
        : (localStorage.setItem(key, "[]"), marketingMessages); // Reset if all seen
    const randomMessage = pool[Math.floor(Math.random() * pool.length)];
    localStorage.setItem(key, JSON.stringify([...seen, randomMessage]));
    return randomMessage;
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <Alert className="fixed top-0 left-0 right-0 z-[100] w-full border-b rounded-none flex items-start justify-between p-3 bg-background">
      <div className="flex items-start gap-4 flex-grow min-w-0">
        <PartyPopper className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div className="text-sm">
          <AlertTitle className="font-bold mb-1">{message}</AlertTitle>
          <AlertDescription className="block">
            Use code <strong className="text-foreground">{voucher.code}</strong>{" "}
            for{" "}
            <strong className="text-foreground">
              {voucher.discountValue}% off
            </strong>{" "}
            your next order!
          </AlertDescription>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
