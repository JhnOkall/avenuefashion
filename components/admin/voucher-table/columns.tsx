"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IVoucher } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file for application-wide consistency.
// TODO: Confirm if the currency should be 'KES' to match other parts of the application instead of 'USD'.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "USD" }).format(
    price
  );

/**
 * A factory function that generates the column definitions for the voucher data table.
 * This approach allows for injecting action handlers (like `onEdit`) from the parent
 * component, keeping the column definitions decoupled from the state management logic.
 *
 * @param {(voucher: IVoucher) => void} onEdit - A callback function to trigger the edit mode for a voucher.
 * @param {(voucher: IVoucher) => void} onToggleStatus - A callback function to toggle the active status of a voucher.
 * @returns {ColumnDef<IVoucher>[]} An array of column definitions for `@tanstack/react-table`.
 */
export const columns = (
  onEdit: (voucher: IVoucher) => void,
  onToggleStatus: (voucher: IVoucher) => void
): ColumnDef<IVoucher>[] => [
  {
    /**
     * Defines the 'Code' column, displaying the unique voucher code.
     */
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      // Monospaced font for better readability of codes.
      <div className="font-mono font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    /**
     * Defines the 'Value' column, which dynamically displays the discount
     * as either a percentage or a fixed currency amount.
     */
    accessorKey: "discountValue",
    header: "Value",
    cell: ({ row }) => {
      const type = row.original.discountType;
      const value = row.getValue("discountValue") as number;
      return (
        <div>{type === "percentage" ? `${value}%` : formatPrice(value)}</div>
      );
    },
  },
  {
    /**
     * Defines the 'Status' column, using a Badge for visual indication
     * of whether the voucher is active or inactive.
     */
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    /**
     * Defines the 'Expires At' column, displaying the voucher's expiration
     * date or a fallback message if it never expires.
     */
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as string | null;
      return expiresAt ? new Date(expiresAt).toLocaleDateString() : "No Expiry";
    },
  },
  {
    /**
     * Defines a custom 'Actions' column that provides a dropdown menu for each row.
     * This column does not map directly to a data accessor.
     */
    id: "actions",
    cell: ({ row }) => {
      const voucher = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(voucher)}>
              Edit Voucher
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(voucher)}>
              {voucher.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            {/* TODO: Implement a "Delete" action with a confirmation dialog for a complete CRUD experience.
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
