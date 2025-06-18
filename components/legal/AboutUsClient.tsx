"use client";

import Link from "next/link";
import { Gem, Zap, HeartHandshake, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

/**
 * A reusable sub-component for a feature or value card.
 * @param {object} props - The component props.
 * @param {LucideIcon} props.icon - The Lucide icon component to display.
 * @param {string} props.title - The title of the feature.
 * @param {string} props.description - The description of the feature.
 */
const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

/**
 * Renders the full About Us page content for Avenue Fashion.
 */
export function AboutUsClient() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          Our Story
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Redefining Fashion in Kenya, One Outfit at a Time.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-3xl space-y-4 text-center text-lg">
        <h2 className="text-2xl font-semibold md:text-3xl">Our Mission</h2>
        <p className="text-muted-foreground">
          Founded in the heart of Nairobi, Avenue Fashion was born from a simple
          yet powerful idea: fashion is a form of self-expression, and everyone
          deserves access to high-quality, contemporary styles that make them
          feel confident and unique. We saw a gap in the Kenyan market for a
          shopping experience that combined global trends with local
          convenience, and we set out to fill it.
        </p>
        <p className="text-muted-foreground">
          Our mission is to empower you to express your personal style by
          providing a thoughtfully curated collection of apparel, shoes, and
          accessories, all delivered through a seamless, world-class online
          platform.
        </p>
      </div>

      <Separator />

      {/* Core Values Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">
            What We Stand For
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Our core values guide every decision we make, from the products we
            source to the customer service we provide.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={Gem}
            title="Curated Quality"
            description="We believe in quality over quantity. Every item in our collection is hand-picked for its superior craftsmanship, style, and durability."
          />
          <FeatureCard
            icon={Zap}
            title="Seamless Technology"
            description="Our platform is built on modern technology to ensure a fast, secure, and intuitive shopping experience from your first click to checkout."
          />
          <FeatureCard
            icon={HeartHandshake}
            title="Customer-Centric Service"
            description="You are at the center of everything we do. Our team is dedicated to providing friendly, responsive support to ensure you love your experience."
          />
          <FeatureCard
            icon={Globe}
            title="Local Heart, Global Vision"
            description="We are proudly Kenyan, offering convenient payment methods like M-Pesa and local delivery, while keeping an eye on global fashion trends."
          />
        </div>
      </div>

      <Separator />

      {/* Call to Action Section */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold md:text-3xl">Join the Avenue</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Ready to discover your next favorite outfit? Explore our latest
          arrivals and find pieces that truly represent you.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">Explore Our Collections</Link>
        </Button>
      </div>
    </div>
  );
}
