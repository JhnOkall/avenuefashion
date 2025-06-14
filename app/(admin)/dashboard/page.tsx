import { auth } from "@/auth";
import { fetchAdminAnalytics } from "@/lib/data";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A detailed skeleton loader for the admin dashboard page.
 *
 * This component provides a structural placeholder that mimics the layout of the
 * actual dashboard. It is displayed via a `Suspense` boundary while the
 * server-side data fetching is in progress, improving the user's perceived
 * performance and preventing content layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the dashboard.
 */
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Skeleton placeholders for the 4 main stat cards */}
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-2/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/5" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-2/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/5" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-2/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/5" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-2/5" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/5" />
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
      {/* Skeleton for the main overview chart */}
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
      {/* Skeleton for the recent sales list */}
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

/**
 * The main page component for the administrator dashboard.
 *
 * This is a React Server Component (RSC) responsible for:
 * 1. Securing the page by checking for an authenticated admin user.
 * 2. Fetching all necessary analytics data on the server.
 * 3. Using `Suspense` to stream a loading skeleton while data is being fetched.
 * 4. Passing the fetched data to a client component for interactive rendering.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered dashboard page.
 */
export default async function AdminDashboardPage() {
  /**
   * Fetches the current user's session to perform an authorization check.
   * This is a critical security measure to ensure only admins can access this page.
   */
  const session = await auth();
  if (session?.user?.role !== "admin") {
    // If the user is not an admin, redirect them to the sign-in page.
    redirect("/api/auth/signin");
  }

  // TODO: Implement a try-catch block to gracefully handle potential errors during data fetching.
  // This could involve rendering an error component or showing a notification.

  /**
   * Fetches the analytics data required for the dashboard. This operation
   * is awaited, and the `Suspense` boundary will be active during this time.
   */
  const analyticsData = await fetchAdminAnalytics();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {/*
       * The `AdminDashboardClient` component receives the server-fetched data as props.
       * It is responsible for rendering the interactive charts and data visualizations.
       */}
      <AdminDashboardClient data={analyticsData} />
    </Suspense>
  );
}
