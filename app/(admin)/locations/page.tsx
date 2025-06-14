import { Suspense } from "react";
import {
  fetchAdminCountries,
  fetchAdminCounties,
  fetchAdminCities,
} from "@/lib/data";
import { LocationsManager } from "@/components/admin/LocationsManager";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the location management page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial location data. This improves
 * the user's perceived performance and prevents content layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the locations manager.
 */
const LocationSkeleton = () => (
  <div className="space-y-6">
    {/* Skeleton for the TabsList */}
    <Skeleton className="h-10 w-full" />
    <div className="rounded-md border">
      {/* Skeleton for the Table Header */}
      <div className="flex justify-between p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      {/* Skeleton for the Table Body rows */}
      <div className="space-y-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

/**
 * The main page component for the administrator's location management interface.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route (typically via a layout).
 * 2. Fetching all necessary initial location data (countries, counties, cities) on the server.
 * 3. Using `Suspense` to stream a loading skeleton while the data is being fetched.
 * 4. Passing the fetched data to the interactive `LocationsManager` client component.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered location management page.
 */
// TODO: This page should be secured to ensure only users with an 'admin' role can access it. This check is likely handled in the parent `layout.tsx`, but verifying is critical.
export default async function AdminLocationsPage() {
  // Concurrently fetch all location data for the initial render.
  // This is an efficient pattern for a small to medium number of locations.
  // TODO: Add a `try...catch` block to gracefully handle potential errors during this data fetching process.
  // TODO: For applications with a very large number of locations, fetching all counties and cities at once can be inefficient. Consider refactoring to only fetch countries initially, then load counties/cities on-demand within the client component.
  const [countries, counties, cities] = await Promise.all([
    fetchAdminCountries(),
    fetchAdminCounties(),
    fetchAdminCities(),
  ]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Location Management</h1>
      <p className="mb-6 text-muted-foreground">
        Manage countries, counties, and cities for shipping and delivery
        options.
      </p>
      {/*
       * The `Suspense` boundary allows the UI to be streamed to the client.
       * The `LocationSkeleton` fallback is shown immediately, while the server
       * fetches the data needed by the `LocationsManager` component.
       */}
      <Suspense fallback={<LocationSkeleton />}>
        <LocationsManager
          initialCountries={countries}
          initialCounties={counties}
          initialCities={cities}
        />
      </Suspense>
    </div>
  );
}
