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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { IBrand, IProduct } from "@/types";
import { createProduct, fetchBrands, updateProduct } from "@/lib/data";
import { Loader2 } from "lucide-react";

/**
 * Defines the props required by the ProductForm component.
 */
interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
}

/**
 * The initial state for the product form, used for creating a new product
 * or resetting the form.
 */
const initialFormState = {
  name: "",
  price: 0,
  description: [""],
  brand: "",
  imageUrl: "/placeholder.svg",
  condition: "new" as "new" | "used" | "restored",
};

/**
 * A comprehensive form component, rendered within a dialog, for both creating
 * and editing products in the admin dashboard. It manages its own state, fetches
 * necessary data like brands, and handles the submission process.
 *
 * @param {ProductFormProps} props - The props for configuring the form.
 */
// TODO: Replace the simple `imageUrl` input with a robust file upload component
// that integrates with a cloud storage service (e.g., Cloudinary, AWS S3).
// TODO: Implement a more advanced form validation solution (e.g., `react-hook-form` and `zod`).
export const ProductForm = ({ isOpen, onClose, product }: ProductFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [isSubmitting, startTransition] = useTransition();

  /**
   * Effect to fetch the list of available brands when the component mounts.
   * This populates the "Brand" select dropdown.
   */
  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  /**
   * Effect to synchronize the form's state with the `product` prop.
   * When the dialog opens or the `product` to be edited changes, this populates
   * the form fields for editing or resets them for creation.
   */
  useEffect(() => {
    if (product) {
      // Editing mode: Populate form with existing product data.
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description,
        // Safely access the brand ID, whether it's populated or not.
        brand:
          typeof product.brand === "string"
            ? product.brand
            : product.brand._id.toString(),
        imageUrl: product.imageUrl,
        condition: product.condition,
      });
    } else {
      // Creation mode: Reset the form.
      setFormData(initialFormState);
    }
  }, [product, isOpen]);

  /**
   * A generic handler for updating controlled text, number, or textarea inputs.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    // Special handling for the description to maintain an array of strings.
    if (id === "description") {
      setFormData((prev) => ({ ...prev, description: value.split("\n") }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  /**
   * A specific handler for updating state from Select components.
   */
  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  /**
   * Handles the form submission logic. It prepares the data for the API,
   * calls the appropriate create or update function, and provides user feedback.
   */
  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const submissionData = {
          ...formData,
          price: Number(formData.price),
          // Backend expects the brand field to be an ObjectId string.
          brand: formData.brand,
        };
        // The type assertion `as unknown as IBrand` is removed as the backend
        // should handle the string ID.

        if (product) {
          await updateProduct(product._id.toString(), submissionData);
          toast.success("Success", {
            description: "Product updated successfully.",
          });
        } else {
          await createProduct(submissionData);
          toast.success("Success", {
            description: "Product created successfully.",
          });
        }

        onClose();
        router.refresh();
      } catch (error: any) {
        toast.error("Operation Failed", { description: error.message });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select
              value={formData.brand}
              onValueChange={(v) => handleSelectChange("brand", v)}
            >
              <SelectTrigger id="brand">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b._id.toString()} value={b._id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={formData.condition}
              onValueChange={(v) => handleSelectChange("condition", v)}
            >
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="restored">Restored</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (one paragraph per line)
            </Label>
            <Textarea
              id="description"
              value={formData.description.join("\n")}
              onChange={handleChange}
              rows={5}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
