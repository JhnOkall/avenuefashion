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
    x="0px"
    y="0px"
    width="100"
    height="100"
    viewBox="0 0 50 50"
    className="text-primary-foreground"
    fill="currentColor"
  >
    <path d="M 9 4 C 6.2495759 4 4 6.2495759 4 9 L 4 41 C 4 43.750424 6.2495759 46 9 46 L 41 46 C 43.750424 46 46 43.750424 46 41 L 46 9 C 46 6.2495759 43.750424 4 41 4 L 9 4 z M 9 6 L 41 6 C 42.671576 6 44 7.3284241 44 9 L 44 41 C 44 42.671576 42.671576 44 41 44 L 9 44 C 7.3284241 44 6 42.671576 6 41 L 6 9 C 6 7.3284241 7.3284241 6 9 6 z M 26.042969 10 A 1.0001 1.0001 0 0 0 25.042969 10.998047 C 25.042969 10.998047 25.031984 15.873262 25.021484 20.759766 C 25.016184 23.203017 25.009799 25.64879 25.005859 27.490234 C 25.001922 29.331679 25 30.496833 25 30.59375 C 25 32.409009 23.351421 33.892578 21.472656 33.892578 C 19.608867 33.892578 18.121094 32.402853 18.121094 30.539062 C 18.121094 28.675273 19.608867 27.1875 21.472656 27.1875 C 21.535796 27.1875 21.663054 27.208245 21.880859 27.234375 A 1.0001 1.0001 0 0 0 23 26.240234 L 23 22.039062 A 1.0001 1.0001 0 0 0 22.0625 21.041016 C 21.906673 21.031216 21.710581 21.011719 21.472656 21.011719 C 16.223131 21.011719 11.945313 25.289537 11.945312 30.539062 C 11.945312 35.788589 16.223131 40.066406 21.472656 40.066406 C 26.72204 40.066409 31 35.788588 31 30.539062 L 31 21.490234 C 32.454611 22.653646 34.267517 23.390625 36.269531 23.390625 C 36.542588 23.390625 36.802305 23.374442 37.050781 23.351562 A 1.0001 1.0001 0 0 0 37.958984 22.355469 L 37.958984 17.685547 A 1.0001 1.0001 0 0 0 37.03125 16.6875 C 33.886609 16.461891 31.379838 14.012216 31.052734 10.896484 A 1.0001 1.0001 0 0 0 30.058594 10 L 26.042969 10 z M 27.041016 12 L 29.322266 12 C 30.049047 15.2987 32.626734 17.814404 35.958984 18.445312 L 35.958984 21.310547 C 33.820114 21.201935 31.941489 20.134948 30.835938 18.453125 A 1.0001 1.0001 0 0 0 29 19.003906 L 29 30.539062 C 29 34.707538 25.641273 38.066406 21.472656 38.066406 C 17.304181 38.066406 13.945312 34.707538 13.945312 30.539062 C 13.945312 26.538539 17.066083 23.363182 21 23.107422 L 21 25.283203 C 18.286416 25.535721 16.121094 27.762246 16.121094 30.539062 C 16.121094 33.483274 18.528445 35.892578 21.472656 35.892578 C 24.401892 35.892578 27 33.586491 27 30.59375 C 27 30.64267 27.001859 29.335571 27.005859 27.494141 C 27.009759 25.65271 27.016224 23.20692 27.021484 20.763672 C 27.030884 16.376775 27.039186 12.849206 27.041016 12 z"></path>
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
