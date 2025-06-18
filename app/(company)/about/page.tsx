import { Metadata } from "next";
import { AboutUsClient } from "@/components/legal/AboutUsClient";

/**
 * Defines the metadata for the About Us page for SEO purposes.
 */
export const metadata: Metadata = {
  title: "About Us | Avenue Fashion",
  description:
    "Learn about the mission, vision, and values behind Avenue Fashion, Kenya's premier online store for curated, high-quality apparel, shoes, and accessories.",
};

/**
 * The main page component for the About Us route.
 *
 * This server component renders the client component containing the page's content,
 * ensuring the page is structured, styled, and delivered efficiently.
 *
 * @returns {JSX.Element} The rendered About Us page.
 */
export default function AboutUsPage() {
  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-screen-lg">
        <AboutUsClient />
      </div>
    </section>
  );
}
