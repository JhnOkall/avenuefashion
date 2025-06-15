import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Script from "next/script";

/**
 * Initializes the Geist Sans font for the application.
 * It is loaded with the 'latin' subset and assigned to a CSS variable
 * `--font-geist-sans` for global use in the CSS files.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Initializes the Geist Mono font, typically for code blocks or monospaced text.
 * It is assigned to the CSS variable `--font-geist-mono`.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://new.avenuefashion.co.ke";

/**
 * Defines the default and Open Graph metadata for the application.
 * This metadata is used for SEO and social sharing, and is applied to all pages.
 * It can be overridden or extended by individual page metadata.
 */
export const metadata: Metadata = {
  // Use a template for dynamic page titles
  title: {
    template: "%s | Avenue Fashion",
    default: "Avenue Fashion - Kenya's Premier Online Fashion Store",
  },
  description:
    "Discover the latest trends in fashion at Avenue Fashion. Shop quality clothes, shoes, jewelry, and accessories for men, women, and kids. Enjoy seamless shopping, secure M-Pesa payments, and fast delivery across Kenya.",
  keywords:
    "Avenue Fashion, Kenya, online fashion, clothes, shoes, jewelry, accessories, M-Pesa payments, fashion store, men's fashion, women's fashion, kid's fashion, shop online Kenya",
  metadataBase: new URL(siteUrl),

  // --- Comprehensive Open Graph & Twitter Card Metadata ---
  openGraph: {
    title: "Avenue Fashion - Kenya's Premier Online Fashion Store",
    description:
      "Discover the latest trends in fashion at Avenue Fashion. Shop quality clothes, shoes, jewelry, and accessories for men, women, and kids. Enjoy seamless shopping, secure M-Pesa payments, and fast delivery across Kenya.",
    url: siteUrl,
    siteName: "Avenue Fashion",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Avenue Fashion Kenya's Premier Online Fashion Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Avenue Fashion - Kenya's Premier Online Fashion Store",
    description:
      "Discover the latest trends in fashion at Avenue Fashion. Shop quality clothes, shoes, jewelry, and accessories for men, women, and kids. Enjoy seamless shopping, secure M-Pesa payments, and fast delivery across Kenya.",
    site: "@avenuefashionke",
    images: [`${siteUrl}/og-image.png`],
  },

  // --- Favicons and App Icons ---
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },

  // --- Other Important Metadata ---
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

/**
 * The root layout component that wraps every page in the application.
 * It sets up the basic HTML document structure, applies global fonts,
 * and provides essential, application-wide context providers.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components, typically the page content, to be rendered within the layout.
 * @returns {JSX.Element} The root HTML structure of the application.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * Fetches the user's session on the server.
   */
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/*
         * The `SessionProvider` is essential for making the server-fetched session data
         * available to client components via the `useSession` hook.
         * This is the recommended pattern for the Next.js App Router.
         */}
        <SessionProvider session={session}>
          {/*
           * Wraps the application with the `CartProvider`, making shopping cart
           * state and actions available globally via the `useCart` hook.
           */}
          <CartProvider>
            {/* Renders the active page component passed as children. */}
            {children}
            {/*
             * Renders the `Toaster` component at the root level, allowing any
             * component to trigger toast notifications.
             */}
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
