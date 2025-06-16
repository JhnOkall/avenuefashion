"use client";

import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  "Trending now - fashion steals that feel like a dream.",
  "Kenya's hottest styles, now at an even hotter price!",
  "Looking good doesn't have to break the bank!",
  "This is your sign to shop something new. 🛍️",
  "Avenue Picks: Handpicked fashion at unbeatable deals.",
  "Today's fit? Sponsored by good taste and better discounts.",
  "Drip alert! Turn heads without draining your wallet.",
  "Local fashion, global vibes - for less.",
  "A deal this good? It's basically stealing (legally).",
  "Shhh… secret style sale happening now!",
  "Your cart called. It's ready for a glow-up.",
  "Curated from Gikomba, styled for the gram. Now discounted!",
  "Why wait? Get that look you've been eyeing — for less!",
  "Eastleigh's gems meet Avenue's vibe. Shop it while it's hot!",
  "Thrift-core meets trend-core. Budget meets fire. 💥",
  "Fashion on a budget, but make it iconic.",
  "Style goals? Smashed. Thanks to this discount.",
  "You're not just shopping. You're smart-shopping.",
  "Look like a million bucks, spend like a local. 😉",
  "It's giving *affordable fashion queen/king* energy.",
  "Dress fresh, stress less - with a sweet discount.",
  "Look ni fire 🔥, bei ni ya kawaida.",
  "Sasa uko sorted - discount inakujia kama blessing.",
  "Twende kazi! Time ya ku-upgrade wardrobe bila stress.",
  "Niaje? Umeangukiwa na offer ya power!",
  "Soko iko juu, bei iko chini. Vaa poa bila kuvunja bank.",
  "Style ni lazima - sasa na discount ya mtaa.",
  "Hii drip ni legit, na sasa iko na offer. Fanya ile kitu!",
  "Piga luku bila pressure. Avenue fashion iko na wewe.",
  "Ukiwa na style kama hii, life inakuwa soft. 😎",
  "Mambo ni fiti - discounts ziko kwa wingi leo!",
  "Hauna reason ya kubaki plain. Vaa design, na offer juu yake!",
];

// =================================================================
// MAIN CLIENT COMPONENT
// =================================================================

/**
 * A dismissible, dynamic banner that displays a random promotional voucher.
 * It handles its own visibility and path exclusion.
 */
export function DiscountBanner({ voucher }: DiscountBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // A 50/50 chance to show the banner. This runs only once on component mount.
  const showBannerRandomly = useMemo(() => Math.random() > 0.5, []);

  // Determine if the banner should be rendered based on multiple conditions.
  const shouldRender = voucher && isVisible && showBannerRandomly;

  // Select a random marketing message once.
  const message = useMemo(() => {
    if (typeof window === "undefined") return marketingMessages[0];

    const key = "avenue_seen_messages";
    const seen = JSON.parse(localStorage.getItem(key) || "[]");

    // Filter out seen messages
    const unseen = marketingMessages.filter((msg) => !seen.includes(msg));

    // Reset if all seen
    const pool = unseen.length > 0 ? unseen : marketingMessages;

    // Pick random
    const randomMessage = pool[Math.floor(Math.random() * pool.length)];

    // Save back to localStorage
    const updatedSeen = seen.includes(randomMessage)
      ? seen
      : [...seen, randomMessage];
    localStorage.setItem(key, JSON.stringify(updatedSeen));

    return randomMessage;
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <Alert className="fixed top-0 left-0 right-0 z-100 w-full border-b rounded-none flex items-start justify-between p-3 bg-background">
      <div className="flex items-start gap-4">
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
      <div className="flex items-center gap-2">
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
