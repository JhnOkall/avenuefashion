"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Copy, PartyPopper } from "lucide-react";
import { IVoucher } from "@/types";

// =================================================================
// PROPS & MARKETING MESSAGES
// =================================================================

interface DiscountBannerProps {
  voucher: IVoucher | null;
}

// A pool of dynamic marketing messages.
const marketingMessages = [
  "Flash Sale! Save big for a limited time.",
  "Your lucky day! A special discount, just for you.",
  "Don't miss out! Grab this offer before it's gone.",
  "Treat yourself! You've earned this discount.",
  "Exclusive Offer! Unlock amazing savings now.",
];

// =================================================================
// MAIN CLIENT COMPONENT
// =================================================================

/**
 * A dismissible, dynamic banner that displays a random promotional voucher.
 * It handles its own visibility, copy-to-clipboard functionality, and path exclusion.
 */
export function DiscountBanner({ voucher }: DiscountBannerProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);

  // An array of paths where the banner should NOT be displayed.
  const excludedPaths = [
    "/dashboard",
    "/products",
    "/orders",
    "/users",
    "/locations",
  ];

  // A 50/50 chance to show the banner. This runs only once on component mount.
  const showBannerRandomly = useMemo(() => Math.random() > 0.5, []);

  // Determine if the banner should be rendered based on multiple conditions.
  const shouldRender =
    voucher &&
    isVisible &&
    showBannerRandomly &&
    !excludedPaths.some((path) => pathname.startsWith(path));

  // Select a random marketing message once.
  const message = useMemo(
    () =>
      marketingMessages[Math.floor(Math.random() * marketingMessages.length)],
    []
  );

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  if (!shouldRender) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    setHasCopied(true);
  };

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 w-full border-b rounded-none flex items-center justify-between p-3 bg-background">
      <div className="flex items-center gap-4">
        <PartyPopper className="h-6 w-6 text-primary shrink-0" />
        <div className="text-sm">
          <AlertTitle className="font-bold">{message}</AlertTitle>
          <AlertDescription>
            Use code <strong className="text-foreground">{voucher.code}</strong>{" "}
            for{" "}
            <strong className="text-foreground">
              {voucher.discountValue}% off
            </strong>{" "}
            your next order!
          </AlertDescription>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="w-[90px]"
        >
          <Copy
            className={`h-4 w-4 mr-2 transition-transform ${
              hasCopied ? "scale-0" : "scale-100"
            }`}
          />
          <span
            className={`transition-transform duration-300 ${
              hasCopied ? "translate-x-0" : "translate-x-3"
            }`}
          >
            {hasCopied ? "Copied!" : "Copy"}
          </span>
        </Button>
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
