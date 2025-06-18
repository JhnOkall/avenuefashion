"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { IOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

/**
 * Formats a numeric price into a localized currency string.
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

/**
 * Maps a delivery status string to a corresponding `shadcn/ui` Badge variant.
 * @param {string} status - The delivery status of the order.
 * @returns {string} The name of the Badge variant.
 */
const getDeliveryStatusVariant = (status: string) => {
  switch (status) {
    case "Delivered":
      return "success";
    case "Cancelled":
      return "destructive";
    case "In transit":
      return "default";
    case "Processing":
      return "info";
    case "Confirmed":
    default:
      return "secondary";
  }
};

/**
 * Maps a payment status string to a Badge variant.
 * @param {string} status - The payment status of the order.
 * @returns {string} The name of the Badge variant.
 */
const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case "Completed":
      return "success";
    case "Failed":
      return "destructive";
    case "Pending":
    default:
      return "secondary";
  }
};

/**
 * A factory function that generates the column definitions for the admin order data table.
 *
 * @param onDeliveryStatusChange - A callback to handle changing an order's delivery status.
 * @param onPaymentStatusChange - A callback to handle changing an order's payment status.
 * @returns An array of column definitions.
 */
export const columns = (
  onDeliveryStatusChange: (orderId: string, status: IOrder["status"]) => void,
  // --- FIX: Added a second callback for payment status updates ---
  onPaymentStatusChange: (
    orderId: string,
    status: IOrder["payment"]["status"]
  ) => void
): ColumnDef<IOrder>[] => [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => {
      const cleanOrderId = row.original.orderId.replace("#", "");
      return (
        <Link
          href={`/orders/${cleanOrderId}`}
          className="font-medium hover:underline"
        >
          {row.getValue("orderId")}
        </Link>
      );
    },
  },
  {
    accessorKey: "user.name",
    header: "Customer",
    cell: ({ row }) => {
      const user = row.original.user;
      interface IUser {
        name: string;
        email: string;
      }
      const isUserObject = (user: any): user is IUser =>
        typeof user === "object" && user !== null && "name" in user;
      const userData = isUserObject(user) ? user : null;
      return (
        <div>
          <div>{userData?.name ?? "N/A"}</div>
          <div className="text-xs text-muted-foreground">
            {userData?.email ?? ""}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "pricing.total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatPrice(row.original.pricing.total)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Delivery Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={getDeliveryStatusVariant(status) as any}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "payment.status",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.original.payment.status;
      return (
        <Badge variant={getPaymentStatusVariant(status) as any}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const cleanOrderId = order.orderId.replace("#", "");

      const deliveryStatuses: IOrder["status"][] = [
        "Confirmed",
        "Processing",
        "In transit",
        "Delivered",
        "Cancelled",
      ];
      // --- NEW: Define the possible payment statuses ---
      const paymentStatuses: IOrder["payment"]["status"][] = [
        "Pending",
        "Completed",
        "Failed",
      ];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/orders/${cleanOrderId}`}>View Order Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Sub-menu for Delivery Status */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Update Delivery Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {deliveryStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() =>
                      onDeliveryStatusChange(order.orderId, status)
                    }
                    disabled={order.status === status}
                  >
                    Set as {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* --- FIX: Added a second sub-menu for Payment Status --- */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Update Payment Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {paymentStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onPaymentStatusChange(order.orderId, status)}
                    disabled={order.payment.status === status}
                  >
                    Set as {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
