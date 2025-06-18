/**
 * @file Centralized repository for marketing content like promotional messages.
 * This allows both frontend components and backend services to use the same copy,
 * ensuring consistency across the application.
 */

export const marketingMessages = [
    // --- General & Flash Sale ---
    "Flash Sale! Save big for a limited time.",
    "Your lucky day! A special discount, just for you.",
    "Don't miss out! Grab this offer before it's gone.",
    "Treat yourself! You've earned this discount.",
    "Exclusive Offer! Unlock amazing savings now.",
  
    // --- Style & Trend Focused ---
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
  
    // --- Local Flavor (Gikomba, Eastleigh) ---
    "Curated from Gikomba, styled for the gram. Now discounted!",
    "Why wait? Get that look you've been eyeing — for less!",
    "Eastleigh's gems meet Avenue's vibe. Shop it while it's hot!",
    "Thrift-core meets trend-core. Budget meets fire. 💥",
  
    // --- Aspirational & Fun ---
    "Fashion on a budget, but make it iconic.",
    "Style goals? Smashed. Thanks to this discount.",
    "You're not just shopping. You're smart-shopping.",
    "Look like a million bucks, spend like a local. 😉",
    "It's giving *affordable fashion queen/king* energy.",
    "Dress fresh, stress less - with a sweet discount.",
  
    // --- Sheng & Swahili ---
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
  
  /**
   * A simple utility function to get a random item from an array.
   * @param {T[]} array The array to pick from.
   * @returns {T} A random element from the array.
   */
  export function getRandomItem<T>(array: T[]): T {
      return array[Math.floor(Math.random() * array.length)];
  }