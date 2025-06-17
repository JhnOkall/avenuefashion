"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Star, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IProduct } from "@/types";
import { addToCart, removeFromFavourites } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Formats a numeric price into a localized currency string.
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
  product: IProduct;
}

/**
 * A reusable card component to display a product's summary information.
 * It intelligently handles simple vs. variable products for the "Add to Cart" action.
 */
const ProductCard = ({ product }: ProductCardProps) => {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const isFavouritesPage = pathname === "/me/favourites";
  const hasVariations = product.variants && product.variants.length > 0;

  // Check total stock availability
  const isOutOfStock = hasVariations
    ? product.variants?.every((v) => v.stock <= 0) ?? true
    : (product.stock ?? 0) <= 0;

  const handleAddToCart = () => {
    // If the product has variations, navigate to the product page instead of adding to cart.
    if (hasVariations) {
      router.push(`/${product.slug}`);
      return;
    }

    startTransition(async () => {
      try {
        await addToCart(product._id.toString(), 1);
        toast.success("Added to Cart", {
          description: `${product.name} has been added to your cart.`,
          action: { label: "View Cart", onClick: () => router.push("/cart") },
        });
      } catch (error: any) {
        toast.error("Failed to Add", {
          description: error.message || "Could not add item to cart.",
        });
      }
    });
  };

  const handleRemoveFromFavourites = () => {
    startTransition(async () => {
      try {
        await removeFromFavourites(product._id.toString());
        toast.success("Removed from Favourites");
        router.refresh();
      } catch (error: any) {
        toast.error("Failed to Remove", {
          description: error.message || "Could not remove item.",
        });
      }
    });
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0">
      <div className="relative h-48 w-full sm:h-56">
        {product.discount && product.discount > 0 && (
          <Badge
            variant="destructive"
            className="absolute left-2 top-2 z-10 sm:left-4 sm:top-4"
          >
            {product.discount}% OFF
          </Badge>
        )}
        <Link href={`/${product.slug}`}>
          <Image
            src={product.images[0] ?? "/placeholder.svg"}
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
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted stroke-muted-foreground"
                )}
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

      <CardFooter className="flex flex-col items-start gap-2 p-2 pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4 sm:pt-0">
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

        {isFavouritesPage ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveFromFavourites}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Trash2 className="-ms-1 mr-1 h-4 w-4 sm:-ms-2 sm:mr-2 sm:h-5 sm:w-5" />
            {isPending ? "Removing..." : "Remove"}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isPending || isOutOfStock}
            className="w-full sm:w-auto"
          >
            {isOutOfStock ? (
              "Out of Stock"
            ) : hasVariations ? (
              <>
                Select Options
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                <ShoppingCart className="-ms-1 mr-1 h-4 w-4 sm:-ms-2 sm:mr-2 sm:h-5 sm:w-5" />
                {isPending ? "Adding..." : "Add to cart"}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
