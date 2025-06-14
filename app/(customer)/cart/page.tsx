import { ShoppingCartClient } from "@/components/ShoppingCartClient";
import { fetchProducts, getCart } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * A skeleton loader for the shopping cart page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the initial cart and product data. This
 * improves the user's perceived performance and prevents content layout shifts.
 *
 * @returns {JSX.Element} A skeleton layout of the shopping cart page.
 */
const CartPageSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
      {/* Skeleton for the page title */}
      <Skeleton className="mb-8 h-8 w-48" />
      <div className="lg:flex lg:items-start lg:gap-8">
        <div className="w-full flex-none lg:max-w-2xl xl:max-w-4xl">
          {/* Skeleton for cart item cards */}
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <div className="mt-6 w-full lg:mt-0">
          {/* Skeleton for the order summary card */}
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  </section>
);

/**
 * The main page component for the user's shopping cart.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Fetching the initial state of the user's cart (which can be for an authenticated user or a guest).
 * 2. Fetching a list of recommended products to display on the page.
 * 3. Using `Suspense` to stream a loading skeleton while the data is being fetched.
 * 4. Passing the fetched data to the interactive `ShoppingCartClient` component.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered shopping cart page.
 */
// TODO: Add a `try...catch` block around the `Promise.all` call to gracefully handle potential API errors and render a user-friendly error message.
export default async function CartPage() {
  /**
   * Fetches the user's cart and a list of recommended products concurrently.
   * `Promise.all` is used for efficiency, allowing both network requests to happen in parallel.
   */
  const [initialCart, recommendedProductsData] = await Promise.all([
    getCart(),
    fetchProducts({ limit: 4 }), // Fetch 4 recommended products.
  ]);

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `CartPageSkeleton`
    // fallback is shown immediately while the server awaits the data fetching promises.
    <Suspense fallback={<CartPageSkeleton />}>
      {/*
       * The `ShoppingCartClient` component receives the server-fetched data as props.
       * It is responsible for handling user interactions like updating item quantities
       * or removing items from the cart.
       */}
      <ShoppingCartClient
        initialCart={initialCart}
        recommendedProducts={recommendedProductsData.data}
      />
    </Suspense>
  );
}
