"use client";

import React, { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart as ShoppingCartIcon,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ICart, ICartItem, IProduct } from "@/types";
// FIX: Import the new addToFavourites function
import { removeCartItem, updateCartItem, addToFavourites } from "@/lib/data";

/**
 * Formats a number into a currency string.
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * Renders a quantity input control with buttons to increment and decrement.
 */
const QuantityInput = ({
  item,
  onUpdate,
}: {
  item: ICartItem;
  onUpdate: (id: string, qty: number) => void;
}) => {
  // ... (component code remains the same)
  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        onClick={() => onUpdate(item.product._id.toString(), item.quantity - 1)}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="text"
        value={item.quantity}
        className="h-6 w-10 border-0 bg-transparent text-center focus-visible:ring-0"
        readOnly
        aria-label="Current quantity"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        onClick={() => onUpdate(item.product._id.toString(), item.quantity + 1)}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

/**
 * Renders a card displaying details for a single item in the shopping cart.
 */
const CartItemCard = ({
  item,
  onUpdate,
  onRemove,
  onAddToFavourites, // FIX: Add new prop for the handler
}: {
  item: ICartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onAddToFavourites: (id: string) => void; // FIX: Add new prop type
}) => {
  const productSlug =
    typeof item.product === "object" && "slug" in item.product
      ? (item.product as IProduct).slug
      : "";

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:gap-6 md:space-y-0">
          <div className="flex items-center gap-4">
            <Link
              href={productSlug ? `/${productSlug}` : "#"}
              className="relative h-20 w-20 shrink-0"
            >
              <Image
                className="object-contain"
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 80px"
              />
            </Link>
            <div className="min-w-0 flex-1 space-y-3">
              <Link
                href={productSlug ? `/${productSlug}` : "#"}
                className="text-base font-medium text-foreground hover:underline"
              >
                {item.name}
              </Link>
              <div className="flex items-center gap-4">
                {/* FIX: Implement 'Add to Favorites' functionality */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => onAddToFavourites(item.product._id.toString())}
                >
                  <Heart className="mr-1.5 h-5 w-5" /> Add to Favorites
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 text-sm font-medium text-destructive hover:text-destructive/90"
                  onClick={() => onRemove(item.product._id.toString())}
                >
                  <Trash2 className="mr-1.5 h-5 w-5" /> Remove
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end md:gap-6">
            <QuantityInput item={item} onUpdate={onUpdate} />
            <div className="w-32 text-right">
              <p className="text-lg font-bold text-foreground">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Renders a card displaying the order summary.
 */
const OrderSummaryCard = ({ cart }: { cart: ICart | null }) => {
  // ... (component code remains the same)
  const router = useRouter();
  const subtotal =
    cart?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </dl>
        <dl className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Tax (16% VAT)</dt>
          <dd className="font-medium">{formatPrice(tax)}</dd>
        </dl>
        <Separator />
        <dl className="flex items-center justify-between gap-4">
          <dt className="text-lg font-bold">Total</dt>
          <dd className="text-lg font-bold">{formatPrice(total)}</dd>
        </dl>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-3">
        <Button
          size="lg"
          className="w-full"
          disabled={!cart || cart.items.length === 0}
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </Button>
        <Button variant="link" asChild>
          <Link href="/">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

interface ShoppingCartClientProps {
  initialCart: ICart | null;
  recommendedProducts: IProduct[];
}

/**
 * A client component that renders the main shopping cart interface.
 */
export const ShoppingCartClient = ({
  initialCart,
}: ShoppingCartClientProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /**
   * Handles updating the quantity of a cart item.
   */
  const handleUpdate = (productId: string, quantity: number) => {
    // ... (function code remains the same)
    startTransition(async () => {
      try {
        if (quantity <= 0) {
          await removeCartItem(productId);
          toast.success("Item removed from cart.");
        } else {
          await updateCartItem(productId, quantity);
        }
        router.refresh();
      } catch (error: any) {
        toast.error("Error updating cart", {
          description: error.message || "Could not update the item quantity.",
        });
      }
    });
  };

  /**
   * Handles removing a cart item completely.
   */
  const handleRemove = (productId: string) => {
    // ... (function code remains the same)
    startTransition(async () => {
      try {
        await removeCartItem(productId);
        toast.success("Item removed from cart.");
        router.refresh();
      } catch (error: any) {
        toast.error("Error removing item", {
          description: error.message || "Could not remove the item from cart.",
        });
      }
    });
  };

  /**
   * FIX: Handles adding a product to the user's favorites list.
   */
  const handleAddToFavourites = (productId: string) => {
    startTransition(async () => {
      try {
        await addToFavourites(productId);
        toast.success("Added to Favorites", {
          description:
            "The item has been successfully added to your favorites.",
        });
        // Note: No router.refresh() is needed here unless you want to
        // visually change the button state (e.g., to a filled heart),
        // which would require more complex state management.
      } catch (error: any) {
        toast.error("Failed to Add", {
          description: error.message || "Could not add the item to favorites.",
        });
      }
    });
  };

  const hasItems = initialCart && initialCart.items.length > 0;

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          Shopping Cart
        </h2>
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="w-full flex-none lg:max-w-2xl xl:max-w-4xl">
            {hasItems ? (
              <div className="space-y-6">
                {initialCart.items.map((item) => (
                  <CartItemCard
                    key={item.product._id.toString()}
                    item={item}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                    onAddToFavourites={handleAddToFavourites} // FIX: Pass the new handler
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
                <ShoppingCartIcon className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  Your cart is empty
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>
            )}
          </div>
          <div className="mx-auto mt-6 max-w-4xl lg:mt-0 lg:w-full">
            <div
              className="space-y-6 transition-opacity"
              style={{ opacity: isPending ? 0.7 : 1 }}
            >
              <OrderSummaryCard cart={initialCart} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
