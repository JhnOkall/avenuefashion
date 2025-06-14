import { auth } from "@/auth";
import { fetchMyOrders } from "@/lib/data";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrdersList } from "@/components/customer/OrdersList";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the "My Orders" page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial list of orders. This improves
 * the user's perceived performance and prevents content layout shifts (CLS).
 *
 * @returns {JSX.Element} A skeleton layout of the orders list page.
 */
const OrdersPageSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
      <div className="mx-auto max-w-5xl">
        <div className="gap-4 sm:flex sm:items-center sm:justify-between">
          {/* Skeleton for the page title */}
          <Skeleton className="h-8 w-36" />
          <div className="mt-6 flex gap-4 sm:mt-0">
            {/* Skeleton for filter dropdowns */}
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {/* Skeleton for individual order cards */}
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    </div>
  </section>
);

/**
 * The main page component for displaying a paginated list of a user's orders.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route by ensuring a user is authenticated.
 * 2. Reading filter and pagination state from the URL search parameters.
 * 3. Fetching the initial set of orders based on the current state.
 * 4. Using `Suspense` to stream a loading skeleton while the data is fetched.
 * 5. Passing the fetched data to the interactive `OrdersList` client component.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {Promise<object>} [props.searchParams] - The URL search parameters for filtering and pagination.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered "My Orders" page.
 */
// TODO: Add a `try...catch` block around the `fetchMyOrders` call to gracefully handle potential API errors and render an error UI if necessary.
export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; status?: string }>;
}) {
  /**
   * Fetches the current user's session. This is a critical security step.
   * If no user is authenticated, they are redirected to the sign-in page.
   * The `callbackUrl` ensures they are returned to this page after logging in.
   */
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/me/orders");
  }

  /**
   * Reads the 'page' and 'status' from the URL search parameters, providing
   * sensible defaults if they are not present.
   */
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const statusFilter = resolvedSearchParams?.status || "all";

  /**
   * Fetches the orders data on the server based on the current filters and pagination.
   * The `Suspense` boundary will be active during this asynchronous operation.
   */
  const ordersData = await fetchMyOrders({
    page: currentPage,
    status: statusFilter,
    limit: 5, // Defines the number of orders to display per page.
  });

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `OrdersPageSkeleton`
    // fallback is shown immediately while the server awaits the data fetching promises.
    <Suspense fallback={<OrdersPageSkeleton />}>
      {/*
       * The `OrdersList` client component receives the server-fetched data as a prop.
       * It is responsible for rendering the list and handling user interactions like
       * changing filters or navigating pages, which it does by updating the URL.
       */}
      <OrdersList ordersData={ordersData} />
    </Suspense>
  );
}
