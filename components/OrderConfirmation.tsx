"use client";

import Link from "next/link";
import { Truck, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IOrder } from "@/types";

/**
 * A reusable sub-component for displaying a labeled piece of information.
 *
 * @param {object} props - The component props.
 * @param {string} props.label - The label or title for the detail.
 * @param {string} props.value - The value of the detail to be displayed.
 * @returns {JSX.Element} A dl/dt/dd element pair for semantic display of data.
 */
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <dl className="sm:flex sm:items-center sm:justify-between sm:gap-4">
    <dt className="font-normal text-muted-foreground">{label}</dt>
    <dd className="font-medium text-foreground sm:text-end">{value}</dd>
  </dl>
);

/**
 * Defines the props required by the OrderConfirmation component.
 */
interface OrderConfirmationProps {
  /**
   * The order object containing all details of the successfully placed order.
   */
  order: IOrder;
}

/**
 * A client component that displays a confirmation message and a summary of a
 * successfully placed order. This is typically the final step in the checkout process.
 *
 * @param {OrderConfirmationProps} props - The props for the component.
 */
const OrderConfirmation = ({ order }: OrderConfirmationProps) => {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-2xl px-4 2xl:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Thanks for your order!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your order{" "}
            {/* The link navigates to the specific order tracking page */}
            <Button variant="link" asChild className="h-auto p-0 text-base">
              <Link href={`/me/orders/${order.orderId}`}>{order.orderId}</Link>
            </Button>{" "}
            will be processed within 24 hours. We'll notify you by email once it
            has shipped.
          </p>
        </div>

        <Card className="my-6 md:my-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Here are the details of your recent purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem
              label="Date"
              value={new Date(order.createdAt).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <Separator />
            <DetailItem label="Payment Method" value={order.payment.method} />
            <Separator />
            <DetailItem label="Name" value={order.shippingDetails.name} />
            <Separator />
            {/* TODO: The address is a single string. For better data structure and display flexibility, consider refactoring `shippingDetails.address` into a structured object (e.g., { street, city, country, postalCode }). */}
            <DetailItem label="Address" value={order.shippingDetails.address} />
            <Separator />
            <DetailItem label="Phone" value={order.shippingDetails.phone} />
          </CardContent>
        </Card>

        {/* Action buttons for post-order navigation */}
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <Button asChild size="lg">
            <Link href={`/me/orders/${order.orderId}`}>
              <Truck className="mr-2 h-5 w-5" />
              Track your order
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/">
              <Undo2 className="mr-2 h-5 w-5" />
              Return to shopping
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OrderConfirmation;
