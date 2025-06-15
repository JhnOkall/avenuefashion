"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IProduct } from "@/types";
import { addToCart } from "@/lib/data";

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string (e.g., "Ksh 1,234.56").
 */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(price);
};

/**
 * Defines the props required by the ProductCard component.
 */
interface ProductCardProps {
  /**
   * The product object containing all necessary details for display.
   */
  product: IProduct;
}

/**
 * A reusable card component to display a product's summary information in a grid or list.
 * It includes the product image, name, rating, price, and an interactive "Add to cart" button.
 *
 * @param {ProductCardProps} props - The props for the component.
 * @returns {JSX.Element} A product card element.
 */
const ProductCard = ({ product }: ProductCardProps) => {
  const [isPending, startTransition] = useTransition();

  /**
   * Handles adding the product to the shopping cart.
   */
  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        await addToCart(product._id.toString(), 1);
        toast.success("Added to Cart", {
          description: `${product.name} has been added to your cart.`,
          action: {
            label: "View Cart",
            onClick: () => (window.location.href = "/cart"),
          },
        });
      } catch (error: any) {
        toast.error("Failed to Add", {
          description:
            error.message || "There was an issue adding this item to the cart.",
        });
      }
    });
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden">
      <div className="relative h-48 w-full sm:h-56">
        {product.discount && (
          <Badge
            variant="destructive"
            className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4"
          >
            {product.discount}% OFF
          </Badge>
        )}
        <Link href={`/${product.slug}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      <CardContent className="flex-1 p-2 sm:p-4">
        <Link href={`/${product.slug}`}>
          <h3 className="truncate text-base font-semibold leading-tight text-foreground hover:underline sm:text-lg">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-foreground sm:text-sm">
            {product.rating.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            ({product.numReviews})
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {product.condition}
          </Badge>
          {typeof product.brand === "object" && "name" in product.brand && (
            <Badge variant="secondary">{product.brand.name}</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-2 pt-0 sm:gap-4 sm:p-4 sm:pt-0">
        <div className="flex flex-col">
          <p className="text-lg font-extrabold leading-tight text-foreground sm:text-xl">
            {formatPrice(product.price)}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-xs text-muted-foreground line-through sm:text-sm">
              {formatPrice(product.originalPrice)}
            </p>
          )}
        </div>
        <Button size="sm" onClick={handleAddToCart} disabled={isPending}>
          <ShoppingCart className="-ms-1 mr-1 h-4 w-4 sm:-ms-2 sm:mr-2 sm:h-5 sm:w-5" />
          {isPending ? "Adding..." : "Add to cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
