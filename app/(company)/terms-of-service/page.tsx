import { Metadata } from "next";
import { TermsOfServiceClient } from "@/components/legal/TermsOfServiceClient";

/**
 * Defines the metadata for the Terms of Service page.
 */
export const metadata: Metadata = {
  title: "Terms of Service | Avenue Fashion",
  description:
    "Read the terms and conditions for using the Avenue Fashion website and services.",
};

/**
 * The main page component for the Terms of Service route.
 *
 * This server component renders the client component containing the legal text,
 * ensuring the page is structured, styled, and delivered efficiently.
 *
 * @returns {JSX.Element} The rendered Terms of Service page.
 */
export default function TermsOfServicePage() {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container mx-auto max-w-screen-lg">
        <TermsOfServiceClient />
      </div>
    </section>
  );
}
