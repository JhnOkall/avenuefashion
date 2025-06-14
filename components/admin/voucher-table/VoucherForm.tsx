"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { IVoucher } from "@/types";
import { createVoucher, updateVoucher } from "@/lib/data";
import { Loader2 } from "lucide-react";

/**
 * Defines the props required by the VoucherForm component.
 */
interface VoucherFormProps {
  /**
   * A boolean to control the visibility of the dialog.
   */
  isOpen: boolean;
  /**
   * A callback function to close the dialog.
   */
  onClose: () => void;
  /**
   * The voucher object to be edited. If null, the form is in "create" mode.
   */
  voucher: IVoucher | null;
}

/**
 * The initial state for the voucher form, used for creating a new voucher
 * or resetting the form.
 */
const initialFormState = {
  code: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: 0,
  expiresAt: "",
};

/**
 * A reusable form component, rendered within a dialog, for creating and
 * editing discount vouchers. It handles its own state and submission logic.
 *
 * @param {VoucherFormProps} props - The props for configuring the form.
 */
// TODO: For more complex validation, consider using a library like `react-hook-form` with `zod`
// to handle form state, validation, and submission more robustly.
export const VoucherForm = ({ isOpen, onClose, voucher }: VoucherFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, startTransition] = useTransition();

  /**
   * A side effect that synchronizes the form's state with the `voucher` prop.
   * When the dialog opens or the `voucher` to be edited changes, this effect
   * populates the form for editing or resets it for creation.
   */
  useEffect(() => {
    if (voucher) {
      // Editing mode: Populate form with existing voucher data.
      setFormData({
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        // Format the date for the HTML date input, which expects 'YYYY-MM-DD'.
        expiresAt: voucher.expiresAt
          ? new Date(voucher.expiresAt).toISOString().split("T")[0]
          : "",
      });
    } else {
      // Creation mode: Reset the form to its initial state.
      setFormData(initialFormState);
    }
  }, [voucher, isOpen]); // Rerun effect if the voucher or dialog visibility changes.

  /**
   * A generic handler for updating controlled text/number input fields.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * A specific handler for updating the state from the Select component.
   */
  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * Handles the form submission logic. It prepares the data for the API,
   * calls the appropriate create or update function, and provides user feedback.
   */
  const handleSubmit = async () => {
    // TODO: Add client-side validation here. For example, ensure that if `discountType` is 'percentage', `discountValue` is between 0 and 100.
    startTransition(async () => {
      try {
        const submissionData = {
          ...formData,
          // Coerce discountValue to a number.
          discountValue: Number(formData.discountValue),
          // Convert the date string back to a Date object, or undefined if empty.
          expiresAt: formData.expiresAt
            ? new Date(formData.expiresAt)
            : undefined,
        };

        if (voucher) {
          // Update an existing voucher.
          await updateVoucher(voucher._id.toString(), submissionData);
          toast.success("Success", {
            description: "Voucher updated successfully.",
          });
        } else {
          // Create a new voucher.
          await createVoucher(submissionData);
          toast.success("Success", {
            description: "Voucher created successfully.",
          });
        }

        onClose(); // Close the dialog on success.
        router.refresh(); // Refresh server-side data to update the UI.
      } catch (error: any) {
        toast.error("Operation Failed", { description: error.message });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {voucher ? "Edit Voucher" : "Create New Voucher"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Voucher Code</Label>
            <Input id="code" value={formData.code} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type</Label>
            <Select
              value={formData.discountType}
              onValueChange={(v) => handleSelectChange("discountType", v)}
            >
              <SelectTrigger id="discountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountValue">Discount Value</Label>
            <Input
              id="discountValue"
              type="number"
              value={formData.discountValue}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires At (Optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Voucher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
