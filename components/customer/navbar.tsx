"use client";

import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import { ShoppingBag, ShoppingCart, User, ChevronDown, X } from "lucide-react";
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
import { useCart } from "@/contexts/CartContext";
import { GlobalSearch } from "./GlobalSearch";
import Image from "next/image";

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

  // ** 2. USE the context to get live cart data and actions **
  // This is the single source of truth for the cart state.
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="lg:hidden">
        <ShoppingBag className="h-6 w-6 text-primary" />
      </Link>
      <div className="flex items-center gap-2 lg:gap-6">
        {/* Desktop Logo */}
        <Link
          href="/"
          className="hidden items-center gap-2 font-semibold lg:flex"
        >
          <Image
            src="/logo.svg"
            alt="Avenue Fashion Logo"
            width={140}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>

      {/* Global Search Bar */}
      <div className="flex flex-1 justify-center px-4">
        <GlobalSearch />
      </div>

      {/* Right-aligned Actions */}
      <div className="flex items-center gap-2">
        {/* Cart Dropdown Menu */}
        <Button
          variant="ghost"
          className="relative h-9 w-auto px-2 sm:px-4"
          onClick={() => router.push("/cart")}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-1 text-xs"
            >
              {itemCount}
            </Badge>
          )}
          <span className="hidden sm:ml-2 sm:inline">My Cart</span>
        </Button>

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
                onSelect={() =>
                  signIn("google", { callbackUrl: window.location.href })
                }
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
