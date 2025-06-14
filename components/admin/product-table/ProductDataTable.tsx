"use client";

import { useState, useTransition, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
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
import { IProduct } from "@/types";
import { columns } from "./columns";
import { ProductForm } from "./ProductForm";
import { AdminProductsApiResponse, updateProduct } from "@/lib/data";
import { useDebounce } from "@/hooks/use-debounce";

/**
 * Defines the props required by the ProductDataTable component.
 */
interface DataTableProps {
  /**
   * The initial set of product data and pagination metadata, pre-fetched on the server.
   */
  initialData: AdminProductsApiResponse;
}

/**
 * A client component that renders a comprehensive data table for managing products
 * in the admin dashboard. It supports searching, sorting, pagination, and provides
 * CRUD operations via a modal form.
 *
 * @param {DataTableProps} props - The initial data for the table.
 */
export function ProductDataTable({ initialData }: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for client-side sorting.
  const [sorting, setSorting] = useState<SortingState>([]);
  // State for search input and its debounced value to reduce API calls.
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("searchQuery") || ""
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // `useTransition` provides a pending state for non-blocking UI updates.
  const [isPending, startTransition] = useTransition();
  // State for the create/edit product form dialog.
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  /**
   * Effect to trigger a search when the debounced search query changes.
   */
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchQuery) {
      params.set("searchQuery", debouncedSearchQuery);
    } else {
      params.delete("searchQuery");
    }
    params.delete("page"); // Reset to first page on a new search.
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, router, searchParams]);

  /**
   * Prepares and opens the form to edit an existing product.
   * @param {IProduct} product - The product object to be edited.
   */
  const handleEdit = (product: IProduct) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  /**
   * Toggles the `isActive` status of a product.
   * @param {IProduct} product - The product whose status will be toggled.
   */
  // TODO: Add a confirmation dialog before deactivating a product to prevent accidental changes.
  const handleToggleStatus = (product: IProduct) => {
    startTransition(async () => {
      try {
        await updateProduct(product._id.toString(), {
          isActive: !product.isActive,
        });
        toast.success("Success", { description: "Product status updated." });
        router.refresh(); // Refresh server-side data.
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  /**
   * Initializes the column definitions, passing down action handlers.
   */
  const tableColumns = columns(handleEdit, handleToggleStatus);

  /**
   * The core table instance from `@tanstack/react-table`.
   */
  const table = useReactTable({
    data: initialData.data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    // Pagination is handled manually via URL search parameters.
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
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter products by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          aria-label="Search products"
        />
        <Button
          onClick={() => {
            setSelectedProduct(null); // Set to null for "create" mode.
            setIsFormOpen(true);
          }}
        >
          Add Product
        </Button>
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

      {/* Pagination Controls */}
      {/* TODO: Enhance pagination to show page numbers and an ellipsis for better UX with many pages. */}
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

      {/* The dialog form for creating and editing products. */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
