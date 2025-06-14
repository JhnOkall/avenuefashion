import { auth } from "@/auth";
import { getCart, fetchMyAddresses, fetchCountries } from "@/lib/data";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutClient } from "@/components/checkoutClient";

/**
 * A skeleton loader for the checkout page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial data (cart, addresses, countries).
 * This improves the user's perceived performance and prevents layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the checkout page.
 */
const CheckoutSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0 lg:flex lg:gap-12">
      <div className="flex-1 space-y-8">
        {/* Skeleton for the Delivery Details card */}
        <Skeleton className="h-64 w-full" />
        {/* Skeleton for the Payment Method card */}
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="mt-6 w-full lg:mt-0 lg:max-w-xs xl:max-w-md">
        {/* Skeleton for the Order Summary card */}
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  </section>
);

/**
 * The main page component for the checkout process.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route by ensuring a user is authenticated.
 * 2. Verifying that the user has items in their cart before proceeding.
 * 3. Fetching all necessary initial data (cart, addresses, countries) on the server.
 * 4. Using `Suspense` to stream a loading skeleton while data is fetched.
 * 5. Passing the fetched data to the interactive `CheckoutClient` component.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered checkout page.
 */
// TODO: Add a `try...catch` block around the `Promise.all` call to gracefully handle potential API errors and render a user-friendly error message.
export default async function CheckoutPage() {
  /**
   * Fetches the current user's session. This is a critical security step.
   * If no user is authenticated, they are redirected to the sign-in page.
   * The `callbackUrl` ensures they are returned to the checkout page after logging in.
   */
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/checkout");
  }

  /**
   * Fetches the user's cart, saved addresses, and available countries concurrently.
   * `Promise.all` is used for efficiency, allowing all network requests to happen in parallel.
   */
  const [cart, addresses, countries] = await Promise.all([
    getCart(),
    fetchMyAddresses(),
    fetchCountries(),
  ]);

  /**
   * A critical validation check. If the user's cart is empty or does not exist,
   * they should not be on the checkout page. They are redirected back to their cart.
   */
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `CheckoutSkeleton`
    // fallback is shown immediately while the server awaits the data fetching promises.
    <Suspense fallback={<CheckoutSkeleton />}>
      {/*
       * The `CheckoutClient` component receives all necessary server-fetched data as props.
       * It is responsible for handling the interactive form, dynamic location fetching,
       * and the final order submission.
       */}
      <CheckoutClient
        user={session.user}
        cart={cart}
        addresses={addresses}
        countries={countries}
      />
    </Suspense>
  );
}
