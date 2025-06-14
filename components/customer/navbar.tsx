"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Package2,
  ShoppingCart,
  User,
  ChevronDown,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * A helper function to format a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts`.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

/**
 * The main application navigation bar. This client component handles responsive
 * navigation, global search, and interactive cart and user account dropdowns.
 * It integrates with NextAuth.js and consumes the global CartContext for live cart state.
 */
export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  // ** 2. USE the context to get live cart data and actions **
  // This is the single source of truth for the cart state.
  const { cart, itemCount, removeFromCart } = useCart();

  /**
   * Handles the removal of an item from the cart by calling the function
   * provided by the CartContext. The context handles the optimistic UI update
   * and API call.
   * @param {string} productId - The ID of the product to remove.
   * @param {string} productName - The name of the product for the notification.
   */
  const handleRemove = (productId: string, productName: string) => {
    startTransition(async () => {
      try {
        // ** 3. CALL the context's function **
        // The Navbar no longer needs to know how to remove items, only that it can.
        await removeFromCart(productId);
        toast.success("Removed from Cart", {
          description: `${productName} has been removed.`,
        });
      } catch (error) {
        // The context will handle reverting the UI state. We just show an error toast.
        toast.error("Error", {
          description: "Could not remove item from cart.",
        });
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:gap-6">
        {/* Desktop Logo */}
        <Link
          href="/"
          className="hidden items-center gap-2 font-semibold lg:flex"
        >
          <Package2 className="h-6 w-6 text-primary-foreground" />
          <span>Avenue Fashion</span>
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="flex flex-1 justify-center px-4">
        <GlobalSearch />
      </div>

      {/* Right-aligned Actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {/* Cart Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-auto px-2 sm:px-4"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-1 text-xs"
                >
                  {itemCount}
                </Badge>
              )}
              <span className="hidden sm:ml-2 sm:inline">My Cart</span>
              <ChevronDown className="ml-1 hidden h-4 w-4 sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80"
            style={{ opacity: isPending ? 0.7 : 1 }}
          >
            <DropdownMenuLabel>My Cart ({itemCount})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] space-y-2 overflow-y-auto p-1">
              {/* The cart data is now consumed directly from the context */}
              {cart && cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <div
                    key={item.product._id.toString()}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-md p-2"
                  >
                    <div>
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() =>
                        handleRemove(item.product._id.toString(), item.name)
                      }
                      disabled={isPending}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-2">
              <Button
                className="w-full"
                asChild
                disabled={!cart || cart.items.length === 0}
              >
                <Link href="/cart">Go to Cart</Link>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Account Dropdown Menu */}
        <DropdownMenu>
          {/* This section remains unchanged */}
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-auto px-2 sm:px-4">
              <User className="h-5 w-5" />
              <span className="hidden sm:ml-2 sm:inline">
                {session ? session.user?.name?.split(" ")[0] : "Account"}
              </span>
              <ChevronDown className="ml-1 hidden h-4 w-4 sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {session ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/me">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/favourites">Favorites</Link>
                </DropdownMenuItem>
                {session.user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onSelect={() => router.push("/api/auth/signin")}
              >
                Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
