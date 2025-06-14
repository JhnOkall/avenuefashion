import { Suspense } from "react";
import { fetchAdminVouchers } from "@/lib/data";
import { VoucherDataTable } from "@/components/admin/voucher-table/VoucherDataTable";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the vouchers data table.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial voucher data. This improves
 * the user's perceived performance and prevents content layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the data table.
 */
const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-end">
      {/* Skeleton for the "Create Voucher" button */}
      <Skeleton className="h-10 w-32" />
    </div>
    {/* Skeleton for the main table content */}
    <Skeleton className="h-[400px] w-full" />
  </div>
);

/**
 * The main page component for the administrator's voucher management interface.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route (typically via a parent layout).
 * 2. Fetching the initial set of all voucher data from the backend.
 * 3. Using `Suspense` to stream a loading skeleton while the data is being fetched.
 * 4. Passing the fetched data to the interactive `VoucherDataTable` client component.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered voucher management page.
 */
// TODO: This page should be secured to ensure only users with an 'admin' role can access it. This check is likely handled in the parent `(admin)/layout.tsx`, but verifying its presence is critical.
export default async function AdminVouchersPage() {
  /**
   * Fetches the voucher data on the server. The `Suspense` boundary will be
   * active during this asynchronous operation.
   */
  // TODO: The current implementation fetches all vouchers at once. For scalability, this should be refactored to support server-side pagination (e.g., `fetchAdminVouchers({ page: 1, limit: 10 })`) similar to other admin tables.
  // TODO: Add a `try...catch` block to gracefully handle potential API errors during data fetching and render an error UI if necessary.
  const vouchersData = await fetchAdminVouchers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Voucher Management</h1>
      {/*
       * The `Suspense` boundary allows the UI to be streamed to the client.
       * The `TableSkeleton` fallback is shown immediately, while the server
       * fetches the data needed by the `VoucherDataTable` component.
       */}
      <Suspense fallback={<TableSkeleton />}>
        <VoucherDataTable initialData={vouchersData} />
      </Suspense>
    </div>
  );
}
