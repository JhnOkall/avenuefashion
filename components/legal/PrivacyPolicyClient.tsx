"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A reusable sub-component for a section of the privacy policy.
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
 * Renders the full Privacy Policy content for Avenue Fashion.
 * This component is designed to be easily readable and structured.
 */
export function PrivacyPolicyClient() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold md:text-4xl">
          Privacy Policy
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
        <PolicySection title="1. Introduction">
          <p>
            Welcome to Avenue Fashion ("we," "our," "us"). We are committed to
            protecting your personal information and your right to privacy. This
            Privacy Policy explains what information we collect, how we use it,
            and what rights you have in relation to it.
          </p>
          <p>
            This policy applies to all information collected through our
            website, and/or any related services, sales, marketing, or events.
          </p>
        </PolicySection>

        <PolicySection title="2. Information We Collect">
          <p>
            We collect personal information that you voluntarily provide to us
            when you register on the website, express an interest in obtaining
            information about us or our products, when you participate in
            activities on the website (such as posting reviews or making
            purchases), or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect includes the following:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Personal Identification Information:</strong> Your full
              name, email address, phone number, and shipping addresses.
            </li>
            <li>
              <strong>Authentication Data:</strong> When you sign in using a
              third-party provider like Google, we receive your name, email
              address, and profile picture from that service. We handle
              passwords securely and do not store them in plain text.
            </li>
            <li>
              <strong>Transactional Information:</strong> Details about your
              purchases, order history, payment method type (e.g., "Credit
              Card", "M-Pesa" - we do not store full payment card numbers), and
              shipping information.
            </li>
            <li>
              <strong>User-Generated Content:</strong> Product reviews, ratings,
              comments, and lists of favorite products that you create.
            </li>
            <li>
              <strong>Technical and Usage Data:</strong> We automatically
              collect certain information when you visit, use, or navigate the
              website. This information does not reveal your specific identity
              but may include device and usage information, such as your IP
              address, browser and device characteristics, operating system,
              language preferences, referring URLs, and other technical
              information. We collect this information primarily for security
              and operational purposes, and for our internal analytics.
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> We use cookies to manage
              your session (e.g., for login and shopping cart persistence),
              remember your search history, and improve your user experience.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="3. How We Use Your Information">
          <p>
            We use the information we collect for various business purposes,
            including:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>To Fulfill and Manage Your Orders:</strong> To process
              your payments, ship your orders, and provide you with customer
              service.
            </li>
            <li>
              <strong>To Manage Your Account:</strong> To create and manage your
              account, and to enable user-to-user communication.
            </li>
            <li>
              <strong>To Personalize Your Experience:</strong> To show you
              relevant products and content.
            </li>
            <li>
              <strong>
                To Send Administrative and Marketing Communications:
              </strong>{" "}
              To send you product, service, and new feature information and/or
              information about changes to our terms, conditions, and policies.
              We may also send you marketing communications if you have opted
              in. You can opt-out of our marketing emails at any time.
            </li>
            <li>
              <strong>For Security and Fraud Prevention:</strong> To protect our
              website and users from fraudulent activities.
            </li>
            <li>
              <strong>For Business Analytics:</strong> To analyze usage and
              trends to improve our website and service offerings.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="4. Information Sharing and Disclosure">
          <p>
            We only share information with your consent, to comply with laws, to
            provide you with services, to protect your rights, or to fulfill
            business obligations. We may share your data with the following
            third-party vendors, service providers, or agents:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Payment Processing:</strong> To process your payments when
              you make a purchase. (e.g., Stripe, M-Pesa).
            </li>
            <li>
              <strong>Order Fulfillment & Shipping:</strong> To ship your
              orders. (e.g., local courier services).
            </li>
            <li>
              <strong>Authentication Services:</strong> To allow you to log in
              with your Google account (e.g., Google Identity Services via
              NextAuth.js).
            </li>
            <li>
              <strong>Cloud Hosting & Infrastructure:</strong> Our application
              is hosted on Vercel and our database on MongoDB Atlas.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose your
              information where we are legally required to do so in order to
              comply with applicable law, governmental requests, or legal
              process.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="5. Your Privacy Rights">
          <p>
            Based on the laws of your region, you may have the following rights
            regarding your personal information:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              The right to access, update, or delete the information we have on
              you.
            </li>
            <li>
              The right to object to the processing of your personal
              information.
            </li>
            <li>The right to opt-out of marketing communications.</li>
          </ul>
          <p>
            You can review or change the information in your account or
            terminate your account by logging into your account settings. If you
            have questions or wish to exercise your rights, please contact us at
            the email provided below.
          </p>
        </PolicySection>

        <PolicySection title="6. Data Security">
          <p>
            We have implemented appropriate technical and organizational
            security measures designed to protect the security of any personal
            information we process. However, despite our safeguards and efforts
            to secure your information, no electronic transmission over the
            Internet or information storage technology can be guaranteed to be
            100% secure.
          </p>
        </PolicySection>

        <PolicySection title="7. Changes to This Policy">
          <p>
            We may update this privacy policy from time to time. The updated
            version will be indicated by a "Last Updated" date and the updated
            version will be effective as soon as it is accessible. We encourage
            you to review this privacy policy frequently to be informed of how
            we are protecting your information.
          </p>
        </PolicySection>

        <PolicySection title="8. Contact Us">
          <p>
            If you have questions or comments about this policy, you may email
            us at{" "}
            <Link
              href="mailto:support@avenuefashion.co.ke"
              className="text-primary hover:underline"
            >
              support@avenuefashion.co.ke
            </Link>{" "}
            or by post to:
          </p>
          <address className="not-italic">
            Avenue Fashion, Inc.
            {/*<br />
            123 Fashion Street */}
            <br />
            Nairobi, Kenya
          </address>
        </PolicySection>
      </CardContent>
    </Card>
  );
}
