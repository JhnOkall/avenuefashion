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
import { removeCartItem, updateCartItem } from "@/lib/data";

/**
 * Formats a number into a currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted price string (e.g., "Ksh 1,234.56").
 */
// TODO: Move this formatter to a shared `utils/formatters.ts` file to promote reusability.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * Renders a quantity input control with buttons to increment and decrement.
 * @param {object} props - The component props.
 * @param {ICartItem} props.item - The cart item whose quantity is being controlled.
 * @param {(id: string, qty: number) => void} props.onUpdate - Callback function to handle quantity updates.
 */
const QuantityInput = ({
  item,
  onUpdate,
}: {
  item: ICartItem;
  onUpdate: (id: string, qty: number) => void;
}) => {
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
 * @param {object} props - The component props.
 * @param {ICartItem} props.item - The cart item to display.
 * @param {(id: string, qty: number) => void} props.onUpdate - Callback for quantity changes.
 * @param {(id: string) => void} props.onRemove - Callback for removing the item.
 */
const CartItemCard = ({
  item,
  onUpdate,
  onRemove,
}: {
  item: ICartItem;
  onUpdate: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) => {
  // The product field can be either a populated object or just an ObjectId string.
  // This check safely accesses the slug only when the product is fully populated.
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
                {/* TODO: Implement 'Add to Favorites' functionality. This will likely involve a mutation to update the user's favorites list. */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 text-sm font-medium text-muted-foreground hover:text-foreground"
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
 * Renders a card displaying the order summary, including subtotal, tax, and total.
 * @param {object} props - The component props.
 * @param {ICart | null} props.cart - The current cart object.
 */
const OrderSummaryCard = ({ cart }: { cart: ICart | null }) => {
  const router = useRouter();
  const subtotal =
    cart?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;
  // TODO: Replace this hardcoded tax calculation with a value from the API or a central configuration.
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  const handleCheckout = () => {
    // TODO: Implement navigation to the checkout page.
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
 * It handles user interactions for updating quantities and removing items.
 *
 * @param {ShoppingCartClientProps} props - The component props.
 */
// TODO: Refactor this component to use the `useCart` hook from `CartContext`.
// This would eliminate the need for the `initialCart` prop and `router.refresh()`,
// enabling a smoother user experience with optimistic updates managed by the context.
export const ShoppingCartClient = ({
  initialCart,
}: // recommendedProducts,
ShoppingCartClientProps) => {
  const router = useRouter();
  // `useTransition` provides a pending state to give visual feedback during server actions.
  const [isPending, startTransition] = useTransition();

  /**
   * Handles updating the quantity of a cart item or removing it if quantity is zero.
   */
  const handleUpdate = (productId: string, quantity: number) => {
    startTransition(async () => {
      try {
        if (quantity <= 0) {
          await removeCartItem(productId);
          toast.success("Item removed from cart.");
        } else {
          await updateCartItem(productId, quantity);
        }
        // Refreshes the server components on the page to reflect the updated cart state.
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
              {/* TODO: Implement a `VoucherCard` component for applying discount codes. */}
            </div>
          </div>
        </div>
        {/* TODO: Implement the "Recommended Products" section using the `recommendedProducts` prop. */}
      </div>
    </section>
  );
};
