import { Metadata } from "next";
import { PaymentMethodsClient } from "@/components/legal/PaymentMethodsClient";

/**
 * Defines the metadata for the Payment Methods page for SEO purposes.
 */
export const metadata: Metadata = {
  title: "Payment Methods | Avenue Fashion",
  description:
    "Learn about the secure and convenient payment options at Avenue Fashion, including M-Pesa, Airtel Money, Visa, Mastercard via Paystack, and Pay on Delivery.",
};

/**
 * The main page component for the Payment Methods route.
 *
 * This server component renders the client component containing the policy text,
 * ensuring the page is structured, styled, and delivered efficiently.
 *
 * @returns {JSX.Element} The rendered Payment Methods page.
 */
export default function PaymentMethodsPage() {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container mx-auto max-w-screen-lg">
        <PaymentMethodsClient />
      </div>
    </section>
  );
}
