import OrderConfirmation from "@/components/OrderConfirmation";
import { fetchOrderById } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the order confirmation page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the final order details. This improves
 * the user's perceived performance and prevents content layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the confirmation page.
 */
const ConfirmationSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-2xl px-4 2xl:px-0">
      <div className="text-center">
        {/* Skeleton for the main heading */}
        <Skeleton className="mx-auto h-8 w-1/2" />
        {/* Skeleton for the subheading/description */}
        <Skeleton className="mx-auto mt-3 h-5 w-3/4" />
      </div>
      {/* Skeleton for the order summary card */}
      <Skeleton className="my-6 h-80 w-full md:my-8" />
      {/* Skeleton for the action buttons */}
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  </section>
);

/**
 * The main page component displayed after a successful checkout.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Retrieving the order ID from the URL search parameters.
 * 2. Validating the presence of the order ID.
 * 3. Fetching the complete order details from the backend.
 * 4. Handling cases where the order is not found (e.g., invalid ID or access denied).
 * 5. Using `Suspense` to stream a loading skeleton while the order data is fetched.
 * 6. Passing the fetched data to the `OrderConfirmation` client component for rendering.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {object} props.searchParams - The URL search parameters.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered success page.
 */
// TODO: Implement a security measure to ensure this page is only accessible immediately after a checkout, perhaps using a one-time session flag, to prevent users from re-visiting old confirmation pages.
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { orderId } = resolvedParams;

  /**
   * Critical validation: If no `orderId` is present in the URL, the page cannot
   * display a confirmation. Redirect the user to the homepage as a fallback.
   */
  if (!orderId) {
    redirect("/");
  }

  let order;
  try {
    /**
     * Fetches the order data on the server. The underlying `fetchOrderById` API
     * call should be secured to ensure a user can only fetch their own order details,
     * even if they know another order's ID.
     */
    order = await fetchOrderById(orderId);
  } catch (error) {
    // If the fetch fails for any reason (e.g., network error, server error),
    // treat it as if the order was not found to avoid exposing internal error details.
    console.error(`Failed to fetch order ${orderId}:`, error);
    notFound();
  }

  /**
   * If the API returns null (e.g., the ID is validly formatted but does not exist,
   * or it belongs to another user and the API enforces ownership), render the
   * standard 404 page. This prevents information leakage.
   */
  if (!order) {
    notFound();
  }

  return (
    <Suspense fallback={<ConfirmationSkeleton />}>
      {/*
       * The `OrderConfirmation` component receives the fetched order data as a prop
       * and is responsible for rendering the final "Thank You" message and summary.
       */}
      <OrderConfirmation order={order} />
    </Suspense>
  );
}
