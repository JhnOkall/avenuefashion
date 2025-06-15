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
import { ImageUploader } from "@/components/admin/ImageUploader";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
}

const initialFormState = {
  name: "",
  price: 0,
  originalPrice: 0,
  discount: 0,
  description: [""],
  brand: "",
  imageUrl: "/placeholder.svg",
  condition: "new" as "new" | "used" | "restored",
};

export const ProductForm = ({ isOpen, onClose, product }: ProductFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [isSubmitting, startTransition] = useTransition();

  // --- NEW: State to track the last edited price-related field ---
  const [lastChangedField, setLastChangedField] = useState<
    "price" | "originalPrice" | "discount" | null
  >(null);

  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, startBrandCreationTransition] = useTransition();

  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? 0,
        discount: product.discount ?? 0,
        description: product.description,
        brand:
          typeof product.brand === "string"
            ? product.brand
            : product.brand._id.toString(),
        imageUrl: product.imageUrl,
        condition: product.condition,
      });
    } else {
      setFormData(initialFormState);
    }
    // Reset the last changed field when the dialog opens/closes or product changes
    setLastChangedField(null);
  }, [product, isOpen]);

  // --- NEW: useEffect to handle automatic price calculations ---
  useEffect(() => {
    // Don't run calculations on initial load
    if (!lastChangedField) return;

    const price = parseFloat(String(formData.price)) || 0;
    const originalPrice = parseFloat(String(formData.originalPrice)) || 0;
    const discount = parseFloat(String(formData.discount)) || 0;

    let newValues: Partial<typeof formData> = {};

    // Logic: If user changed price or original price, calculate the discount.
    if (
      (lastChangedField === "price" || lastChangedField === "originalPrice") &&
      originalPrice > 0 &&
      price > 0 &&
      originalPrice > price
    ) {
      const calculatedDiscount = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      );
      if (calculatedDiscount !== discount) {
        newValues.discount = calculatedDiscount;
      }
    }
    // Logic: If user changed the discount, calculate the sale price.
    else if (
      lastChangedField === "discount" &&
      originalPrice > 0 &&
      discount > 0 &&
      discount < 100
    ) {
      const calculatedPrice = parseFloat(
        (originalPrice * (1 - discount / 100)).toFixed(2)
      );
      if (calculatedPrice !== price) {
        newValues.price = calculatedPrice;
      }
    }

    // Update the state if any new values were calculated
    if (Object.keys(newValues).length > 0) {
      setFormData((prev) => ({ ...prev, ...newValues }));
    }
  }, [
    formData.price,
    formData.originalPrice,
    formData.discount,
    lastChangedField,
  ]);

  // --- MODIFIED: The generic handleChange now also tracks the last changed field ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    // Track which price-related field was changed
    if (["price", "originalPrice", "discount"].includes(id)) {
      setLastChangedField(id as "price" | "originalPrice" | "discount");
    }

    if (id === "description") {
      setFormData((prev) => ({ ...prev, description: value.split("\n") }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const { price, originalPrice, discount, ...rest } = formData;
        const finalPrice = Number(price);
        const finalOriginalPrice = Number(originalPrice);

        // Final validation: Ensure originalPrice is set if there's a discount
        if (finalPrice > 0 && finalPrice >= finalOriginalPrice) {
          toast.error("Invalid Prices", {
            description: "Sale Price must be less than Original Price.",
          });
          return;
        }

        const submissionData = {
          ...rest,
          price: finalPrice,
          originalPrice:
            finalOriginalPrice > 0 ? finalOriginalPrice : undefined,
          discount:
            finalOriginalPrice > 0 && finalPrice > 0
              ? Math.round(
                  ((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100
                )
              : undefined,
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

  const handleCreateBrand = async () => {
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice || ""}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g., 1200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount %</Label>
                <Input
                  id="discount"
                  type="number"
                  value={formData.discount || ""}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  placeholder="e.g., 25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="font-semibold">
                  Sale Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={handleChange}
                  min="0"
                  required
                  placeholder="e.g., 900"
                  className="font-bold border-primary"
                />
              </div>
            </div>
            {/* ... rest of the form ... */}
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
              <Label htmlFor="imageUrl">Image</Label>
              <ImageUploader
                initialImageUrl={formData.imageUrl}
                onUploadSuccess={handleImageUpload}
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
      {/* ... brand creation dialog ... */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
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
