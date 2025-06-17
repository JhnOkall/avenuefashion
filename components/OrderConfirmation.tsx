"use client";

import Link from "next/link";
import Image from "next/image";
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
import { IOrder, IOrderItem } from "@/types";

/**
 * Formats a number into a currency string.
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

/**
 * A reusable sub-component for displaying a labeled piece of information.
 */
const DetailItem = ({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <dl className="flex items-center justify-between gap-4">
    <dt className="font-normal text-muted-foreground">{label}</dt>
    <dd className={`font-medium text-foreground text-end ${valueClassName}`}>
      {value}
    </dd>
  </dl>
);

/**
 * Defines the props required by the OrderConfirmation component.
 */
interface OrderConfirmationProps {
  order: IOrder;
}

/**
 * A client component that displays a confirmation message and a detailed summary
 * of a successfully placed order.
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
            <Button variant="link" asChild className="h-auto p-0 text-base">
              <Link href={`/me/orders/${order.orderId}`}>{order.orderId}</Link>
            </Button>{" "}
            will be processed within 24 hours.
          </p>
        </div>

        <Card className="my-6 md:my-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items List */}
            <div className="space-y-4">
              <h3 className="font-semibold">Items Ordered</h3>
              {order.items.map((item: IOrderItem) => (
                <div
                  key={`${item.product}-${item.variantId}`}
                  className="flex items-start gap-4"
                >
                  <div className="relative h-16 w-16 shrink-0 rounded-md border">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    {item.variantOptions && (
                      <p className="text-sm text-muted-foreground">
                        {Object.entries(item.variantOptions)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <Separator />
            {/* Pricing Details */}
            <div className="space-y-2">
              <h3 className="font-semibold">Pricing Details</h3>
              <DetailItem
                label="Subtotal"
                value={formatPrice(order.pricing.subtotal)}
              />
              <DetailItem
                label="Shipping"
                value={formatPrice(order.pricing.shipping)}
              />
              <DetailItem
                label="Tax (16%)"
                value={formatPrice(order.pricing.tax)}
              />
              {order.pricing.discount > 0 && (
                <DetailItem
                  label="Discount"
                  value={`-${formatPrice(order.pricing.discount)}`}
                  valueClassName="text-green-600"
                />
              )}
              <Separator className="my-2" />
              <DetailItem
                label="Total"
                value={formatPrice(order.pricing.total)}
                valueClassName="text-lg font-bold"
              />
            </div>
            <Separator />
            {/* Shipping and Payment Details */}
            <div className="space-y-2">
              <h3 className="font-semibold">Shipping & Payment</h3>
              <DetailItem
                label="Shipping to"
                value={order.shippingDetails.name}
              />
              <DetailItem
                label="Address"
                value={order.shippingDetails.address}
              />
              <DetailItem
                label="Payment Method"
                value={order.payment.method
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              />
            </div>
          </CardContent>
        </Card>

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
