"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye } from "lucide-react";
import { IOrder } from "@/types";

/**
 * Defines the props required by the LatestOrders component.
 */
interface LatestOrdersProps {
  /**
   * An array of the user's most recent order objects to be displayed.
   */
  orders: IOrder[];
}

/**
 * Maps an order status string to a corresponding `shadcn/ui` Badge variant.
 * This provides visual distinction for different order statuses.
 * @param {string} status - The status of the order.
 * @returns {string} The name of the Badge variant ('success', 'destructive', etc.).
 */
// TODO: Improve type safety here. The `as any` cast is a workaround. A better solution
// would be to define a custom type that maps status strings to valid Badge variants.
const getStatusVariant = (status: IOrder["status"]) => {
  switch (status) {
    case "Confirmed":
      return "success";
    case "Cancelled":
      return "destructive";
    case "In transit":
      return "default";
    default:
      return "secondary";
  }
};

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

/**
 * A client component that displays a summary list of a user's most recent orders
 * on their profile dashboard. It provides key details and quick actions for each order.
 *
 * @param {LatestOrdersProps} props - The props containing the user's recent orders.
 */
export const LatestOrders = ({ orders }: LatestOrdersProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Latest Orders</CardTitle>
        <Button asChild variant="link">
          <Link href="/me/orders">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          <div className="divide-y divide-border">
            {orders.map((order) => {
              return (
                <div
                  key={order._id.toString()}
                  className="flex flex-wrap items-center gap-y-4 py-4"
                >
                  {/* Order ID */}
                  <dl className="w-1/2 sm:w-48">
                    <dt className="text-muted-foreground">Order ID</dt>
                    <dd className="mt-1 font-semibold text-foreground">
                      {/* Navigates to the detailed tracking page for this order. */}
                      <Link
                        href={`/me/orders/${order.orderId}`}
                        className="hover:underline"
                      >
                        {order.orderId}
                      </Link>
                    </dd>
                  </dl>

                  {/* Order Date */}
                  <dl className="w-1/2 sm:w-1/4 md:flex-1">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="mt-1 font-semibold text-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </dd>
                  </dl>

                  {/* Order Total Price */}
                  <dl className="w-1/2 sm:w-1/5 md:flex-1">
                    <dt className="text-muted-foreground">Price</dt>
                    <dd className="mt-1 font-semibold text-foreground">
                      {formatPrice(order.pricing.total)}
                    </dd>
                  </dl>

                  {/* Order Status */}
                  <dl className="w-1/2 sm:w-1/4 md:flex-1">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant={getStatusVariant(order.status) as any}>
                        {order.status}
                      </Badge>
                    </dd>
                  </dl>

                  {/* Actions Menu */}
                  <div className="w-full sm:w-auto sm:ml-auto">
                    {/* TODO: Add more actions to this dropdown, such as "Print Invoice" or "Request Return". */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Actions <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/me/orders/${order.orderId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Order Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Displayed when the user has no orders.
          <p className="py-8 text-center text-muted-foreground">
            You haven't placed any orders yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
