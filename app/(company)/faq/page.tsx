import { Metadata } from "next";
import { FaqClient } from "@/components/legal/FaqClient";

/**
 * Defines the metadata for the FAQ page for SEO purposes.
 */
export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Avenue Fashion",
  description:
    "Find answers to common questions about shopping at Avenue Fashion, including orders, shipping in Kenya, payments with M-Pesa, returns, and account management.",
};

/**
 * The main page component for the FAQ route.
 *
 * This server component renders the client component containing the FAQ accordion,
 * ensuring the page is structured, styled, and delivered efficiently.
 *
 * @returns {JSX.Element} The rendered FAQ page.
 */
export default function FaqPage() {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container mx-auto max-w-screen-lg">
        <FaqClient />
      </div>
    </section>
  );
}
