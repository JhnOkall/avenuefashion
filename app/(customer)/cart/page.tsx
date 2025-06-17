import { ShoppingCartClient } from "@/components/ShoppingCartClient";
import { fetchProducts, getCart } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

/**
 * A skeleton loader for the shopping cart page.
 */
const CartPageSkeleton = () => (
  <section className="bg-background py-8 md:py-16">
    <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
      <Skeleton className="mb-8 h-8 w-48" />
      <div className="lg:flex lg:items-start lg:gap-8">
        <div className="w-full flex-none lg:max-w-2xl xl:max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <div className="mt-6 w-full lg:mt-0">
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
 * 1. Fetching the initial state of the user's cart (which correctly handles variants).
 * 2. Fetching a list of recommended products.
 * 3. Handling potential data fetching errors gracefully.
 * 4. Using `Suspense` to stream a loading skeleton.
 * 5. Passing the fetched data to the interactive `ShoppingCartClient` component.
 */
export default async function CartPage() {
  try {
    /**
     * Fetches the user's cart and a list of recommended products concurrently.
     * The `getCart()` function is already variant-aware and will fetch all necessary details.
     */
    const [initialCart, recommendedProductsData] = await Promise.all([
      getCart(),
      fetchProducts({ limit: 4 }), // Fetch 4 recommended products.
    ]);

    return (
      <Suspense fallback={<CartPageSkeleton />}>
        {/*
         * The `ShoppingCartClient` component receives the server-fetched data.
         * It is already designed to render variant options and handle variant-specific actions.
         */}
        <ShoppingCartClient
          initialCart={initialCart}
          /* recommendedProducts={recommendedProductsData.data} */
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to load cart page data:", error);
    // Render a user-friendly error state if data fetching fails
    return (
      <section className="bg-background py-8 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading Cart</AlertTitle>
            <AlertDescription>
              We couldn't load your shopping cart at this time. Please try
              refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
}
