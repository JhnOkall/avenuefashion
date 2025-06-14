"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { IOrder } from "@/types";
import { columns } from "./columns";
import { AdminOrdersApiResponse, updateAdminOrder } from "@/lib/data";

/**
 * Defines the props required by the OrderDataTable component.
 */
interface DataTableProps {
  /**
   * The initial set of order data and pagination metadata, pre-fetched on the server.
   */
  initialData: AdminOrdersApiResponse;
}

/**
 * A client component that renders a data table for managing customer orders.
 * It supports filtering by status and server-side pagination. The component's
 * state (filter, page number) is managed via URL search parameters, making the
 * view refresh-friendly and shareable.
 *
 * @param {DataTableProps} props - The initial data for the table.
 */
export function OrderDataTable({ initialData }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * `useTransition` provides a pending state for non-blocking UI updates during
   * server actions, such as when an order's status is being updated.
   */
  const [isPending, startTransition] = useTransition();

  /**
   * Handles updating an order's status via an API call and provides user feedback.
   * @param {string} orderId - The user-facing ID of the order to update (e.g., "ORD-12345").
   * @param {IOrder["status"]} status - The new status to assign to the order.
   */
  const handleUpdateStatus = (orderId: string, status: IOrder["status"]) => {
    startTransition(async () => {
      try {
        await updateAdminOrder(orderId, { status });
        toast.success("Success", {
          description: `Order ${orderId} status updated to ${status}.`,
        });
        // Refresh server-side data to reflect the change in the UI.
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", {
          description: error.message,
        });
      }
    });
  };

  /**
   * Initializes the column definitions for the table, passing down the necessary
   * action handlers for updating the order status.
   */
  const tableColumns = columns(handleUpdateStatus);

  /**
   * The core table instance from `@tanstack/react-table`, configured with
   * the order data, column definitions, and manual pagination settings.
   */
  const table = useReactTable({
    data: initialData.data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    // Pagination is handled manually via URL state, not by the table instance.
    manualPagination: true,
    pageCount: initialData.totalPages,
  });

  /**
   * Handles changes in the status filter by updating the 'status' URL search parameter.
   * This triggers a navigation event that re-fetches server data for the new view.
   * @param {string} status - The new status value to filter by.
   */
  const handleStatusFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    // When changing a filter, always reset the view to the first page.
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  /**
   * Navigates to a specific page by updating the 'page' URL search parameter.
   * @param {number} pageIndex - The 0-based index of the page to navigate to.
   */
  const handlePagination = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", (pageIndex + 1).toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center py-4">
        {/* TODO: Add a search input to filter orders by ID or customer name. */}
        <Select
          defaultValue={searchParams.get("status") || "all"}
          onValueChange={handleStatusFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In transit">In transit</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {/* Renders the header cell content (e.g., 'Order ID', 'Status'). */}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {/* Apply a visual pending state to the table body during server actions. */}
          <TableBody style={{ opacity: isPending ? 0.6 : 1 }}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {/* Renders the body cell content for each row. */}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Displayed when no orders are found for the current query/page.
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      {/* TODO: Enhance this pagination with page numbers and an ellipsis for better navigation, especially for a large number of pages. */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePagination(initialData.currentPage - 2)}
          disabled={initialData.currentPage <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {initialData.currentPage} of {initialData.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePagination(initialData.currentPage)}
          disabled={initialData.currentPage >= initialData.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
