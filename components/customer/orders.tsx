"use client";

import Link from "next/link";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// =================================================================
// TYPES & MOCK DATA
// =================================================================

// TODO: This component is currently using static mock data. It should be refactored
// to fetch real data from an API and use the IOrder interface from '@/types'.

/**
 * A local type definition for an order's status, used for mock data.
 */
type OrderStatus = "Pre-order" | "In transit" | "Confirmed" | "Cancelled";

/**
 * A local interface representing a single order, used for mock data.
 */
interface Order {
  id: string;
  date: string;
  price: number;
  status: OrderStatus;
}

/**
 * A static array of mock orders for demonstration purposes.
 * This should be replaced with data fetched from a backend API.
 */
const orders: Order[] = [
  { id: "#FWB127364372", date: "20.12.2025", price: 4756, status: "Pre-order" },
  { id: "#FWB125467980", date: "11.12.2025", price: 499, status: "In transit" },
  { id: "#FWB139485607", date: "08.12.2025", price: 85, status: "Confirmed" },
  { id: "#FWB137364371", date: "16.11.2025", price: 119, status: "Confirmed" },
  { id: "#FWB146284623", date: "26.09.2025", price: 180, status: "Cancelled" },
];

// =================================================================
// HELPERS & SUB-COMPONENTS
// =================================================================

/**
 * A configuration object mapping each order status to a specific icon,
 * badge variant, and display label. This centralizes status-related UI logic.
 */
const statusConfig: Record<
  OrderStatus,
  {
    icon: LucideIcon;
    variant: "default" | "secondary" | "destructive" | "outline";
    label: string;
  }
> = {
  "Pre-order": { icon: Hourglass, variant: "default", label: "Pre-order" },
  "In transit": { icon: Truck, variant: "secondary", label: "In Transit" },
  Confirmed: { icon: CheckCircle2, variant: "outline", label: "Confirmed" },
  Cancelled: { icon: XCircle, variant: "destructive", label: "Cancelled" },
};

/**
 * A specialized Badge component for displaying an order's status with an
 * icon and color-coding based on the `statusConfig`.
 *
 * @param {object} props - The component props.
 * @param {OrderStatus} props.status - The status of the order.
 */
const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const { icon: Icon, variant, label } = statusConfig[status];
  return (
    <Badge variant={variant} className="py-1">
      <Icon className="mr-1.5 h-3 w-3" />
      {label}
    </Badge>
  );
};

/**
 * Renders a card summarizing a single order, including its key details and action buttons.
 *
 * @param {object} props - The component props.
 * @param {Order} props.order - The mock order object to display.
 */
const OrderCard = ({ order }: { order: Order }) => {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            {/* TODO: Update the href to navigate to the dynamic order details page (e.g., `/me/orders/${order.id}`). */}
            <Button variant="link" asChild className="h-auto p-0 text-base">
              <Link href="#">{order.id}</Link>
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-base font-semibold">{order.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            {/* TODO: Implement a consistent price formatting utility. */}
            <p className="text-base font-semibold">
              ${order.price.toLocaleString()}
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
        {/* The visibility of action buttons is determined by the order status. */}
        {order.status !== "Confirmed" && order.status !== "Cancelled" && (
          // TODO: Implement the `Cancel Order` functionality.
          <Button variant="destructive" className="w-full sm:w-auto">
            Cancel Order
          </Button>
        )}
        {order.status === "Confirmed" || order.status === "Cancelled" ? (
          // TODO: Implement the `Order Again` functionality.
          <Button className="w-full sm:w-auto">
            <RotateCw className="mr-2 h-4 w-4" />
            Order Again
          </Button>
        ) : null}
        <Button variant="outline" className="w-full sm:w-auto">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

/**
 * A static component that renders the "My Orders" page UI.
 * It serves as a visual template and needs to be connected to a dynamic data source.
 */
// TODO: Refactor this into a dynamic component that fetches user orders.
// - Use `useState` or a data-fetching library (e.g., SWR, React Query) to manage orders, filters, and pagination state.
// - Implement `onValueChange` handlers for the Select components to update the filter state.
// - Implement `onClick` handlers for the Pagination component to update the current page.
// - Trigger an API call when filters or page number change.
const Orders = () => {
  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="gap-4 sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              My Orders
            </h2>
            {/* Filter controls are currently static. */}
            <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-0 sm:gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-full min-w-[10rem] sm:w-auto">
                  <SelectValue placeholder="All orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="pre-order">Pre-order</SelectItem>
                  <SelectItem value="transit">In transit</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <span className="hidden text-muted-foreground sm:inline-block">
                from
              </span>
              <Select defaultValue="this-year">
                <SelectTrigger className="w-full min-w-[10rem] sm:w-auto">
                  <SelectValue placeholder="This year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 months</SelectItem>
                  <SelectItem value="this-year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 space-y-4 sm:mt-8">
            {/* The list is rendered from static mock data. */}
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {/* Pagination is currently static. */}
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  );
};

export default Orders;
