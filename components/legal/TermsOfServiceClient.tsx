"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * A reusable sub-component for a section of the legal document.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the section.
 * @param {React.ReactNode} props.children - The content of the section.
 */
const TermsSection = ({
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
 * Renders the full Terms of Service content for Avenue Fashion.
 * This component is designed to be easily readable and structured.
 */
export function TermsOfServiceClient() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold md:text-4xl">
          Terms of Service
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
        <TermsSection title="1. Agreement to Terms">
          <p>
            By accessing or using our website, Avenue Fashion (the "Service"),
            you agree to be bound by these Terms of Service ("Terms"). If you
            disagree with any part of the terms, then you may not access the
            Service. These Terms apply to all visitors, users, and others who
            wish to access or use the Service.
          </p>
        </TermsSection>

        <TermsSection title="2. User Accounts">
          <p>
            When you create an account with us, you must provide information
            that is accurate, complete, and current at all times. Failure to do
            so constitutes a breach of the Terms, which may result in immediate
            termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to
            access the Service and for any activities or actions under your
            password. You agree not to disclose your password to any third
            party. You must notify us immediately upon becoming aware of any
            breach of security or unauthorized use of your account.
          </p>
          <p>
            You must be at least 18 years of age to create an account and use
            this Service.
          </p>
        </TermsSection>

        <TermsSection title="3. Orders, Payments, and Pricing">
          <p>
            By placing an order through our Service, you are offering to
            purchase a product on and subject to the following terms and
            conditions. All orders are subject to availability and confirmation
            of the order price.
          </p>
          <p>
            We reserve the right to refuse or cancel your order at any time for
            reasons including but not limited to: product or service
            availability, errors in the description or price of the product or
            service, or other reasons. We reserve the right to refuse or cancel
            your order if fraud or an unauthorized or illegal transaction is
            suspected.
          </p>
          <p>
            Prices for our products are subject to change without notice. While
            we try and ensure that all details, descriptions, and prices which
            appear on this Website are accurate, errors may occur.
          </p>
        </TermsSection>

        <TermsSection title="4. Shipping, Returns, and Refunds">
          <p>
            Our policies regarding shipping, delivery, product returns, and
            refunds are detailed in our separate Shipping and Returns policies.
            Please review these policies carefully before making a purchase. By
            making a purchase, you agree to the terms outlined in these
            policies.
          </p>
          <p>
            You can find our{" "}
            <Link
              href="/shipping-policy"
              className="text-primary hover:underline"
            >
              Shipping Policy here
            </Link>{" "}
            and our{" "}
            <Link
              href="/returns-policy"
              className="text-primary hover:underline"
            >
              Returns & Refunds Policy here
            </Link>
            .
          </p>
        </TermsSection>

        <TermsSection title="5. User-Generated Content (Reviews)">
          <p>
            Our Service may allow you to post, link, store, share and otherwise
            make available certain information, text, graphics, or other
            material ("Content"). You are responsible for the Content that you
            post on or through the Service, including its legality, reliability,
            and appropriateness.
          </p>
          <p>
            By posting Content, you grant us the right and license to use,
            modify, publicly perform, publicly display, reproduce, and
            distribute such Content on and through the Service. You retain any
            and all of your rights to any Content you submit, post or display on
            or through the Service.
          </p>
          <p>
            You agree that your Content will not contain material that is
            unlawful, obscene, defamatory, threatening, or otherwise
            objectionable.
          </p>
        </TermsSection>

        <TermsSection title="6. Prohibited Conduct">
          <p>
            You agree not to use the Service for any purpose that is illegal or
            prohibited by these Terms. You agree not to:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Use the Service in any way that could damage, disable, overburden,
              or impair the Service.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Service,
              other accounts, computer systems, or networks connected to the
              Service.
            </li>
            <li>
              Use any data mining, robots, or similar data gathering or
              extraction methods.
            </li>
            <li>
              Violate the security of the Service through any unauthorized
              access, circumvention of encryption or other security tools, data
              mining, or interference to any host, user, or network.
            </li>
          </ul>
        </TermsSection>

        <TermsSection title="7. Intellectual Property">
          <p>
            The Service and its original content (excluding Content provided by
            users), features, and functionality are and will remain the
            exclusive property of Avenue Fashion and its licensors. The Service
            is protected by copyright, trademark, and other laws of both Kenya
            and foreign countries. Our trademarks may not be used in connection
            with any product or service without the prior written consent of
            Avenue Fashion.
          </p>
        </TermsSection>

        <TermsSection title="8. Termination">
          <p>
            We may terminate or suspend your account and bar access to the
            Service immediately, without prior notice or liability, under our
            sole discretion, for any reason whatsoever and without limitation,
            including but not to a breach of the Terms.
          </p>
        </TermsSection>

        <TermsSection title="9. Disclaimer of Warranties; Limitation of Liability">
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
            do not warrant that the service will be uninterrupted, secure, or
            error-free.
          </p>
          <p>
            In no event shall Avenue Fashion, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses, resulting from your access to or use of
            or inability to access or use the Service.
          </p>
        </TermsSection>

        <TermsSection title="10. Governing Law">
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of the Republic of Kenya, without regard to its conflict of law
            provisions.
          </p>
        </TermsSection>

        <TermsSection title="11. Changes to Terms">
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will provide notice of any changes by
            posting the new Terms on this page and updating the "Last Updated"
            date. Your continued use of the Service after any such changes
            constitutes your acceptance of the new Terms.
          </p>
        </TermsSection>

        <TermsSection title="12. Contact Us">
          <p>
            If you have any questions about these Terms, please contact us at{" "}
            <Link
              href="mailto:support@avenuefashion.co.ke"
              className="text-primary hover:underline"
            >
              support@avenuefashion.co.ke
            </Link>
            .
          </p>
        </TermsSection>
      </CardContent>
    </Card>
  );
}
