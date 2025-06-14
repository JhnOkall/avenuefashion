"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Tag,
  MapPin,
  Package2,
} from "lucide-react";

/**
 * A configuration array that defines the navigation links for the admin sidebar.
 * Each object contains the path, display label, and a Lucide icon component.
 * This structure makes it easy to add, remove, or reorder navigation items.
 */
// TODO: For more complex applications, enhance this structure to include role-based access control (RBAC),
// e.g., `roles: ['admin', 'manager']`, to conditionally render links based on user permissions.
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/users", label: "Users", icon: Users },
  { href: "/vouchers", label: "Vouchers", icon: Tag },
  { href: "/locations", label: "Locations", icon: MapPin },
];

/**
 * The main sidebar component for the admin layout.
 *
 * As a client component, it uses the `usePathname` hook to determine the current
 * route and apply active styling to the corresponding navigation link. The sidebar
s * is designed to be displayed on medium screens and larger, being hidden on mobile
 * where a sheet-based navigation would typically be used.
 *
 * @returns {JSX.Element} The rendered sidebar navigation panel.
 */
export const AdminSidebar = () => {
  /**
   * `usePathname` hook from Next.js to get the current URL path.
   * This is essential for highlighting the active navigation link.
   */
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-muted md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Package2 className="h-6 w-6 text-primary-foreground" />
            <span>Avenue Admin</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              /**
               * Determines if a navigation link is active.
               * - The dashboard link is active only on an exact path match.
               * - For other links, it checks if the current pathname starts with the link's href,
               *   which correctly highlights the link even on nested pages (e.g., `/products/edit/123`).
               */
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));

              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary-foreground ${
                    isActive
                      ? "bg-primary/10 text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
