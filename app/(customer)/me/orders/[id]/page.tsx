import { auth } from "@/auth";
import { OrderTracking } from "@/components/OrderTracking";
import { fetchOrderById } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

/**
 * A skeleton loader for the order details page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the specific order data. This improves
 * the user's perceived performance and prevents content layout shifts (CLS).
 *
 * @returns {JSX.Element} A skeleton layout of the order details page.
 */
const OrderDetailSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
      {/* Skeleton for the page title */}
      <Skeleton className="mb-8 h-8 w-1/2" />
      <div className="lg:flex lg:gap-8">
        <div className="w-full lg:max-w-xl xl:max-w-2xl">
          {/* Skeleton for the order items and summary card */}
          <Skeleton className="h-[40rem] w-full" />
        </div>
        <div className="mt-6 w-full lg:mt-0 lg:w-auto lg:flex-1">
          {/* Skeleton for the order timeline card */}
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  </section>
);

/**
 * Generates dynamic metadata for the order details page.
 * This ensures each order page has a unique and informative title for better
 * user experience and browser history management.
 *
 * @param {object} props - The component props, including URL parameters.
 * @param {object} props.params - The dynamic route parameters.
 * @returns {Promise<Metadata>} A promise that resolves to the metadata object.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order Details for ${resolvedParams.id} | Avenue Fashion`,
    description: `Track and view the details for your order ${resolvedParams.id}.`,
  };
}

/**
 * The main page component for displaying the details of a single customer order.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route to ensure only the authenticated user can view their order.
 * 2. Fetching the specific order data from the backend using its ID.
 * 3. Handling the case where an order is not found by showing a 404 page.
 * 4. Using `Suspense` to stream a loading skeleton while the order data is fetched.
 * 5. Passing the fetched data to the `OrderTracking` client component for rendering.
 *
 * @param {object} props - The component props provided by Next.js dynamic routing.
 * @param {object} props.params - Contains the dynamic route parameters, e.g., `{ id: 'order-id' }`.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered order details page.
 */
// TODO: Add a `try...catch` block around the `fetchOrderById` call to gracefully handle potential API errors.
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /**
   * Fetches the current user's session. This is a critical security step.
   * If no user is authenticated, they are redirected to the sign-in page.
   * The `callbackUrl` ensures they are returned to this specific order page after logging in.
   */
  const session = await auth();
  const resolvedParams = await params;
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/me/orders/${resolvedParams.id}`);
  }

  /**
   * Fetches the specific order on the server. The underlying API route is
   * responsible for ensuring that a user can only fetch their own order,
   * preventing unauthorized access to other users' data.
   */
  const order = await fetchOrderById(resolvedParams.id);

  /**
   * If the `fetchOrderById` call returns null, it means the order either does not
   * exist or does not belong to the currently authenticated user. In either case,
   * `notFound()` is called to render the standard 404 page.
   */
  if (!order) {
    notFound();
  }

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `OrderDetailSkeleton`
    // fallback is shown immediately while the server awaits the order data.
    <Suspense fallback={<OrderDetailSkeleton />}>
      {/*
       * The `OrderTracking` component receives the complete order data as a prop
       * and is responsible for rendering all the visual details.
       */}
      <OrderTracking order={order} />
    </Suspense>
  );
}
