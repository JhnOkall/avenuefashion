import { auth } from "@/auth";
import { MyReviewsList } from "@/components/MyReviewsList";
import { fetchMyReviews } from "@/lib/data";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the "My Reviews" page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial list of reviews. This improves
 * the user's perceived performance and prevents content layout shifts (CLS).
 *
 * @returns {JSX.Element} A skeleton layout of the reviews list page.
 */
const ReviewsPageSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Skeleton for the page title */}
          <Skeleton className="h-8 w-36" />
          {/* Skeleton for the rating filter dropdown */}
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mt-8 space-y-4 divide-y">
          {/* Skeleton for individual review list items */}
          <Skeleton className="h-24 w-full pt-4" />
          <Skeleton className="h-24 w-full pt-4" />
          <Skeleton className="h-24 w-full pt-4" />
        </div>
      </div>
    </div>
  </section>
);

/**
 * The main page component for displaying a user's submitted reviews.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route by ensuring a user is authenticated.
 * 2. Reading filter and pagination state from the URL search parameters.
 * 3. Fetching the initial set of reviews based on the current state.
 * 4. Using `Suspense` to stream a loading skeleton while the data is fetched.
 * 5. Passing the fetched data to the interactive `MyReviewsList` client component.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {Promise<object>} [props.searchParams] - The URL search parameters for filtering and pagination.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered "My Reviews" page.
 */
// TODO: Add a `try...catch` block around the `fetchMyReviews` call to gracefully handle potential API errors.
export default async function MyReviewsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; rating?: string }>;
}) {
  /**
   * Fetches the current user's session. This is a critical security step.
   * If no user is authenticated, they are redirected to the sign-in page.
   * The `callbackUrl` ensures they are returned to this page after logging in.
   */
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/me/reviews");
  }

  /**
   * Reads the 'page' and 'rating' from the URL search parameters, providing
   * sensible defaults if they are not present.
   */
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const ratingFilter = Number(resolvedSearchParams?.rating) || undefined; // Use undefined if no rating is specified.

  /**
   * Fetches the reviews data on the server based on the current filters and pagination.
   * The `Suspense` boundary will be active during this asynchronous operation.
   */
  const reviewsData = await fetchMyReviews({
    page: currentPage,
    rating: ratingFilter,
  });

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `ReviewsPageSkeleton`
    // fallback is shown immediately while the server awaits the data fetching promises.
    <Suspense fallback={<ReviewsPageSkeleton />}>
      {/*
       * The `MyReviewsList` client component receives the server-fetched data as a prop.
       * It is responsible for rendering the list and handling user interactions like
       * changing filters or navigating pages, which it does by updating the URL.
       */}
      <MyReviewsList reviewsData={reviewsData} />
    </Suspense>
  );
}
