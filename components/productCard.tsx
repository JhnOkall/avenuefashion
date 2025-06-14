"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IProduct } from "@/types";

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string (e.g., "Ksh 1,234.56").
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file to ensure consistency and reusability across the application.
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
 * It includes the product image, name, rating, price, and an "Add to cart" button.
 *
 * @param {ProductCardProps} props - The props for the component.
 * @returns {JSX.Element} A product card element.
 */
const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group flex h-full flex-col overflow-hidden">
      <CardHeader className="relative p-0 pt-4">
        {/* Conditionally render a discount badge if a discount is present. */}
        {product.discount && (
          <Badge variant="destructive" className="absolute left-4 top-4 z-10">
            {product.discount}% OFF
          </Badge>
        )}
        {/* TODO: Implement the quick action tooltips (e.g., Quick View, Add to Favorites) that were previously here. */}
        <div className="absolute right-2 top-2 z-10 flex gap-1">
          {/* Example:
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="ghost" size="icon"><Eye/></Button></TooltipTrigger>
              <TooltipContent><p>Quick View</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          */}
        </div>
        <div className="relative h-56 w-full">
          <Link href={`/${product.slug}`}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Link href={`/${product.slug}`}>
          <h3 className="text-lg font-semibold leading-tight text-foreground hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          {/* TODO: This star rating logic is duplicated in other components. Extract it into a reusable `StarRating` component. */}
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
          <p className="text-sm font-medium text-foreground">
            {product.rating.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">
            ({product.numReviews})
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {product.condition}
          </Badge>
          {/* Safely access the brand name, as the `brand` field might be populated or just an ObjectId. */}
          {typeof product.brand === "object" && "name" in product.brand && (
            <Badge variant="secondary">{product.brand.name}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 p-4 pt-0">
        <div className="flex flex-col">
          <p className="text-xl font-extrabold leading-tight text-foreground">
            {formatPrice(product.price)}
          </p>
          {/* Display original price if the item is on sale */}
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </p>
          )}
        </div>
        {/* TODO: Implement the `onClick` handler for this button to add the product to the cart, likely using a shared `CartContext`. */}
        <Button size="sm">
          <ShoppingCart className="-ms-2 mr-2 h-5 w-5" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
