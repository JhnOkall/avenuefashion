import { Suspense } from "react";
import { fetchAdminUsers } from "@/lib/data";
import { UserDataTable } from "@/components/admin/user-table/UserDataTable";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the user data table.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial user data. This improves
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
    </div>
    {/* Skeleton for the main table content */}
    <Skeleton className="h-[500px] w-full" />
    {/* Skeleton for the pagination controls */}
    <div className="flex items-center justify-end gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

/**
 * The main page component for the administrator's user management interface.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route (typically via a parent layout).
 * 2. Reading state (search query, page number) from the URL search parameters.
 * 3. Fetching the initial set of user data based on the current state.
 * 4. Using `Suspense` to stream a loading skeleton while data is fetched.
 * 5. Passing the fetched data to the interactive `UserDataTable` client component.
 *
 * @param {object} props - The component props.
 * @param {Promise<object>} [props.searchParams] - The URL search parameters provided by Next.js.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered user management page.
 */
// TODO: This page should be secured to ensure only users with an 'admin' role can access it. This check is likely handled in the parent `(admin)/layout.tsx`, but verifying its presence is critical.
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ searchQuery?: string; page?: string }>;
}) {
  /**
   * Reads the 'searchQuery' and 'page' from the URL search parameters,
   * providing empty or default values if they are not present.
   */
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.searchQuery || "";
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  /**
   * Fetches the user data on the server based on the current search and pagination state.
   * The `Suspense` boundary will be active during this asynchronous operation.
   */
  // TODO: Add a `try...catch` block to gracefully handle potential API errors (e.g., database connection issues) and render an error UI.
  const usersData = await fetchAdminUsers({
    searchQuery: query,
    page: currentPage,
    limit: 10, // Defines the number of items per page.
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">User Management</h1>
      {/*
       * The `Suspense` boundary allows the UI to be streamed to the client.
       * The `TableSkeleton` fallback is shown immediately, while the server
       * fetches the data needed by the `UserDataTable` component.
       */}
      <Suspense fallback={<TableSkeleton />}>
        <UserDataTable initialData={usersData} />
      </Suspense>
    </div>
  );
}
