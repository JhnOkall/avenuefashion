"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IAddress } from "@/types";
import { updateMyDetails } from "@/lib/data";

// =================================================================
// SUB-COMPONENT: Edit Dialog
// =================================================================

interface EditAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
  };
  defaultAddress: IAddress | null;
}

/**
 * A dialog component for editing user account details like name and phone number.
 */
const EditAccountDialog = ({
  isOpen,
  onClose,
  user,
  defaultAddress,
}: EditAccountDialogProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isPending, startTransition] = useTransition();

  // Pre-fill the form with current user data when the dialog opens.
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name ?? "",
        phone: defaultAddress?.phone ?? "",
      });
    }
  }, [isOpen, user, defaultAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await updateMyDetails(formData);
        toast.success("Details Updated", {
          description:
            "Your account information has been updated successfully.",
        });
        onClose();
        router.refresh(); // Refresh server components to show updated data
      } catch (error: any) {
        toast.error("Update Failed", {
          description:
            error.message || "There was a problem updating your details.",
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Your Details</DialogTitle>
          <DialogDescription>
            Make changes to your personal and contact information here. Click
            save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Default Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isPending || !defaultAddress}
              placeholder={
                !defaultAddress
                  ? "Set a default address to add a phone number"
                  : ""
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

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
 * human-readable string.
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts`.
const formatAddress = (address: IAddress | null): string => {
  if (!address) return "No default address set.";
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
  return [address.streetAddress, cityName, countyName, countryName]
    .filter(Boolean)
    .join(", ");
};

/**
 * A client component that displays a summary of the user's personal details
 * and provides an entry point to edit them.
 */
export const UserDetails = ({ user, defaultAddress }: UserDetailsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

      {/* Edit button now triggers the dialog */}
      <Button onClick={() => setIsDialogOpen(true)}>
        <Pencil className="mr-1.5 h-4 w-4" />
        Edit Your Data
      </Button>

      {/* The Dialog component is rendered here but controlled by state */}
      <EditAccountDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={user}
        defaultAddress={defaultAddress}
      />
    </div>
  );
};
