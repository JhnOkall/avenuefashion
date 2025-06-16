"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchBrands } from "@/lib/data";
import { IBrand } from "@/types";
import { Skeleton } from "./ui/skeleton";

/**
 * Defines the props for the ProductFilters component.
 */
interface ProductFiltersProps {
  /** The currently selected brand name. Null if none selected. */
  selectedBrand: string | null;
  /** Callback function to update the selected brand. */
  onBrandChange: (brand: string) => void;
  /** The currently selected condition. Null if none selected. */
  selectedCondition: "new" | "used" | "restored" | "" | null;
  /** Callback function to update the selected condition. */
  onConditionChange: (
    condition: "new" | "used" | "restored" | "" | null
  ) => void;
}

/**
 * Renders a set of UI controls for filtering products. This is a controlled
 * component whose state is managed by its parent.
 *
 * @param {ProductFiltersProps} props - The current filter state and change handlers.
 */
export const ProductFilters = ({
  selectedBrand,
  onBrandChange,
  selectedCondition,
  onConditionChange,
}: ProductFiltersProps) => {
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBrands = async () => {
      try {
        const fetchedBrands = await fetchBrands();
        setBrands(fetchedBrands);
      } catch (error) {
        console.error("Failed to load brands for filters:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getBrands();
  }, []);

  return (
    <div className="space-y-6">
      {/* Brand Filter Section */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Brands</h3>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedBrand || "all"}
            onValueChange={(value) => {
              // Pass an empty string for "all" to clear the filter
              onBrandChange(value === "all" ? "" : value);
            }}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="brand-all" />
              <Label htmlFor="brand-all" className="font-normal">
                All Brands
              </Label>
            </div>
            {brands.map((brand) => (
              <div
                key={brand._id.toString()}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem
                  value={brand.name}
                  id={`brand-${brand.name.toLowerCase()}`}
                />
                <Label
                  htmlFor={`brand-${brand.name.toLowerCase()}`}
                  className="font-normal"
                >
                  {brand.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Condition Filter Section */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Condition</h3>
        <RadioGroup
          value={selectedCondition || "all"}
          onValueChange={(value) => {
            onConditionChange(
              value === "all" ? "" : (value as "new" | "used" | "restored")
            );
          }}
          defaultValue="all"
          className="space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="condition-all" />
            <Label htmlFor="condition-all" className="font-normal">
              All
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="condition-new" />
            <Label htmlFor="condition-new" className="font-normal">
              New
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="used" id="condition-used" />
            <Label htmlFor="condition-used" className="font-normal">
              Used
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="restored" id="condition-restored" />
            <Label htmlFor="condition-restored" className="font-normal">
              Restored
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};
