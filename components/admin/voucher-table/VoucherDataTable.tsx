"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { IVoucher } from "@/types";
import { columns } from "./columns";
import { VoucherForm } from "./VoucherForm";
import { AdminVouchersApiResponse, updateVoucher } from "@/lib/data";

/**
 * Defines the props required by the VoucherDataTable component.
 */
interface DataTableProps {
  /**
   * The initial set of voucher data, pre-fetched on the server, to populate the table.
   */
  initialData: AdminVouchersApiResponse;
}

/**
 * A client component that renders a data table for managing discount vouchers.
 * It uses `@tanstack/react-table` to display the data and provides functionality
 * for creating, editing, and toggling the status of vouchers via a modal form.
 *
 * @param {DataTableProps} props - The initial data for the table.
 */
// TODO: Implement client-side filtering, sorting, and pagination using `@tanstack/react-table` plugins
// to enhance usability for administrators managing a large number of vouchers.
export function VoucherDataTable({ initialData }: DataTableProps) {
  const router = useRouter();

  /**
   * `useTransition` provides a pending state for non-blocking UI updates during
   * server actions like toggling a voucher's status.
   */
  const [isPending, startTransition] = useTransition();
  /**
   * State to control the visibility of the create/edit voucher form dialog.
   */
  const [isFormOpen, setIsFormOpen] = useState(false);
  /**
   * State to hold the voucher object that is currently being edited.
   * If `null`, the form is in "create" mode.
   */
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);

  /**
   * Prepares and opens the form to edit an existing voucher.
   * @param {IVoucher} voucher - The voucher object to be edited.
   */
  const handleEdit = (voucher: IVoucher) => {
    setSelectedVoucher(voucher);
    setIsFormOpen(true);
  };

  /**
   * Toggles the `isActive` status of a voucher.
   * @param {IVoucher} voucher - The voucher whose status will be toggled.
   */
  const handleToggleStatus = (voucher: IVoucher) => {
    startTransition(async () => {
      try {
        await updateVoucher(voucher._id.toString(), {
          isActive: !voucher.isActive,
        });
        toast.success("Success", { description: "Voucher status updated." });
        // Refresh server-side data to reflect the changes in the UI.
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  /**
   * Initializes the column definitions for the table, passing down the necessary
   * action handlers (`handleEdit`, `handleToggleStatus`).
   */
  const tableColumns = columns(handleEdit, handleToggleStatus);

  /**
   * The core table instance from `@tanstack/react-table`, configured with
   * the voucher data and column definitions.
   */
  const table = useReactTable({
    data: initialData.data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="flex items-center justify-end py-4">
        <Button
          onClick={() => {
            // Set selected voucher to null to open the form in "create" mode.
            setSelectedVoucher(null);
            setIsFormOpen(true);
          }}
        >
          Create Voucher
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {/* Renders the header cell content based on the column definition. */}
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
                      {/* Renders the body cell content based on the column definition. */}
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Displayed when there are no vouchers to show.
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No vouchers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* The dialog form for creating and editing vouchers. */}
      <VoucherForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        voucher={selectedVoucher}
      />
    </div>
  );
}
