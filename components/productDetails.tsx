"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart, Minus, Plus, Share } from "lucide-react"; // 1. Import Share icon
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { IProduct } from "@/types";
import { addToCart, addToFavourites } from "@/lib/data";

/**
 * Formats a number into a currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted price string (e.g., "Ksh 1,234.56").
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * A reusable, read-only component for displaying a star rating.
 * @param {object} props - The component props.
 */
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
 * A component for selecting the quantity of a product.
 * @param {object} props - The component props.
 * @param {number} props.quantity - The current quantity value.
 * @param {React.Dispatch<React.SetStateAction<number>>} props.setQuantity - The state setter for the quantity.
 */
const QuantitySelector = ({
  quantity,
  setQuantity,
}: {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
}) => (
  <div className="flex items-center">
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9"
      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
      disabled={quantity <= 1}
      aria-label="Decrease quantity"
    >
      <Minus className="h-4 w-4" />
    </Button>
    <Input
      type="text"
      value={quantity}
      readOnly
      className="h-9 w-14 border-0 bg-transparent text-center text-lg font-medium focus-visible:ring-0"
      aria-label="Current quantity"
    />
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9"
      onClick={() => setQuantity((prev) => prev + 1)}
      aria-label="Increase quantity"
    >
      <Plus className="h-4 w-4" />
    </Button>
  </div>
);

// =================================================================
// MAIN COMPONENT
// =================================================================

/**
 * A client component responsible for rendering the main details of a single product,
 * including its image, name, price, rating, and interactive action buttons.
 */
export const ProductDetails = ({ product }: { product: IProduct }) => {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  /**
   * Handles adding the selected quantity of the product to the shopping cart.
   */
  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        await addToCart(product._id.toString(), quantity);
        toast.success("Added to Cart", {
          description: `${quantity} x ${product.name} added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => (window.location.href = "/cart"),
          },
        });
      } catch (error: any) {
        toast.error("Failed to Add", {
          description:
            error.message || "There was an issue adding the item to your cart.",
        });
      }
    });
  };

  /**
   * Handles adding the product to the user's favorites list.
   */
  const handleAddToFavourites = () => {
    startTransition(async () => {
      try {
        await addToFavourites(product._id.toString());
        toast.success("Added to Favorites", {
          description: `${product.name} has been added to your favorites.`,
        });
      } catch (error: any) {
        toast.error("Failed to Add", {
          description:
            error.message || "Could not add the item to your favorites.",
        });
      }
    });
  };

  /**
   * 2. Handles sharing the product using the Web Share API with a fallback.
   */
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at Avenue Fashion!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User might have cancelled the share. We can ignore this error.
        console.log("Share was cancelled or failed", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link Copied!", {
          description: "The product link has been copied to your clipboard.",
        });
      } catch (error) {
        toast.error("Failed to Copy", {
          description: "Could not copy the link to your clipboard.",
        });
      }
    }
  };

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Product Image Section */}
          <div className="shrink-0">
            {/* TODO: Enhance this to be an image gallery carousel if product.images is implemented. */}
            <div className="relative mx-auto h-96 max-w-md lg:max-w-lg rounded-lg">
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
                <Link href="#reviews" className="hover:underline">
                  <p className="text-sm font-medium text-muted-foreground">
                    {product.numReviews} Reviews
                  </p>
                </Link>
              </div>
            </div>

            <Separator className="my-6 md:my-8" />

            {/* Action Buttons & Quantity */}
            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isPending ? "Adding..." : "Add to cart"}
              </Button>
            </div>

            {/* 3. Secondary Actions: Favorites and Share */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToFavourites}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                <Heart className="mr-2 h-5 w-5" />
                Add to favorites
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="w-full sm:w-auto"
                aria-label="Share this product"
              >
                <Share className="mr-2 h-5 w-5" />
                Share
              </Button>
            </div>

            <Separator className="my-6 md:my-8" />

            {/* Product Description */}
            <div className="space-y-4 text-muted-foreground">
              {product.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
