import ProductGrid from "@/components/ProductGrid";
import { fetchProducts } from "@/lib/data";

/**
 * The main homepage for the e-commerce application.
 *
 * As a React Server Component (RSC), this page is responsible for fetching the
 * initial data required for the first-paint of the product listing. This approach
 * ensures a fast initial page load and makes the content crawlable for search
 * engines, which is crucial for SEO.
 *
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered homepage.
 */
// TODO: Enhance the homepage by adding other sections like a hero banner, featured categories, or promotional carousels to improve user engagement.
export default async function Page() {
  /**
   * Fetches the first page of products on the server. This data is used to
   * hydrate the `ProductGrid` client component, providing an immediate,
   * non-interactive view while the client-side JavaScript loads.
   */
  // TODO: Implement a `try...catch` block to handle potential errors during the initial data fetch and render an appropriate error UI.
  const initialProductData = await fetchProducts({ page: 1, limit: 8 });

  return (
    <ProductGrid
      // Provides the initial set of products for the first render.
      initialProducts={initialProductData.data}
      // Provides the total page count to the client component for its "Show More" pagination logic.
      initialTotalPages={initialProductData.totalPages}
    />
  );
}
