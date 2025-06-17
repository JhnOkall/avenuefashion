"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IOrder, IOrderItem, IProduct } from "@/types";
import { OrderTimeline } from "./customer/OrderTimeline";

/**
 * Formats a numeric price into a localized currency string.
 */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(price);
};

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * Renders a single line item from an order, displaying its image, name,
 * selected variants, quantity, and price.
 */
const OrderItem = ({ item }: { item: IOrderItem }) => {
  const productSlug =
    typeof item.product === "object" && "slug" in item.product
      ? (item.product as IProduct).slug
      : null;
  const linkHref = productSlug ? `/${productSlug}` : "#";

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start gap-4">
        <Link href={linkHref} className="relative h-20 w-20 shrink-0">
          <Image
            className="rounded-md object-contain"
            src={item.imageUrl ?? "/placeholder.svg"}
            alt={item.name}
            fill
            sizes="80px"
          />
        </Link>
        <div className="flex-1">
          <Link
            href={linkHref}
            className="font-medium text-foreground hover:underline"
          >
            {item.name}
          </Link>
          {item.variantOptions && (
            <p className="text-sm text-muted-foreground">
              {Object.entries(item.variantOptions)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Price at purchase:
          </span>{" "}
          {formatPrice(item.price)}
        </p>
        <div className="flex items-center justify-end gap-4">
          <p className="text-base text-foreground">x{item.quantity}</p>
          <p className="text-xl font-bold leading-tight text-foreground">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

interface OrderTrackingProps {
  order: IOrder;
}

/**
 * A client component that provides a detailed view of an order, including a
 * list of purchased items with variants, a pricing summary, and a fulfillment timeline.
 */
export const OrderTracking = ({ order }: OrderTrackingProps) => {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Track the delivery of order {order.orderId}
        </h2>

        <div className="mt-6 sm:mt-8 lg:flex lg:gap-8">
          <div className="w-full lg:max-w-xl xl:max-w-2xl">
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {order.items.map((item) => (
                  <OrderItem
                    key={`${item.product._id.toString()}-${item.variantId?.toString()}`}
                    item={item}
                  />
                ))}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 bg-muted/50 p-6">
                <dl className="flex w-full items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium text-foreground">
                    {formatPrice(order.pricing.subtotal)}
                  </dd>
                </dl>
                <dl className="flex w-full items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-medium text-foreground">
                    {formatPrice(order.pricing.shipping)}
                  </dd>
                </dl>
                <dl className="flex w-full items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd className="font-medium text-foreground">
                    {formatPrice(order.pricing.tax)}
                  </dd>
                </dl>
                {order.pricing.discount > 0 && (
                  <dl className="flex w-full items-center justify-between gap-4 text-green-600">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="font-medium">
                      -{formatPrice(order.pricing.discount)}
                    </dd>
                  </dl>
                )}
                <Separator className="my-2" />
                <dl className="flex w-full items-center justify-between gap-4">
                  <dt className="text-lg font-bold text-foreground">Total</dt>
                  <dd className="text-lg font-bold text-foreground">
                    {formatPrice(order.pricing.total)}
                  </dd>
                </dl>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6 w-full lg:mt-0 lg:w-auto lg:flex-1">
            <OrderTimeline timeline={order.timeline} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
