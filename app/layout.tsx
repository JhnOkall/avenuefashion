import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { CookieConsent } from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://avenuefashion.co.ke";
const isProduction = process.env.NODE_ENV === "production";

// Enhanced metadata with structured data and local SEO
export const metadata: Metadata = {
  title: {
    template: "%s | Avenue Fashion",
    default: "Avenue Fashion - Affordable & Trendy Clothing in Kenya",
  },
  description:
    "Avenue Fashion is Kenya's premier online fashion destination offering trendy, affordable clothes, shoes, and accessories for men, women, and kids. Shop with confidence using M-Pesa payments and enjoy fast nationwide delivery across Nairobi, Mombasa, Kisumu, and all major cities.",
  keywords: [
    "Avenue Fashion",
    "Kenya online shopping",
    "fashion store Kenya",
    "clothes Kenya",
    "shoes Kenya",
    "accessories Kenya",
    "affordable fashion",
    "M-Pesa shopping",
    "Nairobi fashion",
    "Mombasa fashion",
    "Kisumu fashion",
    "trendy clothing",
    "fast delivery Kenya",
    "online boutique Kenya",
    "streetwear Kenya",
    "formal wear Kenya",
    "casual wear Kenya",
    "fashion accessories",
    "men's fashion Kenya",
    "women's fashion Kenya",
    "kids fashion Kenya",
  ].join(", "),
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    title: "Avenue Fashion - Kenya's Premier Online Fashion Store",
    description:
      "Discover the latest trends in fashion! Shop affordable, stylish clothing, shoes & accessories with M-Pesa checkout and fast delivery across Kenya.",
    url: siteUrl,
    siteName: "Avenue Fashion",
    images: [
      {
        url: `${siteUrl}/og-image-v2.png`,
        width: 1200,
        height: 630,
        alt: "Avenue Fashion - Kenya's Favourite Fashion Store",
        type: "image/png",
      },
      {
        url: `${siteUrl}/og-image-square.png`,
        width: 1080,
        height: 1080,
        alt: "Avenue Fashion Square Logo",
        type: "image/png",
      },
    ],
    locale: "en_KE",
    type: "website",
    countryName: "Kenya",
  },

  twitter: {
    card: "summary_large_image",
    title: "Avenue Fashion - Affordable & Trendy Clothing in Kenya",
    description:
      "Shop stylish and affordable fashion for all Kenyans. From streetwear to formal fits, Avenue Fashion makes it easy with M-Pesa and fast delivery.",
    site: "@avenuefashionke",
    creator: "@avenuefashionke",
    images: [`${siteUrl}/og-image-v2.png`],
  },

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      {
        url: "/apple-touch-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
    ],
  },

  manifest: "/manifest.json",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    },
  },

  category: "shopping",
  classification: "Fashion & Clothing",

  other: {
    "geo.region": "KE",
    "geo.placename": "Kenya",
    "geo.position": "-1.286389;36.817223", // Nairobi coordinates
    ICBM: "-1.286389, 36.817223",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
    "theme-color": "#000000",
    "msapplication-TileColor": "#000000",
    "msapplication-navbutton-color": "#000000",
    "apple-mobile-web-app-title": "Avenue Fashion",
  },
};

// Structured Data for Local Business and Organization
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Avenue Fashion",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo-512x512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://www.facebook.com/avenuefashionke",
        "https://www.instagram.com/avenuefashionke",
        "https://twitter.com/avenuefashionke",
        "https://www.tiktok.com/@avenuefashionke",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+254-700-000-000",
        contactType: "customer service",
        availableLanguage: ["English", "Swahili"],
        areaServed: "KE",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Avenue Fashion",
      description:
        "Kenya's premier online fashion store offering affordable, trendy clothing and accessories",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: [
        {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "Store",
      "@id": `${siteUrl}/#store`,
      name: "Avenue Fashion",
      image: `${siteUrl}/og-image-v2.png`,
      description:
        "Online fashion store serving Kenya with trendy, affordable clothing",
      url: siteUrl,
      telephone: "+254-700-000-000",
      address: {
        "@type": "PostalAddress",
        addressCountry: "KE",
        addressRegion: "Nairobi",
        addressLocality: "Nairobi",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -1.286389,
        longitude: 36.817223,
      },
      openingHours: "Mo-Su 00:00-23:59",
      acceptedPaymentMethod: [
        "http://purl.org/goodrelations/v1#ByBankTransferInAdvance",
        "http://purl.org/goodrelations/v1#Cash",
      ],
      currenciesAccepted: "KES",
      paymentAccepted: "M-Pesa, Bank Transfer, Cash on Delivery",
      areaServed: {
        "@type": "Country",
        name: "Kenya",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en-KE" dir="ltr">
      <head>
        {/* Enhanced Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />
        <meta name="format-detection" content="telephone=no" />

        {/* Enhanced Mobile Optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <meta name="apple-mobile-web-app-title" content="Avenue Fashion" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://js.paystack.co" />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />

        {/* DNS Prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//js.paystack.co" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {/* Enhanced Google Tag Manager - Production Only */}
        {isProduction && (
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-PV4P5GMQ');
              `,
            }}
          />
        )}
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) - Production Only */}
        {isProduction && (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-PV4P5GMQ"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        <ErrorBoundary>
          <SessionProvider session={session}>
            <CartProvider>
              {children}

              {/* UI Components */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />

              {/* PWA Features */}
              <PWAInstallPrompt />

              {/* Privacy Compliance */}
              <CookieConsent />

              {/* Analytics - Production Only */}
              {isProduction && (
                <>
                  <Analytics />
                  <SpeedInsights />
                </>
              )}
            </CartProvider>
          </SessionProvider>
        </ErrorBoundary>

        {/* External Scripts with Performance Optimization */}
        <Script
          src="https://js.paystack.co/v2/inline.js"
          strategy="lazyOnload"
        />

        {/* Service Worker Registration */}
        {isProduction && (
          <Script
            id="sw-register"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}

        {/* Critical CSS Loader for Performance */}
        <Script
          id="critical-css"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Preload critical resources
              const criticalResources = [
                '/fonts/geist-sans-400.woff2',
                '/fonts/geist-sans-500.woff2',
                '/fonts/geist-sans-600.woff2',
              ];
              
              criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = 'font';
                link.type = 'font/woff2';
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
