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
 * Renders the full Returns & Refunds Policy content for Avenue Fashion.
 */
export function ReturnsPolicyClient() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold md:text-4xl">
          Returns & Refunds Policy
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
        <PolicySection title="1. Our Commitment to Satisfaction">
          <p>
            At Avenue Fashion, your satisfaction is our priority. If you are not
            completely satisfied with your purchase, we are here to help. This
            policy outlines the conditions and process for returning an item.
          </p>
          <p>
            You have <strong>7 calendar days</strong> from the date you received
            your item to initiate a return for a refund, store credit, or an
            exchange.
          </p>
        </PolicySection>

        <PolicySection title="2. Return Eligibility & Conditions">
          <p>
            To be eligible for a return, your item must meet the following
            conditions:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              The item must be unused, unworn, unwashed, and in the same
              condition that you received it.
            </li>
            <li>All original tags and labels must be attached and intact.</li>
            <li>The item must be in its original packaging.</li>
            <li>
              You must have the receipt or proof of purchase (e.g., your order
              confirmation email or order number).
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="3. Non-Returnable Items">
          <p>
            For hygiene and safety reasons, certain types of items cannot be
            returned. These include:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Underwear, lingerie, and swimwear.</li>
            <li>Earrings and other pierced jewelry.</li>
            <li>Items marked as "Final Sale" or on clearance.</li>
            <li>Gift cards.</li>
          </ul>
        </PolicySection>

        <PolicySection title="4. How to Initiate a Return">
          <p>To start the return process, please follow these steps:</p>
          <ol className="list-decimal space-y-2 pl-6">
            <li>
              <strong>Contact Us:</strong> Email our customer support team at{" "}
              <Link
                href="mailto:support@avenuefashion.co.ke"
                className="text-primary hover:underline"
              >
                support@avenuefashion.co.ke
              </Link>{" "}
              within 7 days of receiving your order. Please include your order
              number, the item(s) you wish to return, and the reason for the
              return.
            </li>
            <li>
              <strong>Await Approval:</strong> Our team will review your
              request. If your return is approved, we will provide you with
              detailed instructions on how to send your item back to us,
              including the return address.
            </li>
            <li>
              <strong>Ship the Item:</strong> Securely package the item in its
              original packaging and send it to the address provided. You will
              be responsible for the return shipping costs unless the item is
              damaged or incorrect.
            </li>
          </ol>
        </PolicySection>

        <PolicySection title="5. Refunds">
          <p>
            Once we receive and inspect your returned item, we will send you an
            email to notify you that we have received it. We will also notify
            you of the approval or rejection of your refund.
          </p>
          <p>
            If your return is approved, your refund will be processed, and a
            credit will automatically be applied to your original method of
            payment (e.g., M-Pesa, credit card) within{" "}
            <strong>5-10 business days</strong>.
          </p>
        </PolicySection>

        <PolicySection title="6. Exchanges">
          <p>
            The fastest way to ensure you get what you want is to return the
            item you have, and once the return is accepted, make a separate
            purchase for the new item. This ensures you get your desired item
            quickly and avoids issues with stock availability.
          </p>
        </PolicySection>

        <PolicySection title="7. Damaged or Incorrect Items">
          <p>
            We take great care in packaging our products, but if you receive an
            item that is defective, damaged, or incorrect, please contact us
            immediately.
          </p>
          <p>
            Email us at{" "}
            <Link
              href="mailto:support@avenuefashion.co.ke"
              className="text-primary hover:underline"
            >
              support@avenuefashion.co.ke
            </Link>{" "}
            with your order number and a photo of the item's condition. We will
            address these issues on a case-by-case basis and will cover all
            shipping costs for a replacement or a full refund.
          </p>
        </PolicySection>

        <PolicySection title="8. Questions">
          <p>
            If you have any questions concerning our return policy, please
            contact us at:{" "}
            <Link
              href="mailto:support@avenuefashion.co.ke"
              className="text-primary hover:underline"
            >
              support@avenuefashion.co.ke
            </Link>
          </p>
        </PolicySection>
      </CardContent>
    </Card>
  );
}
