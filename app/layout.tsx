import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://avenuefashion.co.ke";

export const metadata: Metadata = {
  title: {
    template: "%s | Avenue Fashion",
    default: "Avenue Fashion - Affordable & Trendy Clothing in Kenya",
  },
  description:
    "Avenue Fashion is your go-to Kenyan online fashion store offering trendy, affordable clothes, shoes, and accessories. Shop for men, women, and kids. Pay easily with M-Pesa and enjoy fast nationwide delivery.",
  keywords:
    "Avenue Fashion, Kenya, online fashion store, clothes, shoes, accessories, affordable fashion, M-Pesa, Nairobi fashion, shop online Kenya",
  metadataBase: new URL(siteUrl),

  openGraph: {
    title: "Avenue Fashion - Affordable & Trendy Clothing in Kenya",
    description:
      "Browse the latest in apparel, shoes, and accessories. Convenient M-Pesa checkout and fast delivery.",
    url: siteUrl,
    siteName: "Avenue Fashion",
    images: [
      {
        url: `${siteUrl}/og-image-v2.png`,
        width: 1200,
        height: 630,
        alt: "Avenue Fashion - Kenya's Favourite Fashion Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Avenue Fashion - Affordable & Trendy Clothing in Kenya",
    description:
      "Shop stylish and affordable fashion for all Kenyans. From streetwear to formal fits, Avenue Fashion makes it easy with M-Pesa and fast delivery.",
    site: "@avenuefashionke",
    images: [`${siteUrl}/og-image-v2.png`],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Avenue" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </SessionProvider>
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
