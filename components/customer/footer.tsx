"use client";

import Link from "next/link";
import { Package2, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

// =================================================================
// DATA & CONFIGURATION
// =================================================================

/**
 * A data structure defining the sections and links for the footer.
 * This approach makes the component cleaner and easier to update.
 */
// TODO: For a more dynamic site, this data could be fetched from a headless CMS or a configuration API.
const footerSections = [
  {
    title: "Company",
    links: ["About", "Premium", "Blog", "Affiliate Program", "Get Coupon"],
  },
  {
    title: "Order & Purchases",
    links: [
      "Order Status",
      "Track Your Order",
      "Purchase History",
      "Returns & Refunds",
      "Payment Methods",
    ],
  },
  {
    title: "Support & Services",
    links: [
      "Contact Support",
      "FAQs",
      "Service Centers",
      "Warranty Information",
      "Product Manuals",
    ],
  },
  {
    title: "Sell on Avenue Fashion",
    links: [
      "Seller Registration",
      "How to Sell",
      "Seller Policies",
      "Seller Resources",
      "Seller Support",
    ],
  },
];

/**
 * A custom SVG component for the TikTok icon.
 * @param {React.SVGProps<SVGSVGElement>} props - Standard SVG props.
 */
const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    className="h-5 w-5 icon icon-tabler icons-tabler-outline icon-tabler-brand-tiktok"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
  </svg>
);

/**
 * An array defining the social media links for the footer.
 */
const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/avenuefashionke",
  },
  {
    name: "TikTok",
    icon: TiktokIcon,
    href: "https://tiktok.com/@avenuefashionke",
  },
];

/**
 * The main footer component for the application. It includes navigation links,
 * a newsletter subscription form, app download links, and legal/social information.
 */
const Footer = () => {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="border-t border-border py-8 lg:py-16">
          <div className="gap-8 lg:flex">
            {/* Link Columns */}
            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-foreground">
                    {section.title}
                  </h3>
                  <ul className="space-y-3 text-sm">
                    {section.links.map((link) => (
                      <li key={link}>
                        {/* TODO: Replace '#' with actual paths for each link. */}
                        <Link
                          href="#"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Newsletter and Socials Section */}
            <div className="mt-8 w-full lg:mt-0 lg:max-w-md">
              <Card className="bg-muted/50 p-6">
                <CardContent className="p-0">
                  <Link
                    href="#"
                    className="text-base font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign In or Create Account
                  </Link>
                  <Separator className="my-5" />
                  {/* TODO: Connect this form to a marketing service API (e.g., Mailchimp, ConvertKit) and handle form state and submission. */}
                  <form action="#" className="space-y-4">
                    <label
                      htmlFor="email-subscribe"
                      className="block text-sm font-medium text-foreground"
                    >
                      Get the latest deals and more.
                    </label>
                    <div className="flex w-full items-center space-x-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          type="email"
                          id="email-subscribe"
                          placeholder="Enter your email"
                          required
                          aria-label="Email for newsletter"
                        />
                      </div>
                      <Button type="submit">Subscribe</Button>
                    </div>
                  </form>
                  <Separator className="my-5" />
                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">
                      Trade on the go with the{" "}
                      {/* TODO: Replace '#' with the actual app landing page URL. */}
                      <Link href="#" className="text-primary hover:underline">
                        Avenue Fashion App
                      </Link>
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {/* TODO: Replace '#' with the actual Google Play Store URL. */}
                      <Button
                        asChild
                        variant="secondary"
                        className="w-full sm:w-auto"
                      >
                        <Link href="#">
                          {/* Google Play SVG is retained for brand accuracy. */}
                          <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="currentColor"
                          >
                            {" "}
                            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"></path>{" "}
                          </svg>
                          Google Play
                        </Link>
                      </Button>
                      {/* TODO: Replace '#' with the actual Apple App Store URL. */}
                      <Button
                        asChild
                        variant="secondary"
                        className="w-full sm:w-auto"
                      >
                        <Link href="#">
                          {/* Apple SVG is retained for brand accuracy. */}
                          <svg
                            className="mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 384 512"
                            fill="currentColor"
                          >
                            {" "}
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />{" "}
                          </svg>
                          App Store
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Logo, Copyright, and Social Links */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <Package2 className="h-6 w-6 text-primary" />
              <span>Avenue Fashion</span>
            </Link>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <Link href="/" className="hover:underline">
                Avenue Fashion.
              </Link>{" "}
              All rights reserved. Powered by{" "}
              <Link
                href="https://nyota.africa"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline"
              >
                Nyota
              </Link>
              .
            </p>

            <div className="flex space-x-2">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="icon" asChild>
                  <Link
                    href={social.href}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
