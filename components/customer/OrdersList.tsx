"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Hourglass,
  Truck,
  CheckCircle2,
  XCircle,
  LucideIcon,
  RotateCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IOrder } from "@/types";
import { MyOrdersApiResponse } from "@/lib/data";

// =================================================================
// TYPES & HELPERS
// =================================================================

/**
 * A type alias for the possible statuses of an order.
 */
type OrderStatus = IOrder["status"];

/**
 * Configuration object that maps each order status to a specific icon,
 * badge variant, and display label. This centralizes status-related UI logic.
 */
const statusConfig: Record<
  OrderStatus,
  {
    icon: LucideIcon;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    label: string;
  }
> = {
  "Pre-order": { icon: Hourglass, variant: "default", label: "Pre-order" },
  Pending: { icon: Hourglass, variant: "default", label: "Pending" },
  "In transit": { icon: Truck, variant: "secondary", label: "In Transit" },
  Confirmed: { icon: CheckCircle2, variant: "success", label: "Confirmed" },
  Cancelled: { icon: XCircle, variant: "destructive", label: "Cancelled" },
};

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file for application-wide reusability.
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
 * A specialized Badge component for displaying an order's status with an
 * icon and color-coding based on the `statusConfig`.
 *
 * @param {object} props - The component props.
 * @param {OrderStatus} props.status - The status of the order.
 */
const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status] || statusConfig["Pending"];
  // TODO: The `as any` cast is a workaround. Define a custom type that maps status strings to valid Badge variants for improved type safety.
  return (
    <Badge variant={config.variant as any} className="py-1">
      <config.icon className="mr-1.5 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

/**
 * Renders a card summarizing a single order, including its key details and action buttons.
 *
 * @param {object} props - The component props.
 * @param {IOrder} props.order - The order object to display.
 */
const OrderCard = ({ order }: { order: IOrder }) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            <Button variant="link" asChild className="h-auto p-0 text-base">
              <Link href={`/me/orders/${order.orderId}`}>{order.orderId}</Link>
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-base font-semibold">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-base font-semibold">
              {formatPrice(order.pricing.total)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <Separator orientation="vertical" className="hidden h-12 lg:block" />
      </CardHeader>
      <CardFooter className="flex flex-col items-stretch justify-end gap-2 p-4 pt-0 sm:flex-row sm:items-center">
        {/* TODO: Implement the `Cancel Order` functionality. This will require a backend API endpoint and a confirmation dialog. */}
        {order.status !== "Confirmed" && order.status !== "Cancelled" && (
          <Button variant="destructive" className="w-full sm:w-auto" disabled>
            Cancel Order
          </Button>
        )}
        {/* TODO: Implement the `Order Again` functionality. This should create a new cart with the items from this order. */}
        {(order.status === "Confirmed" || order.status === "Cancelled") && (
          <Button className="w-full sm:w-auto" disabled>
            <RotateCw className="mr-2 h-4 w-4" />
            Order Again
          </Button>
        )}
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/me/orders/${order.orderId}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

interface OrdersListProps {
  ordersData: MyOrdersApiResponse;
}

/**
 * A client component that displays a filterable and paginated list of the user's orders.
 * It manages its state (filters, page number) through URL search parameters,
 * which makes the view shareable and refresh-friendly.
 *
 * @param {OrdersListProps} props - Component props containing the initial orders data.
 */
export const OrdersList = ({ ordersData }: OrdersListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: orders, totalPages, currentPage } = ordersData;

  /**
   * Handles changes in filters or pagination by updating the URL search parameters.
   * This triggers a navigation event that re-fetches server data for the new view.
   *
   * @param {'status' | 'page'} key - The URL parameter to update.
   * @param {string | number} value - The new value for the parameter.
   */
  const handleUrlStateChange = (
    key: "status" | "page",
    value: string | number
  ) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set(key, String(value));

    // When changing a filter, always reset the view to the first page.
    if (key === "status") {
      currentParams.delete("page");
    }

    router.replace(`${pathname}?${currentParams.toString()}`);
  };

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="gap-4 sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              My Orders
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-0 sm:gap-4">
              <Select
                defaultValue={searchParams.get("status") || "all"}
                onValueChange={(value) => handleUrlStateChange("status", value)}
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-auto">
                  <SelectValue placeholder="All orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In transit">In transit</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-4 sm:mt-8">
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard key={order._id.toString()} order={order} />
              ))
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <p>No orders found matching your filter.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handleUrlStateChange("page", currentPage - 1)
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
                {/* TODO: For a large number of pages, implement pagination with ellipsis (...) to avoid rendering an excessively long list of page numbers. */}
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handleUrlStateChange("page", i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handleUrlStateChange("page", currentPage + 1)
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </section>
  );
};
