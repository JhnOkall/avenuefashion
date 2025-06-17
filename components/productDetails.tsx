"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingCart, Minus, Plus, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IProduct, IProductVariant, IVariationType } from "@/types";
import { addToCart, addToFavourites } from "@/lib/data";
import { cn } from "@/lib/utils";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

// =================================================================
// SUB-COMPONENTS
// =================================================================

const StarRating = ({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-1", className)}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted stroke-muted-foreground"
        )}
      />
    ))}
  </div>
);

const QuantitySelector = ({
  quantity,
  setQuantity,
  stock,
}: {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  stock: number;
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
      onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
      disabled={quantity >= stock}
      aria-label="Increase quantity"
    >
      <Plus className="h-4 w-4" />
    </Button>
  </div>
);

const VariationSelector = ({
  variation,
  selectedOption,
  onOptionChange,
}: {
  variation: IVariationType;
  selectedOption: string;
  onOptionChange: (option: string) => void;
}) => (
  <div>
    <h3 className="text-sm font-medium text-foreground">{variation.name}</h3>
    <RadioGroup
      value={selectedOption}
      onValueChange={onOptionChange}
      className="mt-2 flex flex-wrap gap-2"
    >
      {variation.options.map((option) => (
        <div key={option}>
          <RadioGroupItem
            value={option}
            id={`${variation.name}-${option}`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`${variation.name}-${option}`}
            className="cursor-pointer rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
);

// --- NEW IMAGE GALLERY COMPONENT ---
const ProductImageGallery = ({ images }: { images: string[] }) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  // Update active image if the images array changes (e.g., variant selection)
  useEffect(() => {
    if (images && images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        No Image Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative h-96 w-full overflow-hidden rounded-lg">
        <Image
          src={activeImage}
          alt="Product Image"
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          key={activeImage} // Re-render on image change
        />
      </div>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img) => (
            <button
              key={img}
              onClick={() => setActiveImage(img)}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-md border-2 transition-colors",
                activeImage === img ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={img}
                alt="Product thumbnail"
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

export const ProductDetails = ({ product }: { product: IProduct }) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const hasVariations =
    product.variationSchema && product.variationSchema.length > 0;

  useEffect(() => {
    if (hasVariations) {
      const initialOptions: Record<string, string> = {};
      product.variationSchema!.forEach((v) => {
        if (v.name && v.options.length > 0) {
          initialOptions[v.name] = v.options[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product, hasVariations]);

  const selectedVariant = useMemo<IProductVariant | undefined>(() => {
    if (!hasVariations || Object.keys(selectedOptions).length === 0)
      return undefined;
    return product.variants?.find((variant) => {
      const variantOptionsObject = variant.options as unknown as Record<
        string,
        string
      >;
      return product.variationSchema!.every(
        (schema) =>
          variantOptionsObject[schema.name] === selectedOptions[schema.name]
      );
    });
  }, [selectedOptions, product, hasVariations]);

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;

  // --- DYNAMIC IMAGE LOGIC ---
  // Use variant images if they exist and are not empty, otherwise fall back to main product images.
  const galleryImages =
    selectedVariant?.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.images;

  const isOutOfStock = currentStock < 1;

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const handleOptionChange = (variationName: string, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [variationName]: option }));
  };

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        await addToCart(
          product._id.toString(),
          quantity,
          selectedVariant?._id.toString()
        );
        // **FIX:** Use Object.values for the options object.
        const variantDesc = selectedVariant
          ? `(${Object.values(selectedVariant.options).join(", ")})`
          : "";
        toast.success("Added to Cart", {
          description: `${quantity} x ${product.name} ${variantDesc} added.`,
          action: {
            label: "View Cart",
            onClick: () => router.push("/cart"),
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

  const handleAddToFavourites = () => {
    startTransition(async () => {
      try {
        await addToFavourites(product._id.toString());
        toast.success("Added to Favorites");
      } catch (error: any) {
        toast.error("Failed to Add", {
          description: error.message || "Could not add to favorites.",
        });
      }
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at Avenue Fashion!`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await navigator.clipboard.writeText(shareData.url);
      toast.success("Link Copied!");
    }
  };

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* --- UPDATED IMAGE SECTION --- */}
          <div className="shrink-0">
            <ProductImageGallery images={galleryImages} />
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-0">
            {/* The rest of the component's JSX remains the same */}
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              {product.name}
            </h1>
            <div className="mt-4 sm:flex sm:items-center sm:gap-4">
              <p className="text-2xl font-extrabold text-foreground sm:text-3xl">
                {formatPrice(currentPrice)}
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
            {hasVariations && (
              <div className="space-y-4">
                {product.variationSchema?.map((variation) => (
                  <VariationSelector
                    key={variation.name}
                    variation={variation}
                    selectedOption={selectedOptions[variation.name]}
                    onOptionChange={(option) =>
                      handleOptionChange(variation.name, option)
                    }
                  />
                ))}
                {!selectedVariant &&
                  Object.keys(selectedOptions).length > 0 &&
                  product.variationSchema &&
                  Object.keys(selectedOptions).length ===
                    product.variationSchema.length && (
                    <p className="text-sm text-destructive">
                      This combination is not available.
                    </p>
                  )}
                <Separator className="my-6 md:my-8" />
              </div>
            )}
            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <QuantitySelector
                quantity={quantity}
                setQuantity={setQuantity}
                stock={currentStock}
              />
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  isPending ||
                  isOutOfStock ||
                  (hasVariations && !selectedVariant)
                }
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isPending
                  ? "Adding..."
                  : isOutOfStock
                  ? "Out of Stock"
                  : "Add to cart"}
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToFavourites}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                <Heart className="mr-2 h-5 w-5" /> Add to favorites
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="w-full sm:w-auto"
                aria-label="Share this product"
              >
                <Share className="mr-2 h-5 w-5" /> Share
              </Button>
            </div>
            <Separator className="my-6 md:my-8" />
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
