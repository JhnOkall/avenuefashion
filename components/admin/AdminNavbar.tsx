"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Package2,
  Home,
  Package,
  ShoppingCart,
  Users,
  Tag,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";

/**
 * A configuration array that defines the navigation links for the mobile sidebar (Sheet).
 * This structure makes it easy to add, remove, or reorder navigation items.
 */
// TODO: Centralize this navigation configuration. This array is nearly identical to the one in `AdminSidebar.tsx`. Consolidating them into a single shared file would improve maintainability and ensure consistency between mobile and desktop navigation.
const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/users", label: "Users", icon: Users },
  { href: "/vouchers", label: "Vouchers", icon: Tag },
  { href: "/locations", label: "Locations", icon: MapPin },
];

/**
 * The main top navigation bar component for the admin dashboard layout.
 *
 * This client component provides a responsive header containing a mobile navigation drawer
 * (using a Sheet) and a user account management dropdown menu. It leverages NextAuth.js
 * for session management to display user-specific information and actions.
 *
 * @returns {JSX.Element} The rendered admin navigation bar.
 */
export const AdminNavbar = () => {
  /**
   * `useSession` hook from NextAuth.js to get the current user's authentication state.
   */
  const { data: session } = useSession();
  /**
   * `useRouter` hook from Next.js for programmatic navigation.
   */
  const router = useRouter();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      {/* Mobile Navigation Drawer (Sheet) */}
      {/* This `Sheet` component provides the main dashboard navigation on smaller screens where the sidebar is hidden. */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/dashboard"
              className="mb-4 flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6 text-primary-foreground" />
              <span>Avenue Admin</span>
            </Link>
            {mobileNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* A flexible spacer to push the user menu to the right side of the header. */}
      {/* TODO: Consider adding a global admin search bar here for quick access to orders, products, or users. */}
      <div className="w-full flex-1" />

      {/* User Account Dropdown Menu */}
      {/* Provides access to user-specific actions like viewing the storefront, profile, and logging out. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={session?.user?.image ?? undefined}
                alt={session?.user?.name ?? "Admin"}
              />
              <AvatarFallback>
                {session?.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {session?.user?.name || "Admin Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push("/")}>
            Storefront
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push("/me")}>
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* The `onSelect` event triggers the `signOut` function from NextAuth.js.
              The `callbackUrl` ensures the user is redirected to the homepage after logging out. */}
          <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
