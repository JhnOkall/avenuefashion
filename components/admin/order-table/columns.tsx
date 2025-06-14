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
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file for application-wide consistency.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

/**
 * Maps an order status string to a corresponding `shadcn/ui` Badge variant.
 * This provides visual distinction for different order statuses.
 * @param {string} status - The status of the order.
 * @returns {string} The name of the Badge variant ('success', 'destructive', etc.).
 */
// TODO: Improve type safety here. The `as any` cast is a workaround. A better solution
// would be to define a custom type that maps status strings to valid Badge variants.
const getStatusVariant = (status: string) => {
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
 * A factory function that generates the column definitions for the admin order data table.
 * This approach allows for injecting action handlers (like `onStatusChange`) from the parent
 * component, keeping the column definitions decoupled from state management logic.
 *
 * @param {(orderId: string, status: IOrder["status"]) => void} onStatusChange - A callback function to handle changing an order's status.
 * @returns {ColumnDef<IOrder>[]} An array of column definitions for `@tanstack/react-table`.
 */
export const columns = (
  onStatusChange: (orderId: string, status: IOrder["status"]) => void
): ColumnDef<IOrder>[] => [
  {
    /**
     * Defines the 'Order ID' column.
     */
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => (
      // TODO: Make this link dynamic, pointing to the specific order details page (e.g., `/admin/orders/${order.orderId}`).
      <Link href="#" className="font-medium hover:underline">
        {row.getValue("orderId")}
      </Link>
    ),
  },
  {
    /**
     * Defines the 'Customer' column, displaying a composite of the user's name and email.
     * It safely accesses nested data from the populated `user` object.
     */
    accessorKey: "user.name",
    header: "Customer",
    cell: ({ row }) => {
      // The `user` field can be a populated object or just an ObjectId. This safely handles both cases.
      const user = row.original.user;
      interface IUser {
        name: string;
        email: string;
      }

      const isUserObject = (user: any): user is IUser =>
        typeof user === "object" &&
        user !== null &&
        "name" in user &&
        "email" in user;
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
    /**
     * Defines the 'Total' column, which is right-aligned and uses a currency formatter.
     */
    // TODO: Add a sortable header to this column for price-based sorting.
    accessorKey: "pricing.total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatPrice(row.original.pricing.total)}
      </div>
    ),
  },
  {
    /**
     * Defines the 'Status' column, using a Badge for visual indication of the order status.
     */
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={getStatusVariant(status) as any}>{status}</Badge>;
    },
  },
  {
    /**
     * Defines the 'Date' column, displaying when the order was created.
     */
    // TODO: Make this header sortable to allow admins to find the newest or oldest orders.
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    /**
     * Defines a custom 'Actions' column that provides a dropdown menu for each row.
     * This column does not map directly to a data key.
     */
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const orderStatuses: IOrder["status"][] = [
        "Pending",
        "In transit",
        "Confirmed",
        "Cancelled",
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
            {/* TODO: Update the href to be a dynamic link to the order details page. */}
            <DropdownMenuItem asChild>
              <Link href={`#`}>View Order Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {orderStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusChange(order.orderId, status)}
                    disabled={order.status === status}
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
