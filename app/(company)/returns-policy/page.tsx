import { Metadata } from "next";
import { ReturnsPolicyClient } from "@/components/legal/ReturnsPolicyClient";

/**
 * Defines the metadata for the Returns & Refunds Policy page for SEO purposes.
 */
export const metadata: Metadata = {
  title: "Returns & Refunds Policy | Avenue Fashion",
  description:
    "Understand the Avenue Fashion 7-day return policy. Learn how to initiate a return, process an exchange, and receive a refund for your order.",
};

/**
 * The main page component for the Returns Policy route.
 *
 * This server component renders the client component containing the policy text,
 * ensuring the page is structured, styled, and delivered efficiently.
 *
 * @returns {JSX.Element} The rendered Returns Policy page.
 */
export default function ReturnsPolicyPage() {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container mx-auto max-w-screen-lg">
        <ReturnsPolicyClient />
      </div>
    </section>
  );
}
