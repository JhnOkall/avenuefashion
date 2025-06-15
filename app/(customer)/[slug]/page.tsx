import { ProductDetails } from "@/components/productDetails";
import { fetchProductBySlug, fetchReviewsByProduct } from "@/lib/data";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviewsClient } from "@/components/productReviews";
import type { Metadata } from "next";

/**
 * A detailed skeleton loader for the product details page.
 *
 * This component provides a structural placeholder that is displayed via a `Suspense`
 * boundary while the server is fetching the necessary product and review data. This
 * improves the user's perceived performance and prevents content layout shifts (CLS).
 *
 * @returns {JSX.Element} A skeleton layout of the product page.
 */
const ProductPageSkeleton = () => (
  <>
    {/* Skeleton for the main product details section */}
    <section className="py-8 md:py-16">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 px-4 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="mt-6 space-y-4 lg:mt-0">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-48" />
          </div>
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </section>
    {/* Skeleton for the product reviews section */}
    <section className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </section>
  </>
);

/**
 * Generates dynamic metadata for the product page based on the product's slug.
 * This is crucial for SEO, ensuring each product page has a unique and descriptive title,
 * description, and other meta tags. It also provides rich Open Graph and Twitter Card
 * data for amazing link previews on social media.
 *
 * @param {object} props - The component props, including URL parameters.
 * @param {object} props.params - The dynamic route parameters.
 * @returns {Promise<Metadata>} A promise that resolves to the metadata object.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await fetchProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  const pageTitle = `${product.name} | Avenue Fashion`;
  const pageDescription =
    product.description[0] || `Shop for ${product.name} at Avenue Fashion.`;
  // NOTE: For production, this should come from an environment variable.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://your-store-domain.com";
  const pageUrl = `${siteUrl}/products/${product.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    // Add canonical URL to avoid duplicate content issues
    alternates: {
      canonical: pageUrl,
    },
    // Open Graph (og:) tags for rich link previews on platforms like Facebook, WhatsApp, etc.
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: "Avenue Fashion",
      images: [
        {
          url: product.imageUrl, // Must be an absolute URL
          width: 800, // Recommended for high-quality previews
          height: 800, // Recommended for high-quality previews
          alt: product.name,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    // Twitter Card tags for rich link previews on Twitter.
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [product.imageUrl], // Must be an absolute URL
    },
  };
}

/**
 * The main page component for displaying a single product's details.
 *
 * As a React Server Component (RSC), this page is responsible for:
 * 1. Fetching the specific product data from the backend using its slug.
 * 2. Handling the case where a product is not found by showing a 404 page.
 * 3. Fetching the initial set of reviews for the product.
 * 4. Using `Suspense` to stream a loading skeleton while data is fetched.
 * 5. Passing the fetched data to client components for interactive rendering.
 *
 * @param {object} props - The component props provided by Next.js dynamic routing.
 * @param {object} props.params - Contains the dynamic route parameters, e.g., `{ slug: 'product-slug' }`.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered product page.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  /**
   * Fetches the main product data and the initial page of reviews concurrently.
   * `Promise.all` is used for efficiency, allowing both network requests to happen in parallel.
   */
  // TODO: Add a try-catch block to gracefully handle potential API errors during data fetching.
  const resolvedParams = await params;
  const [product, initialReviewsData] = await Promise.all([
    fetchProductBySlug(resolvedParams.slug),
    // We optimistically fetch reviews assuming the product exists. The `notFound()` check below handles failures.
    // This is generally safe but relies on `fetchReviewsByProduct` not throwing an error for a non-existent ID.
    fetchReviewsByProduct(resolvedParams.slug, { page: 1, limit: 3 }),
  ]);

  /**
   * If the `fetchProductBySlug` call returns null, it means the product does not exist.
   * `notFound()` is a Next.js function that triggers the rendering of the `not-found.tsx` page.
   */
  if (!product) {
    notFound();
  }

  return (
    // The `Suspense` boundary allows the UI to be streamed. The `ProductPageSkeleton`
    // fallback is shown immediately while the server awaits the data fetching promises.
    <Suspense fallback={<ProductPageSkeleton />}>
      {/* The ProductDetails component is primarily for displaying static product info. */}
      <ProductDetails product={product} />

      {/* The ProductReviewsClient component handles the interactive parts of the reviews section,
          such as submitting a new review and loading more reviews. */}
      <ProductReviewsClient
        product={product}
        initialReviewsData={initialReviewsData}
      />
      {/* TODO: Implement a "Related Products" or "You Might Also Like" section below the reviews
          to improve user engagement and product discovery. This would require a new API endpoint. */}
    </Suspense>
  );
}
