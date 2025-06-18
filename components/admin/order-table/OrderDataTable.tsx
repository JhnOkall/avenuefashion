"use client";

import { useTransition } from "react";
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
// --- Assuming updateAdminOrder is updated to handle both statuses ---
import { AdminOrdersApiResponse, updateAdminOrder } from "@/lib/data";

/**
 * Defines the props required by the OrderDataTable component.
 */
interface DataTableProps {
  initialData: AdminOrdersApiResponse;
}

/**
 * A client component that renders a data table for managing customer orders.
 * It supports filtering by delivery and payment status, and server-side pagination.
 */
export function OrderDataTable({ initialData }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * Handles updating an order's DELIVERY status.
   */
  const handleUpdateDeliveryStatus = (
    orderId: string,
    status: IOrder["status"]
  ) => {
    startTransition(async () => {
      try {
        // --- FIX: Pass a payload specific to delivery status ---
        await updateAdminOrder(orderId, { status });
        toast.success("Success", {
          description: `Order ${orderId} delivery status updated to ${status}.`,
        });
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  /**
   * --- NEW: Handles updating an order's PAYMENT status. ---
   */
  const handleUpdatePaymentStatus = (
    orderId: string,
    status: IOrder["payment"]["status"]
  ) => {
    startTransition(async () => {
      try {
        // --- FIX: Pass a payload specific to payment status ---
        await updateAdminOrder(orderId, { paymentStatus: status });
        toast.success("Success", {
          description: `Order ${orderId} payment status updated to ${status}.`,
        });
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  /**
   * --- FIX: Pass both handler functions to the columns factory ---
   */
  const tableColumns = columns(
    handleUpdateDeliveryStatus,
    handleUpdatePaymentStatus
  );

  const table = useReactTable({
    data: initialData.data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: initialData.totalPages,
  });

  /**
   * --- NEW: Handles changes for the delivery status filter ---
   */
  const handleDeliveryFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("deliveryStatus", status);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  /**
   * --- NEW: Handles changes for the payment status filter ---
   */
  const handlePaymentFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("paymentStatus", status);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePagination = (pageIndex: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", (pageIndex + 1).toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        {/* --- FIX: Updated the Delivery Status filter --- */}
        <Select
          defaultValue={searchParams.get("deliveryStatus") || "all"}
          onValueChange={handleDeliveryFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by delivery..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Delivery Statuses</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="In transit">In transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* --- NEW: Added the Payment Status filter --- */}
        <Select
          defaultValue={searchParams.get("paymentStatus") || "all"}
          onValueChange={handlePaymentFilterChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by payment..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody style={{ opacity: isPending ? 0.6 : 1 }}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
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
