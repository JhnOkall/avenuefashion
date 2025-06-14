"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IProduct } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";

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
 * A factory function that generates the column definitions for the product data table.
 * This approach allows for injecting action handlers (e.g., `onEdit`, `onToggleStatus`)
 * from the parent component, keeping the column definitions decoupled from state management.
 *
 * @param {(product: IProduct) => void} onEdit - A callback function to trigger the edit mode for a product.
 * @param {(product: IProduct) => void} onToggleStatus - A callback function to toggle the active status of a product.
 * @returns {ColumnDef<IProduct>[]} An array of column definitions for `@tanstack/react-table`.
 */
export const columns = (
  onEdit: (product: IProduct) => void,
  onToggleStatus: (product: IProduct) => void
): ColumnDef<IProduct>[] => [
  {
    /**
     * Defines the 'Name' column. The header is a button that allows for sorting.
     */
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    /**
     * Defines the 'Brand' column. It accesses a nested property from the populated
     * `brand` object.
     */
    accessorKey: "brand.name",
    header: "Brand",
  },
  {
    /**
     * Defines the 'Price' column, which is right-aligned and uses a currency formatter.
     */
    // TODO: Add a sortable header to this column for price-based sorting.
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatPrice(row.getValue("price"))}
      </div>
    ),
  },
  {
    /**
     * Defines the 'Status' column, using a Badge for visual indication
     * of whether the product is active or inactive on the storefront.
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
     * Defines the 'Created At' column, displaying the date the product
     * was added to the system.
     */
    // TODO: Make this header sortable to allow admins to find the newest or oldest products.
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    /**
     * Defines a custom 'Actions' column that provides a dropdown menu for each row.
     * This column does not map directly to a data key.
     */
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(product)}>
              {product.isActive ? "Set as Inactive" : "Set as Active"}
            </DropdownMenuItem>
            {/* TODO: Implement a "Delete" action with a confirmation dialog for a complete CRUD experience. */}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete Product</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
