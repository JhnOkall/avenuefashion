import { auth } from "@/auth";
import ProductGrid from "@/components/ProductGrid";
import { fetchMyFavourites } from "@/lib/data";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

/**
 * A placeholder component displayed when the user has not saved any favorite products.
 *
 * @returns {JSX.Element} A message prompting the user to add favorites.
 */
const NoFavorites = () => (
  <div className="flex flex-col items-center justify-center bg-muted py-20 text-center">
    <Heart className="mb-4 h-16 w-16 text-muted-foreground" />
    <h2 className="text-2xl font-semibold">No Favorites Yet</h2>
    <p className="mt-2 text-muted-foreground">
      Click the heart icon on any product to save it here.
    </p>
  </div>
);

/**
 * The main page component for displaying a user's list of favorite products.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Securing the route by ensuring a user is authenticated.
 * 2. Fetching the user's list of favorite products on the server.
 * 3. Conditionally rendering either the grid of favorite products or a placeholder message.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered favorites page.
 */
// TODO: Consider adding a skeleton loader with `Suspense` for a better loading experience, especially if fetching favorites is slow.
// TODO: Add a `try...catch` block around the `fetchMyFavourites` call to gracefully handle potential API errors.
export default async function FavouritesPage() {
  /**
   * Fetches the current user's session to perform an authorization check.
   */
  const session = await auth();

  /**
   * Secure the page: redirect to the sign-in page if the user is not authenticated.
   * The `callbackUrl` ensures they are returned to this page after logging in.
   */
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/me/favourites");
  }

  /**
   * Fetches the user's favorite products on the server.
   */
  const favouriteProducts = await fetchMyFavourites();

  return (
    <div>
      <div className="bg-background py-8">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h1 className="text-3xl font-bold md:text-4xl">Your Favorites</h1>
          <p className="mt-2 text-muted-foreground">
            Products you've saved for later.
          </p>
        </div>
      </div>

      {favouriteProducts && favouriteProducts.length > 0 ? (
        /**
         * If the user has favorite products, render the `ProductGrid` component.
         * The `initialTotalPages` is set to 1 because this view is not paginated,
         * which correctly hides the "Show More" button within the `ProductGrid`.
         */
        <ProductGrid
          initialProducts={favouriteProducts}
          initialTotalPages={1}
        />
      ) : (
        /**
         * If the favorites list is empty, display the `NoFavorites` placeholder
         * component to guide the user.
         */
        <NoFavorites />
      )}
    </div>
  );
}
