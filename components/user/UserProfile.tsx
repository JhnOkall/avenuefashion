"use client";

import { ShoppingCart, Star, Heart, Undo2, LucideIcon } from "lucide-react";
import { UserDetails } from "./UserDetails";
import { LatestOrders } from "./LatestOrders";
import { IAddress, IOrder } from "@/types";

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * Defines the props for the StatCard component.
 */
interface StatCardProps {
  /**
   * The Lucide icon component to display.
   */
  icon: LucideIcon;
  /**
   * The title or label for the statistic.
   */
  title: string;
  /**
   * The numerical value of the statistic.
   */
  value: number;
}

/**
 * A reusable card-like component for displaying a single statistic on the user dashboard.
 * @param {StatCardProps} props - The component's props.
 */
// TODO: Enhance StatCard to optionally show a percentage change or comparison to a previous period (e.g., "+5% vs last month").
const StatCard = ({ icon: Icon, title, value }: StatCardProps) => (
  <div>
    <Icon className="mb-2 h-8 w-8 text-muted-foreground" />
    <h3 className="mb-2 text-muted-foreground">{title}</h3>
    <div className="flex items-center">
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  </div>
);

// =================================================================
// MAIN COMPONENT
// =================================================================

/**
 * Defines the props for the UserProfile main component.
 */
interface UserProfileProps {
  /**
   * The current user's session information.
   */
  user: { name?: string | null; email?: string | null; image?: string | null };
  /**
   * An array of the user's most recent orders.
   */
  orders: IOrder[];
  /**
   * An array of the user's saved addresses.
   */
  addresses: IAddress[];
  /**
   * The total count of orders placed by the user.
   */
  orderCount: number;
  /**
   * The total count of reviews written by the user.
   */
  reviewCount: number;
}

/**
 * The main client component for the user's profile dashboard. It provides a general
 * overview of the user's activity through statistical cards and includes sections
 * for user details and recent orders.
 *
 * @param {UserProfileProps} props - The props containing all necessary user data.
 */
export const UserProfile = ({
  user,
  orders,
  addresses,
  orderCount,
  reviewCount,
}: UserProfileProps) => {
  /**
   * Determines the user's default address for display. Falls back to the first
   * address in the list if no default is explicitly set.
   */
  const defaultAddress =
    addresses.find((addr) => addr.isDefault) || addresses[0] || null;

  /**
   * An array defining the data for the statistical overview cards.
   */
  // TODO: The 'Favorite products' and 'Product returns' values are hardcoded. These should be made dynamic by fetching the actual counts from the backend.
  const stats = [
    { icon: ShoppingCart, title: "Orders placed", value: orderCount },
    { icon: Star, title: "Reviews added", value: reviewCount },
    { icon: Heart, title: "Favorite products", value: 0 },
    { icon: Undo2, title: "Product returns", value: 0 },
  ];

  return (
    <section className="bg-background py-8">
      <div className="mx-auto max-w-screen-lg px-4 2xl:px-0">
        <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl md:mb-6">
          General Overview
        </h2>

        {/* Statistical Overview Section */}
        <div className="grid grid-cols-2 gap-6 border-b border-t border-border py-4 md:py-8 lg:grid-cols-4 xl:gap-16">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Child Components for Detailed Information */}
        <UserDetails user={user} defaultAddress={defaultAddress} />
        <LatestOrders orders={orders} />
      </div>
    </section>
  );
};
