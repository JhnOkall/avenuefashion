import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/components/user/UserProfile";
import { fetchMyAddresses, fetchMyOrders, fetchMyReviews } from "@/lib/data";

/**
 * A skeleton loader for the main user profile page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching all the necessary user data. This improves
 * the user's perceived performance and prevents content layout shifts (CLS).
 *
 * @returns {JSX.Element} A skeleton layout of the user profile page.
 */
const ProfilePageSkeleton = () => (
  <div className="mx-auto max-w-screen-lg px-4 py-8 2xl:px-0">
    {/* Skeleton for the page title */}
    <Skeleton className="mb-6 h-8 w-48" />
    {/* Skeleton for the stats cards */}
    <div className="grid grid-cols-2 gap-6 border-y py-8 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
    {/* Skeleton for the user details section */}
    <div className="py-8">
      <Skeleton className="h-40 w-full" />
    </div>
    {/* Skeleton for the latest orders section */}
    <Skeleton className="h-96 w-full" />
  </div>
);

/**
 * The main page component for the user's profile dashboard.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route by ensuring a user is authenticated.
 * 2. Fetching all necessary user-specific data (orders, addresses, review counts) on the server.
 * 3. Using `Suspense` to stream a loading skeleton while the data is being fetched.
 * 4. Passing the aggregated data to the `UserProfile` client component for rendering.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered user profile page.
 */
export default async function MyAccountPage() {
  /**
   * Fetches the current user's session. This is a critical security step.
   * If no user is authenticated, they are redirected to the sign-in page.
   * The `callbackUrl` ensures they are returned to this page after logging in.
   */
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/me");
  }

  /**
   * Fetches all necessary data for the dashboard in parallel to optimize load times.
   * The API routes are protected, ensuring these calls are secure and context-aware.
   */
  // TODO: Add a `try...catch` block to gracefully handle potential API errors during this data fetching process.
  const [ordersData, addresses, reviewsData] = await Promise.all([
    // Fetches the 3 most recent orders for the "Latest Orders" preview.
    fetchMyOrders({ limit: 3 }),
    // Fetches all saved addresses for the user details section.
    fetchMyAddresses(),
    // Fetches with a limit of 1 as an optimization to get the `totalReviews` count without retrieving all review data.
    fetchMyReviews({ limit: 1 }),
  ]);

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `ProfilePageSkeleton`
    // fallback is shown immediately while the server awaits the data fetching promises.
    <Suspense fallback={<ProfilePageSkeleton />}>
      {/*
       * The `UserProfile` client component receives all the server-fetched data as props
       * and is responsible for rendering the complete dashboard UI.
       */}
      <UserProfile
        user={session.user}
        orders={ordersData.data}
        addresses={addresses}
        orderCount={ordersData.totalOrders}
        reviewCount={reviewsData.totalReviews}
      />
    </Suspense>
  );
}
