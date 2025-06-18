import { Suspense } from "react";
import { fetchAdminOrders } from "@/lib/data";
import { OrderDataTable } from "@/components/admin/order-table/OrderDataTable";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the orders data table.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial orders data. This improves
 * the user's perceived performance and prevents content layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the data table and its controls.
 */
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      {/* Skeletons for the filter dropdowns */}
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-48" />
    </div>
    <Skeleton className="h-[600px] w-full" />
    <div className="flex items-center justify-end gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

/**
 * The main page component for the administrator's order management interface.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route (typically via a parent layout).
 * 2. Reading state (filters, page number) from the URL search parameters.
 * 3. Fetching the initial set of orders data based on the current state.
 * 4. Using `Suspense` to stream a loading skeleton while data is fetched.
 * 5. Passing the fetched data to the interactive `OrderDataTable` client component.
 *
 * @param {object} props - The component props.
 * @param {Promise<object>} [props.searchParams] - The URL search parameters provided by Next.js.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered order management page.
 */
// TODO: Add a `try...catch` block around the `fetchAdminOrders` call to gracefully handle potential API errors.
export default async function AdminOrdersPage({
  searchParams,
}: {
  // --- FIX: Updated the type to expect the new filter parameters ---
  searchParams?: {
    deliveryStatus?: string;
    paymentStatus?: string;
    page?: string;
  };
}) {
  // --- FIX: Read both delivery and payment status from searchParams ---
  const deliveryStatus = searchParams?.deliveryStatus || "all";
  const paymentStatus = searchParams?.paymentStatus || "all";
  const currentPage = Number(searchParams?.page) || 1;

  /**
   * Fetches the orders data on the server based on the current filters and pagination.
   */
  // --- FIX: Call fetchAdminOrders with the correct property names ---
  const ordersData = await fetchAdminOrders({
    deliveryStatus: deliveryStatus,
    paymentStatus: paymentStatus,
    page: currentPage,
    limit: 10,
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Order Management</h1>
      <Suspense fallback={<TableSkeleton />}>
        <OrderDataTable initialData={ordersData} />
      </Suspense>
    </div>
  );
}
