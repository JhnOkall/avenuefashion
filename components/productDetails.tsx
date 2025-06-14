"use client";

import Image from "next/image";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IProduct } from "@/types";

/**
 * A reusable, read-only component for displaying a star rating.
 *
 * @param {object} props - The component props.
 * @param {number} props.rating - The numerical rating value to display.
 * @param {string} [props.className] - Optional additional CSS classes for styling.
 * @returns {JSX.Element} A set of star icons representing the rating.
 */

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

// TODO: This is a duplicated component. It should be extracted into a shared, reusable component
// file (e.g., `components/ui/star-rating.tsx`) to avoid code duplication.
const StarRating = ({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted stroke-muted-foreground"
        }`}
      />
    ))}
  </div>
);

/**
 * A client component responsible for rendering the main details of a single product,
 * including its image, name, price, rating, and description.
 *
 * @param {object} props - The component props.
 * @param {IProduct} props.product - The product object containing details to display.
 * @returns {JSX.Element} The product detail page section.
 */
export const ProductDetails = ({ product }: { product: IProduct }) => {
  // TODO: Add `onClick` handlers and state management for the "Add to cart" and "Add to favorites" buttons.
  // This will likely involve using the `useCart` hook and creating a new hook for favorites.

  // TODO: Add a `QuantitySelector` component to allow users to choose the quantity before adding to the cart.

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Product Image Section */}
          <div className="shrink-0">
            {/* TODO: Enhance this to be an image gallery carousel if `product.images` (array) is implemented instead of a single `product.imageUrl`. */}
            <div className="relative mx-auto h-96 max-w-md lg:max-w-lg">
              <Image
                className="h-full w-full rounded-lg object-contain"
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority // Preload the main product image as it's LCP.
              />
            </div>
          </div>

          {/* Product Information and Actions Section */}
          <div className="mt-6 sm:mt-8 lg:mt-0">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              {product.name}
            </h1>
            <div className="mt-4 sm:flex sm:items-center sm:gap-4">
              <p className="text-2xl font-extrabold text-foreground sm:text-3xl">
                {formatPrice(product.price)}
              </p>
              <div className="mt-2 flex items-center gap-2 sm:mt-0">
                <StarRating rating={product.rating} />
                <p className="text-sm font-medium text-muted-foreground">
                  ({product.rating.toFixed(1)})
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {product.numReviews} Reviews
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-4">
              <Button variant="outline" size="lg">
                <Heart className="mr-2 h-5 w-5" />
                Add to favorites
              </Button>
              <Button size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to cart
              </Button>
            </div>

            <Separator className="my-6 md:my-8" />

            {/* Product Description */}
            <div className="space-y-4 text-muted-foreground">
              {product.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {/* TODO: Add a section to display product features/specifications if available in the `product` object. */}
          </div>
        </div>
      </div>
    </section>
  );
};
