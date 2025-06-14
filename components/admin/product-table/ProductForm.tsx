"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  createBrand,
  createProduct,
  fetchBrands,
  updateProduct,
} from "@/lib/data";
import { Loader2, Plus } from "lucide-react";

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
  originalPrice: 0, // ADDED
  discount: 0, // ADDED
  description: [""],
  brand: "",
  imageUrl: "/placeholder.svg",
  condition: "new" as "new" | "used" | "restored",
};

/**
 * A comprehensive form component, rendered within a dialog, for both creating
 * and editing products in the admin dashboard.
 */
// TODO: Replace the simple `imageUrl` input with a robust file upload component.
// TODO: Implement a more advanced form validation solution (e.g., `react-hook-form` and `zod`).
export const ProductForm = ({ isOpen, onClose, product }: ProductFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [isSubmitting, startTransition] = useTransition();

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, startBrandCreationTransition] = useTransition();

  /**
   * Effect to fetch the list of available brands when the component mounts.
   */
  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  /**
   * Effect to synchronize the form's state with the `product` prop.
   */
  useEffect(() => {
    if (product) {
      // Editing mode: Populate form with existing product data.
      setFormData({
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? 0, // ADDED: Populate originalPrice, defaulting to 0
        discount: product.discount ?? 0, // ADDED: Populate discount, defaulting to 0
        description: product.description,
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
   * Handles the form submission logic.
   */
  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const submissionData = {
          ...formData,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice) || undefined, // ADDED: Convert to number, or undefined if 0
          discount: Number(formData.discount) || undefined, // ADDED: Convert to number, or undefined if 0
          brand: formData.brand as any,
        };

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

  /**
   * Handles the creation of a new brand.
   */
  const handleCreateBrand = async () => {
    // ... (This function remains unchanged)
    if (!newBrandName.trim()) {
      toast.error("Brand name cannot be empty.");
      return;
    }
    startBrandCreationTransition(async () => {
      try {
        const newBrand = await createBrand({ name: newBrandName });
        toast.success("Brand Created", {
          description: `Brand "${newBrand.name}" was successfully created.`,
        });
        setBrands((prev) => [...prev, newBrand]);
        setFormData((prev) => ({ ...prev, brand: newBrand._id.toString() }));
        setIsBrandDialogOpen(false);
        setNewBrandName("");
      } catch (error: any) {
        toast.error("Brand Creation Failed", { description: error.message });
      }
    });
  };

  return (
    <>
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

            {/* --- ADDED PRICE & DISCOUNT FIELDS --- */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Sale Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount % (Optional)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            {/* --- END OF ADDED FIELDS --- */}

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={formData.brand}
                  onValueChange={(v) => handleSelectChange("brand", v)}
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem
                        key={b._id.toString()}
                        value={b._id.toString()}
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsBrandDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for creating a new brand */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        {/* ... (This dialog remains unchanged) */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brand</DialogTitle>
            <DialogDescription>
              Enter the name for the new brand. It will be immediately available
              for use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="new-brand-name">Brand Name</Label>
            <Input
              id="new-brand-name"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="e.g., Nike, Adidas, etc."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBrandDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBrand} disabled={isCreatingBrand}>
              {isCreatingBrand && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCreatingBrand ? "Creating..." : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
