"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IOrder, IOrderItem, IProduct } from "@/types";
import { OrderTimeline } from "./customer/OrderTimeline";

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string (e.g., "Ksh 1,234.56").
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file to ensure consistency and avoid code duplication.
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
 * quantity, and price at the time of purchase.
 *
 * @param {object} props - The component props.
 * @param {IOrderItem} props.item - The order item data to display.
 */
const OrderItem = ({ item }: { item: IOrderItem }) => (
  // TODO: Consider adding a link to the product page. This would require ensuring the `product` field is populated with a slug from the API.
  <div className="space-y-4 p-6">
    <div className="flex items-center gap-6">
      <div className="relative h-14 w-14 shrink-0">
        <Image
          className="h-full w-full object-contain"
          src={item.imageUrl ?? "/placeholder.svg"}
          alt={item.name}
          fill
          sizes="56px"
        />
      </div>
      <p className="min-w-0 flex-1 font-medium text-foreground">{item.name}</p>
    </div>
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Price at purchase:</span>{" "}
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

// =================================================================
// MAIN COMPONENT
// =================================================================

/**
 * Defines the props for the OrderTracking component.
 */
interface OrderTrackingProps {
  /**
   * The complete order object containing all details for tracking.
   */
  order: IOrder;
}

/**
 * A client component that provides a detailed view of an order, including a
 * list of purchased items, a pricing summary, and a visual timeline of the
 * order's fulfillment status.
 *
 * @param {OrderTrackingProps} props - The props for the component.
 */
export const OrderTracking = ({ order }: OrderTrackingProps) => {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Track the delivery of order {order.orderId}
        </h2>

        <div className="mt-6 sm:mt-8 lg:flex lg:gap-8">
          {/* Left Column: Order Items and Pricing Summary */}
          <div className="w-full lg:max-w-xl xl:max-w-2xl">
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {/* A list of all items included in the order */}
                {order.items.map((item, index) => (
                  // Using index as a key is acceptable here since the list is static and not re-ordered.
                  <OrderItem key={index} item={item} />
                ))}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 bg-muted/50 p-6">
                {/* Detailed pricing breakdown */}
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
                {/* Conditionally display the discount if one was applied */}
                {order.pricing.discount > 0 && (
                  <dl className="flex w-full items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Discount</dt>
                    <dd className="font-medium text-green-600">
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
            {/* TODO: Add a "Print Invoice" button that opens a printable view of the order details. */}
          </div>

          {/* Right Column: Order Fulfillment Timeline */}
          <div className="mt-6 w-full lg:mt-0 lg:w-auto lg:flex-1">
            <OrderTimeline timeline={order.timeline} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
