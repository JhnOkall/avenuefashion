"use client";

import { HandCoins, CreditCard, Smartphone, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";

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
 * Renders the full Payment Methods page content for Avenue Fashion.
 */
// DISCLAIMER: Ensure this policy accurately reflects the payment options enabled in your Paystack dashboard.
export function PaymentMethodsClient() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold md:text-4xl">
          Payment Methods
        </CardTitle>
        <p className="text-muted-foreground">
          Secure, Convenient, and Flexible Ways to Pay.
        </p>
      </CardHeader>
      <CardContent className="space-y-12">
        {/* Pay Now Section */}
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
              <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Pay Now (Recommended)</h2>
              <p className="text-muted-foreground">
                Pay securely online at checkout for the fastest order
                processing. We partner with <strong>Paystack</strong>, a leading
                and secure payment gateway, to offer a wide range of options.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/payments/mpesa.svg"
                alt="M-Pesa Logo"
                width={80}
                height={40}
                className="object-contain"
              />
              <p className="text-sm font-medium">M-Pesa</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/payments/airtel-money.svg"
                alt="Airtel Money Logo"
                width={80}
                height={40}
                className="object-contain"
              />
              <p className="text-sm font-medium">Airtel Money</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/payments/visa.svg"
                alt="Visa Logo"
                width={80}
                height={40}
                className="object-contain"
              />
              <p className="text-sm font-medium">Visa Cards</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/payments/mastercard.svg"
                alt="Mastercard Logo"
                width={80}
                height={40}
                className="object-contain"
              />
              <p className="text-sm font-medium">Mastercard</p>
            </div>
          </div>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            ...and more options available via Paystack at checkout.
          </p>
        </div>

        {/* Pay on Delivery Section */}
        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <HandCoins className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Pay on Delivery</h2>
              <p className="text-muted-foreground">
                Prefer to pay when your order arrives? Select "Pay on Delivery"
                at checkout. Please have the exact amount ready for our courier.
                This option is available for all our delivery locations across
                Nairobi.
              </p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-green-600" />
          <h3 className="mt-4 text-2xl font-semibold">
            Your Security is Our Priority
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            We do not store your full credit/debit card details on our servers.
            All online transactions are processed through Paystack's secure,
            PCI-compliant payment gateway, which encrypts your data to ensure it
            remains safe and private.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
