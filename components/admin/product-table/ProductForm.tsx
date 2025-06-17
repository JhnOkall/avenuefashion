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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { IBrand, IProduct, IProductVariant } from "@/types";
import {
  createBrand,
  createProduct,
  fetchBrands,
  updateProduct,
} from "@/lib/data";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

// --- DEDICATED FORM STATE TYPES ---
// These types represent the data structure within the form, which can differ
// slightly from the strict database models (e.g., brand is a string ID).
interface VariationSchemaFormState {
  name: string;
  options: string[];
}
interface VariantFormState extends Omit<IProductVariant, "_id" | "options"> {
  options: Map<string, string>;
}
interface ProductFormState {
  name: string;
  description: string[];
  brand: string; // Brand is a string ID in the form
  condition: "new" | "used" | "restored";
  images: string[];
  price: number;
  stock: number;
  variationSchema: VariationSchemaFormState[];
  variants: VariantFormState[];
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
}

// Generate all combinations of variation options
const generateCombinations = (
  schema: VariationSchemaFormState[]
): Map<string, string>[] => {
  if (!schema || schema.length === 0) return [];
  const [first, ...rest] = schema;
  if (!first || !first.options || first.options.length === 0)
    return generateCombinations(rest);

  const restCombinations = generateCombinations(rest);

  return first.options.flatMap((option) => {
    const newCombination = new Map<string, string>();
    newCombination.set(first.name, option);

    if (restCombinations.length === 0) {
      return [newCombination];
    }

    return restCombinations.map((restCombination) => {
      return new Map([...newCombination, ...restCombination]);
    });
  });
};

const initialFormState: ProductFormState = {
  name: "",
  description: [""],
  brand: "",
  condition: "new",
  images: [],
  stock: 0,
  price: 0,
  variationSchema: [],
  variants: [],
};

export const ProductForm = ({ isOpen, onClose, product }: ProductFormProps) => {
  const router = useRouter();
  const [productType, setProductType] = useState<"simple" | "variable">(
    "simple"
  );
  const [formData, setFormData] = useState<ProductFormState>(initialFormState);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [isSubmitting, startTransition] = useTransition();
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, startBrandCreationTransition] = useTransition();

  // Populate form on edit
  useEffect(() => {
    fetchBrands().then(setBrands);
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        brand:
          typeof product.brand === "string"
            ? product.brand
            : product.brand._id.toString(),
        condition: product.condition,
        images: product.images,
        price: product.price || 0,
        stock: product.stock || 0,
        variationSchema:
          product.variationSchema?.map(({ name, options }) => ({
            name,
            options,
          })) || [],
        variants:
          product.variants?.map((v) => ({
            ...v,
            options: new Map(Object.entries(v.options)),
          })) || [],
      });
      setProductType(
        product.variants && product.variants.length > 0 ? "variable" : "simple"
      );
    } else {
      setFormData(initialFormState);
      setProductType("simple");
    }
  }, [product, isOpen]);

  // Generate variants when schema changes
  useEffect(() => {
    if (
      productType !== "variable" ||
      !formData.variationSchema ||
      formData.variationSchema.length === 0
    ) {
      setFormData((prev) => ({ ...prev, variants: [] }));
      return;
    }

    const combinations = generateCombinations(formData.variationSchema);
    const newVariants = combinations.map((combo) => {
      const existingVariant = formData.variants?.find((v) => {
        if (v.options.size !== combo.size) return false;
        return Array.from(combo.keys()).every(
          (key) => combo.get(key) === v.options.get(key)
        );
      });

      return (
        existingVariant || {
          options: combo,
          price: 0,
          stock: 0,
          sku: "",
          images: [],
        }
      );
    });
    setFormData((prev) => ({
      ...prev,
      variants: newVariants as VariantFormState[],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.variationSchema, productType]);

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

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const addVariationType = () => {
    setFormData((prev) => ({
      ...prev,
      variationSchema: [
        ...(prev.variationSchema || []),
        { name: "", options: [] },
      ],
    }));
  };

  const updateVariationType = (
    index: number,
    name: string,
    options: string
  ) => {
    const newSchema = [...(formData.variationSchema || [])];
    newSchema[index] = {
      name,
      options: options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    };
    setFormData((prev) => ({ ...prev, variationSchema: newSchema }));
  };

  const removeVariationType = (index: number) => {
    const newSchema = (formData.variationSchema || []).filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, variationSchema: newSchema }));
  };

  const handleVariantChange = (
    index: number,
    field: keyof VariantFormState,
    value: any
  ) => {
    const newVariants = [...(formData.variants || [])];
    (newVariants[index] as any)[field] = value;
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error("Brand name cannot be empty.");
      return;
    }
    startBrandCreationTransition(async () => {
      try {
        const newBrand = await createBrand({ name: newBrandName });
        toast.success("Brand Created");
        setBrands((prev) => [...prev, newBrand]);
        setFormData((prev) => ({ ...prev, brand: newBrand._id.toString() }));
        setIsBrandDialogOpen(false);
        setNewBrandName("");
      } catch (error: any) {
        toast.error("Brand Creation Failed", { description: error.message });
      }
    });
  };

  const handleSubmit = async () => {
    startTransition(async () => {
      try {
        const submissionData: Partial<IProduct> = {
          name: formData.name,
          description: formData.description,
          // Fix 1: Cast the brand string to the expected type
          brand: formData.brand as any, // The backend expects the string ID and will handle the conversion
          condition: formData.condition,
          images: formData.images,
          price: Number(formData.price),
          stock: Number(formData.stock),
          // Fix 2: Only include variants/variationSchema for variable products, and handle the type mismatch
          ...(productType === "variable" && {
            variants: formData.variants.map((v) => ({
              // Omit _id for new variants - the backend will generate it
              options: Object.fromEntries(v.options),
              price: v.price,
              originalPrice: v.originalPrice,
              images: v.images,
              stock: v.stock,
              sku: v.sku,
            })) as any, // Cast to any to bypass the _id requirement
            variationSchema: formData.variationSchema.map((vs) => ({
              // Omit _id for new variation schemas - the backend will generate it
              name: vs.name,
              options: vs.options,
            })) as any, // Cast to any to bypass the _id requirement
          }),
          // Fix 3: Ensure simple products have empty arrays
          ...(productType === "simple" && {
            variants: [],
            variationSchema: [],
          }),
        };

        if (product) {
          await updateProduct(product._id.toString(), submissionData);
          toast.success("Product updated successfully.");
        } else {
          await createProduct(submissionData);
          toast.success("Product created successfully.");
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[80vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (one paragraph per line)
            </Label>
            <Textarea
              id="description"
              value={formData.description?.join("\n")}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={formData.brand}
                  onValueChange={(v) => handleSelectChange("brand", v)}
                >
                  <SelectTrigger>
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
                  type="button"
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="restored">Restored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <ImageUploader
              label="Main Product Images"
              initialImageUrls={formData.images}
              onUrlsChange={(urls) =>
                setFormData((p) => ({ ...p, images: urls }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Product Type</Label>
            <RadioGroup
              value={productType}
              onValueChange={(v) => setProductType(v as any)}
              className="flex gap-4"
            >
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="simple" /> Simple Product
              </Label>
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="variable" /> Product with Variations
              </Label>
            </RadioGroup>
          </div>

          {productType === "simple" && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
              <div className="space-y-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      stock: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          )}

          {productType === "variable" && (
            <div className="space-y-6 p-4 border rounded-md">
              <div>
                <Label>Define Variations</Label>
                <div className="space-y-4 mt-2">
                  {formData.variationSchema?.map((vs, i) => (
                    <div
                      key={i}
                      className="flex items-end gap-2 p-2 border rounded-md"
                    >
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`vs-name-${i}`}>Variation Name</Label>
                        <Input
                          id={`vs-name-${i}`}
                          placeholder="e.g., Color"
                          value={vs.name}
                          onChange={(e) =>
                            updateVariationType(
                              i,
                              e.target.value,
                              vs.options.join(",")
                            )
                          }
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`vs-options-${i}`}>
                          Options (comma separated)
                        </Label>
                        <Input
                          id={`vs-options-${i}`}
                          placeholder="e.g., Red, Blue, Green"
                          value={vs.options.join(", ")}
                          onChange={(e) =>
                            updateVariationType(i, vs.name, e.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeVariationType(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addVariationType}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variation
                </Button>
              </div>

              {formData.variants && formData.variants.length > 0 && (
                <div>
                  <Label>Edit Variants</Label>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>SKU</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.variants?.map((variant, i) => (
                        <>
                          <TableRow key={i}>
                            <TableCell>
                              {Array.from(variant.options.values()).join(" / ")}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={variant.price}
                                onChange={(e) =>
                                  handleVariantChange(
                                    i,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) =>
                                  handleVariantChange(
                                    i,
                                    "stock",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-24"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={variant.sku}
                                onChange={(e) =>
                                  handleVariantChange(i, "sku", e.target.value)
                                }
                                className="w-32"
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow key={`${i}-images`}>
                            <TableCell colSpan={4} className="p-2 bg-muted/20">
                              <ImageUploader
                                label=""
                                initialImageUrls={variant.images}
                                onUrlsChange={(urls) =>
                                  handleVariantChange(i, "images", urls)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Brand</DialogTitle>
            <DialogDescription>
              Enter the name for the new brand.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="new-brand-name">Brand Name</Label>
            <Input
              id="new-brand-name"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
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
              )}{" "}
              Create Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
