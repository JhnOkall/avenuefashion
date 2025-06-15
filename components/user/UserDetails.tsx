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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Truck, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { IAddress } from "@/types";
import { updateMyDetails, updateAddress, deleteAddress } from "@/lib/data";

const formatAddressString = (address: IAddress): string => {
  const cityName =
    typeof address.city === "object" && "name" in address.city
      ? address.city.name
      : "";
  const countyName =
    typeof address.county === "object" && "name" in address.county
      ? address.county.name
      : "";
  return [address.streetAddress, cityName, countyName]
    .filter(Boolean)
    .join(", ");
};

// =================================================================
// SUB-COMPONENT: Edit Account Dialog
// =================================================================

interface EditAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name?: string | null };
}

const EditAccountDialog = ({
  isOpen,
  onClose,
  user,
}: EditAccountDialogProps) => {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) setName(user.name ?? "");
  }, [isOpen, user]);

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await updateMyDetails({ name });
        toast.success("Details Updated");
        onClose();
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Your Name</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =================================================================
// SUB-COMPONENT: Edit Address Dialog
// =================================================================

interface EditAddressDialogProps {
  address: IAddress | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditAddressDialog = ({
  address,
  isOpen,
  onClose,
}: EditAddressDialogProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    streetAddress: "",
    phone: "",
    isDefault: false,
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && address) {
      setFormData({
        streetAddress: address.streetAddress,
        phone: address.phone,
        isDefault: address.isDefault,
      });
    }
  }, [isOpen, address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, isDefault: checked });
  };

  const handleSubmit = () => {
    if (!address) return;
    startTransition(async () => {
      try {
        await updateAddress(address._id.toString(), formData);
        toast.success("Address Updated Successfully");
        onClose();
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
          <DialogDescription>
            Make changes to your address details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={handleSwitchChange}
              disabled={isPending || address?.isDefault}
            />
            <Label htmlFor="isDefault">Set as default address</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =================================================================
// MAIN COMPONENT: UserDetails
// =================================================================

interface UserDetailsProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  addresses: IAddress[];
}

export const UserDetails = ({ user, addresses }: UserDetailsProps) => {
  const router = useRouter();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleEditAddress = (address: IAddress) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(true);
  };

  const handleDeleteAddress = (address: IAddress) => {
    setSelectedAddress(address);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedAddress) return;
    startDeleteTransition(async () => {
      try {
        await deleteAddress(selectedAddress._id.toString());
        toast.success("Address Deleted");
        setIsDeleteDialogOpen(false);
        setSelectedAddress(null);
        router.refresh();
      } catch (error: any) {
        toast.error("Delete Failed", { description: error.message });
      }
    });
  };

  return (
    <div className="py-4 md:py-8">
      {/* Personal Info Section */}
      <div className="flex items-center justify-between mb-6">
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
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAccountDialogOpen(true)}
        >
          <Pencil className="mr-1.5 h-4 w-4" /> Edit
        </Button>
      </div>

      {/* Address Management Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">My Addresses</h3>
        {addresses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <div
                key={addr._id.toString()}
                className="relative rounded-lg border p-4 pr-16"
              >
                {addr.isDefault && (
                  <div className="absolute top-2 right-2 text-xs font-semibold text-primary">
                    DEFAULT
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <Truck className="h-6 w-6 shrink-0 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-semibold">{addr.recipientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatAddressString(addr)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.phone}
                    </p>
                  </div>
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditAddress(addr)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAddress(addr)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            You haven't saved any addresses yet.
          </p>
        )}
      </div>

      {/* Dialogs */}
      <EditAccountDialog
        isOpen={isAccountDialogOpen}
        onClose={() => setIsAccountDialogOpen(false)}
        user={user}
      />
      <EditAddressDialog
        address={selectedAddress}
        isOpen={isAddressDialogOpen}
        onClose={() => setIsAddressDialogOpen(false)}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
