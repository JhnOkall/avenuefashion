"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Truck } from "lucide-react";
import { IAddress } from "@/types";

/**
 * Defines the props required by the UserDetails component.
 */
interface UserDetailsProps {
  /**
   * The current user's session information.
   */
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  /**
   * The user's default address object, or null if none is set.
   */
  defaultAddress: IAddress | null;
}

/**
 * A helper function to format a structured address object into a single,
 * human-readable string. It safely handles potentially unpopulated fields.
 *
 * @param {IAddress} address - The address object to format.
 * @returns {string} A formatted address string or a fallback message.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file to ensure consistency and reusability across the application.
const formatAddress = (address: IAddress | null): string => {
  if (!address) return "No default address set.";

  // Safely access the name property only if the field is a populated object.
  const cityName =
    typeof address.city === "object" && "name" in address.city
      ? address.city.name
      : "";
  const countyName =
    typeof address.county === "object" && "name" in address.county
      ? address.county.name
      : "";
  const countryName =
    typeof address.country === "object" && "name" in address.country
      ? address.country.name
      : "";

  // Filter out any empty parts and join them with a comma.
  return [address.streetAddress, cityName, countyName, countryName]
    .filter(Boolean)
    .join(", ");
};

/**
 * A client component that displays a summary of the user's personal details
 * and their default contact/shipping information on their profile page.
 *
 * @param {UserDetailsProps} props - The props containing user and address data.
 */
export const UserDetails = ({ user, defaultAddress }: UserDetailsProps) => {
  return (
    <div className="py-4 md:py-8">
      <div className="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
        {/* User's Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? "User"}
              />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {user.name}
              </h2>
            </div>
          </div>
          <dl>
            <dt className="font-semibold text-foreground">Email Address</dt>
            <dd className="text-muted-foreground">{user.email}</dd>
          </dl>
          <dl>
            <dt className="font-semibold text-foreground">Default Phone</dt>
            <dd className="text-muted-foreground">
              {defaultAddress?.phone ?? "N/A"}
            </dd>
          </dl>
        </div>

        {/* User's Default Address Information */}
        <div className="space-y-4">
          <dl>
            <dt className="font-semibold text-foreground">
              Default Delivery Address
            </dt>
            <dd className="flex items-start gap-2 text-muted-foreground">
              <Truck className="mt-1 hidden h-5 w-5 shrink-0 lg:inline" />
              <span>{formatAddress(defaultAddress)}</span>
            </dd>
          </dl>
        </div>
      </div>
      {/* TODO: Implement the "Edit Your Data" functionality. This button should trigger a dialog or modal (`EditAccountDialog`) allowing the user to update their name, phone, or other personal details. */}
      <Button disabled>
        <Pencil className="mr-1.5 h-4 w-4" />
        Edit Your Data
      </Button>
    </div>
  );
};
