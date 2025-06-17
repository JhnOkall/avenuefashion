import { ProductDetails } from "@/components/productDetails";
import { fetchProductBySlug, fetchReviewsByProduct } from "@/lib/data";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductReviewsClient } from "@/components/productReviews";
import type { Metadata } from "next";

/**
 * A detailed skeleton loader for the product details page.
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
 * Generates dynamic metadata for the product page for SEO.
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
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pageUrl = `${siteUrl}/${product.slug}`;
  const primaryImage = product.images?.[0] || ""; // Use the first image from the array

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: "Avenue Fashion",
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

/**
 * The main page component for displaying a single product's details.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await fetchProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Concurrently fetch reviews ONLY if the product exists.
  const initialReviewsData = await fetchReviewsByProduct(
    product._id.toString(),
    { page: 1, limit: 3 }
  );

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductDetails product={product} />
      <ProductReviewsClient
        product={product}
        initialReviewsData={initialReviewsData}
      />
    </Suspense>
  );
}
