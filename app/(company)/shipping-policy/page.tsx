import { Metadata } from "next";
import { ShippingPolicyClient } from "@/components/legal/ShippingPolicyClient";

/**
 * Defines the metadata for the Shipping Policy page for SEO purposes.
 */
export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Avenue Fashion",
  description:
    "Learn about Avenue Fashion's shipping rates, delivery timelines, and order tracking process across Kenya. We partner with G4S, Fargo, and Uber for fast delivery.",
};

/**
 * The main page component for the Shipping Policy route.
 *
 * This server component renders the client component containing the policy text,
 * ensuring the page is structured, styled, and delivered efficiently.
 *
 * @returns {JSX.Element} The rendered Shipping Policy page.
 */
export default function ShippingPolicyPage() {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container mx-auto max-w-screen-lg">
        <ShippingPolicyClient />
      </div>
    </section>
  );
}
