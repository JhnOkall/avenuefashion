"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IUser } from "@/types";
import { columns } from "./columns";
import { AdminUsersApiResponse, updateUserRole } from "@/lib/data";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Defines the props required by the UserDataTable component.
 */
interface DataTableProps {
  /**
   * The initial set of user data and pagination metadata, pre-fetched on the server.
   */
  initialData: AdminUsersApiResponse;
}

/**
 * A client component that renders a data table for managing users in the admin dashboard.
 * It supports searching, pagination, and role updates. The component's state (search query,
 * page number) is managed via URL search parameters for a refresh-friendly and shareable UI.
 *
 * @param {DataTableProps} props - The initial data for the table.
 */
export function UserDataTable({ initialData }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for the search input and its debounced value.
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("searchQuery") || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // `useTransition` provides a pending state for non-blocking UI updates during server actions.
  const [isPending, startTransition] = useTransition();

  /**
   * A side effect that triggers a search when the debounced search query changes.
   * This avoids making a request on every keystroke.
   */
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchQuery) {
      params.set("searchQuery", debouncedSearchQuery);
    } else {
      params.delete("searchQuery");
    }
    // Always reset to the first page when the search query changes.
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, router, searchParams]);

  /**
   * Handles updating a user's role and provides feedback via toasts.
   * @param {string} userId - The ID of the user to update.
   * @param {'user' | 'admin'} role - The new role to assign.
   */
  const handleRoleChange = (userId: string, role: "user" | "admin") => {
    startTransition(async () => {
      try {
        await updateUserRole(userId, role);
        toast.success("Success", {
          description: "User role has been updated.",
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
   * Initializes the column definitions for the table, passing down the role change handler.
   */
  const tableColumns = columns(handleRoleChange);

  /**
   * The core table instance from `@tanstack/react-table`, configured with
   * the user data, column definitions, and manual pagination settings.
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
        <Input
          placeholder="Filter by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          aria-label="Search users"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {/* Renders the header cell content (e.g., 'Name', 'Email'). */}
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
              // Displayed when no users are found for the current query/page.
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
      {/* TODO: Enhance this pagination with page numbers and an ellipsis for better navigation, especially for a large number of pages. */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePagination(initialData.currentPage - 2)} // Go to the previous page (current is 1-based, handlePagination expects 0-based).
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
          onClick={() => handlePagination(initialData.currentPage)} // Go to the next page (current is 1-based, handlePagination expects 0-based index for the next page).
          disabled={initialData.currentPage >= initialData.totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
