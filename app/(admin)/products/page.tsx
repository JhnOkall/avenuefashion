import { Suspense } from "react";
import { fetchAdminProducts } from "@/lib/data";
import { ProductDataTable } from "@/components/admin/product-table/ProductDataTable";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the products data table.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial product data. This improves
 * the user's perceived performance and prevents content layout shifts by mimicking
 * the final layout of the data table and its controls.
 *
 * @returns {JSX.Element} A skeleton layout of the data table.
 */
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between">
      {/* Skeleton for the search input */}
      <Skeleton className="h-10 w-64" />
      {/* Skeleton for the "Add Product" button */}
      <Skeleton className="h-10 w-28" />
    </div>
    {/* Skeleton for the main table content */}
    <Skeleton className="h-[500px] w-full" />
    {/* Skeleton for the pagination controls */}
    <div className="flex justify-end">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

/**
 * The main page component for the administrator's product management interface.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route (typically via a parent layout).
 * 2. Reading state (search query, page number) from the URL search parameters.
 * 3. Fetching the initial set of products data based on the current state.
 * 4. Using `Suspense` to stream a loading skeleton while data is fetched.
 * 5. Passing the fetched data to the interactive `ProductDataTable` client component.
 *
 * @param {object} props - The component props.
 * @param {object} [props.searchParams] - The URL search parameters provided by Next.js.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered product management page.
 */
// TODO: Add a `try...catch` block around the `fetchAdminProducts` call to gracefully handle potential API errors and display an error UI.
// TODO: This page should be secured to ensure only users with an 'admin' role can access it. This check is likely handled in the parent `(admin)/layout.tsx`, but verifying is critical.
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: { searchQuery?: string; page?: string };
}) {
  /**
   * Reads the 'searchQuery' and 'page' from the URL search parameters,
   * providing empty or default values if they are not present.
   */
  const query = searchParams?.searchQuery || "";
  const currentPage = Number(searchParams?.page) || 1;

  /**
   * Fetches the products data on the server based on the current search and pagination state.
   * The `Suspense` boundary will be active during this asynchronous operation.
   */
  const productsData = await fetchAdminProducts({
    searchQuery: query,
    page: currentPage,
    limit: 10, // Defines the number of items per page.
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Product Management</h1>
      {/*
       * The `Suspense` boundary allows the UI to be streamed to the client.
       * The `TableSkeleton` fallback is shown immediately, while the server
       * fetches the data needed by the `ProductDataTable` component.
       */}
      <Suspense fallback={<TableSkeleton />}>
        <ProductDataTable initialData={productsData} />
      </Suspense>
    </div>
  );
}
