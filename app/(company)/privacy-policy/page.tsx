import { Metadata } from "next";
import { PrivacyPolicyClient } from "@/components/legal/PrivacyPolicyClient";

/**
 * Defines the metadata for the Privacy Policy page, which is important for SEO
 * and how the page is displayed in browser tabs and search engine results.
 */
export const metadata: Metadata = {
  title: "Privacy Policy | Avenue Fashion",
  description:
    "Learn how Avenue Fashion collects, uses, and protects your personal information when you use our services.",
};

/**
 * The main page component for the Privacy Policy route.
 *
 * As a React Server Component (RSC), its primary role is to define the route and
 * render the client component that contains the actual policy content and styling.
 * This separation keeps the server component clean and focused on routing and metadata.
 *
 * @returns {JSX.Element} The rendered Privacy Policy page.
 */
export default function PrivacyPolicyPage() {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="container mx-auto max-w-screen-lg">
        <PrivacyPolicyClient />
      </div>
    </section>
  );
}
