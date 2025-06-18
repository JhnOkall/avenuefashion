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
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
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

type OrderStatus = IOrder["status"];

/**
 * --- FIX: Updated configuration to match the new delivery statuses. ---
 * Maps each delivery status to a specific icon, badge variant, and display label.
 */
const statusConfig: Record<
  OrderStatus,
  {
    icon: LucideIcon;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    label: string;
  }
> = {
  Confirmed: { icon: CheckCircle2, variant: "secondary", label: "Confirmed" },
  Processing: { icon: Hourglass, variant: "default", label: "Processing" },
  "In transit": { icon: Truck, variant: "default", label: "In Transit" },
  Delivered: { icon: CheckCircle2, variant: "success", label: "Delivered" },
  Cancelled: { icon: XCircle, variant: "destructive", label: "Cancelled" },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(price);
};

// =================================================================
// SUB-COMPONENTS
// =================================================================

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  // Fallback to 'Confirmed' if an unexpected status is encountered.
  const config = statusConfig[status] || statusConfig["Confirmed"];
  return (
    <Badge variant={config.variant as any} className="py-1">
      <config.icon className="mr-1.5 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const OrderCard = ({ order }: { order: IOrder }) => {
  // --- FIX: Improved button logic based on new delivery statuses ---
  const isCancellable =
    order.status === "Confirmed" || order.status === "Processing";
  const isReorderable =
    order.status === "Delivered" || order.status === "Cancelled";

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
        {isCancellable && (
          <Button variant="destructive" className="w-full sm:w-auto" disabled>
            Cancel Order
          </Button>
        )}
        {isReorderable && (
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

export const OrdersList = ({ ordersData }: OrdersListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: orders, totalPages, currentPage } = ordersData;

  const handleUrlStateChange = (
    key: "status" | "page",
    value: string | number
  ) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set(key, String(value));
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
              {/* --- FIX: Updated filter dropdown with new delivery statuses --- */}
              <Select
                defaultValue={searchParams.get("status") || "all"}
                onValueChange={(value) => handleUrlStateChange("status", value)}
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-auto">
                  <SelectValue placeholder="All orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="In transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
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
