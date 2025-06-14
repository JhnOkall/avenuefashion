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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { GlobalSearch } from "./GlobalSearch";
import { useRouter } from "next/navigation";

/**
 * A helper function to format a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file for application-wide reusability.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

/**
 * An array of navigation links for the main navbar.
 */
// TODO: For a production application, these links should be managed dynamically,
// potentially fetched from a headless CMS or a configuration API.
const navLinks = [
  { href: "#", label: "Best Sellers" },
  { href: "#", label: "Gift Ideas" },
  { href: "#", label: "Today's Deals" },
];

/**
 * The main application navigation bar. This client component handles responsive
 * navigation, global search, and interactive cart and user account dropdowns.
 * It integrates with NextAuth.js for session management and a custom CartContext
 * for shopping cart state.
 */
export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, itemCount, removeFromCart } = useCart();
  // `useTransition` provides a pending state for non-blocking UI updates,
  // useful for operations like removing an item from the cart.
  const [isPending, startTransition] = useTransition();

  /**
   * Handles the removal of an item from the cart, providing optimistic UI
   * feedback via the CartContext and user notifications via toasts.
   * @param {string} productId - The ID of the product to remove.
   * @param {string} productName - The name of the product for the notification.
   */
  const handleRemove = (productId: string, productName: string) => {
    startTransition(async () => {
      try {
        await removeFromCart(productId);
        toast.success("Removed from Cart", {
          description: `${productName} has been removed.`,
        });
      } catch (error) {
        toast.error("Error", {
          description: "Could not remove item from cart.",
        });
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 lg:gap-6">
        {/* Mobile Navigation (Hamburger Menu) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6 text-primary" />
                <span className="sr-only">Avenue Fashion</span>
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Logo */}
        <Link
          href="/"
          className="hidden items-center gap-2 font-semibold lg:flex"
        >
          <Package2 className="h-6 w-6 text-primary" />
          <span>Avenue Fashion</span>
        </Link>
      </div>

      {/* Global Search Bar - centralized in the navbar */}
      <div className="flex flex-1 justify-center px-4">
        <GlobalSearch />
      </div>

      {/* Right-aligned Actions: Cart and User Account */}
      <div className="flex items-center gap-2">
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
              // Actions for authenticated users
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
                {/* Admin-specific link */}
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
              // Action for guest users
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
