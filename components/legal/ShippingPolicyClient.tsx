"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * A reusable sub-component for a section of the legal document.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the section.
 * @param {React.ReactNode} props.children - The content of the section.
 */
const PolicySection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <h2 className="text-xl font-semibold text-foreground md:text-2xl">
      {title}
    </h2>
    <div className="space-y-4 text-muted-foreground">{children}</div>
  </div>
);

/**
 * Renders the full Shipping Policy content for Avenue Fashion.
 */
// DISCLAIMER: This is a template. You should consult with your courier partners and potentially a legal professional to ensure this policy accurately reflects your operational capabilities and legal obligations.
export function ShippingPolicyClient() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold md:text-4xl">
          Shipping & Delivery Policy
        </CardTitle>
        <p className="text-muted-foreground">
          Last Updated:{" "}
          {new Date().toLocaleDateString("en-KE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <PolicySection title="1. Order Processing">
          <p>
            Thank you for shopping with Avenue Fashion! All orders are processed
            within <strong>1-2 business days</strong> (excluding weekends and
            public holidays) after receiving your order confirmation email. You
            will receive another notification when your order has shipped.
          </p>
        </PolicySection>

        <PolicySection title="2. Shipping Rates & Delivery Estimates">
          <p>
            Shipping charges for your order will be calculated and displayed at
            checkout. The final shipping fee is determined by your specific
            delivery location (city/town).
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Nairobi & Metropolitan Area:</strong> Deliveries are
              typically completed within <strong>1-2 business days</strong>. We
              may use our in-house delivery team or a third-party service like
              Uber Connect for express deliveries.
            </li>
            <li>
              <strong>Major Towns & Cities (Outside Nairobi):</strong>{" "}
              Deliveries to major county headquarters and towns (e.g., Mombasa,
              Kisumu, Nakuru, Eldoret) are typically completed within{" "}
              <strong>2-3 business days</strong>.
            </li>
            <li>
              <strong>Other Regions:</strong> For more remote or rural areas,
              please allow up to <strong>5 business days</strong> for delivery.
            </li>
          </ul>
          <p>
            Please note that delivery times are estimates and commence from the
            date of shipping, rather than the date of order. Delays may occur
            due to circumstances beyond our control, such as adverse weather
            conditions or logistical challenges faced by our courier partners.
          </p>
        </PolicySection>

        <PolicySection title="3. Our Courier Partners">
          <p>
            To ensure reliable and timely delivery across Kenya, we partner with
            a network of trusted courier services, including:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>G4S Courier</strong>
            </li>
            <li>
              <strong>Fargo Courier</strong>
            </li>
            <li>
              <strong>Uber Connect (For select Nairobi locations)</strong>
            </li>
            <li>
              <strong>
                In-house Delivery Team (For select Nairobi locations)
              </strong>
            </li>
          </ul>
          <p>
            The choice of courier for your specific order will depend on your
            location and the size of your package to ensure the most efficient
            service.
          </p>
        </PolicySection>

        <PolicySection title="4. How to Track Your Order">
          <p>
            Once your order has shipped, you will receive an email notification
            from us which will include a tracking number you can use to check
            its status. Please allow up to 24 hours for the tracking information
            to become available on the courier's system.
          </p>
          <p>
            You can also track your order directly from your account on our
            website. Simply log in and navigate to the "My Orders" section to
            view the status and timeline of your delivery.
          </p>
          <p>
            If you haven’t received your order within 5 business days of
            receiving your shipping confirmation email, please contact us at{" "}
            <Link
              href="mailto:support@avenuefashion.co.ke"
              className="text-primary hover:underline"
            >
              support@avenuefashion.co.ke
            </Link>{" "}
            with your name and order number, and we will look into it for you.
          </p>
        </PolicySection>

        <PolicySection title="5. Shipping to P.O. Boxes">
          <p>
            Please note that some of our courier partners may have limitations
            when delivering to P.O. Box addresses. We highly recommend providing
            a physical street address to ensure a smooth and direct delivery.
          </p>
        </PolicySection>

        <PolicySection title="6. Order Pick-up">
          <p>
            At this time, we do not offer in-store or warehouse pick-up options.
            All orders are fulfilled through our delivery network.
          </p>
        </PolicySection>

        <PolicySection title="7. Damages and Issues">
          <p>
            Please inspect your order upon reception and contact us immediately
            if the item is defective, damaged, or if you receive the wrong item,
            so that we can evaluate the issue and make it right. Please refer to
            our{" "}
            <Link
              href="/returns-policy"
              className="text-primary hover:underline"
            >
              Returns & Refunds Policy
            </Link>{" "}
            for more details.
          </p>
        </PolicySection>

        <PolicySection title="8. Contact Us">
          <p>
            If you have any further questions about our shipping process, please
            do not hesitate to contact us at{" "}
            <Link
              href="mailto:support@avenuefashion.co.ke"
              className="text-primary hover:underline"
            >
              support@avenuefashion.co.ke
            </Link>
            .
          </p>
        </PolicySection>
      </CardContent>
    </Card>
  );
}
