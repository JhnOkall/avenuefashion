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

/**
 * Defines the default metadata for the application. This is crucial for
 * Search Engine Optimization (SEO) and for how the site appears in browser
 * tabs and when shared on social media. Individual pages can override or
 * extend this metadata.
 */
export const metadata: Metadata = {
  title: "Avenue Fashion | Kenya's Premier Online Fashion Store",
  description:
    "Discover the latest trends in fashion at Avenue Fashion. Shop quality clothes, shoes, jewelry, and accessories for men, women, and kids. Enjoy seamless shopping, secure M-Pesa payments, and fast delivery across Kenya.",
  keywords:
    "Avenue Fashion, Kenya, online fashion, clothes, shoes, jewelry, accessories, M-Pesa payments, fashion store, men's fashion, women's fashion, kid's fashion, shop online Kenya",
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
