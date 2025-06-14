"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { fetchBrands } from "@/lib/data";
import { IBrand } from "@/types";
import { Skeleton } from "./ui/skeleton";

// TODO: Refactor this into a controlled component. It should accept filter state (e.g., selectedBrands, priceRange)
// and an `onFilterChange` callback function via props. This will allow its state to be managed by a parent
// component (like `ProductGrid`) and enable actual filtering logic.

/**
 * Renders a set of UI controls for filtering products by various criteria such as
 * brand, price range, and condition.
 */
export const ProductFilters = () => {
  /**
   * State to store the list of product brands fetched from the API.
   */
  const [brands, setBrands] = useState<IBrand[]>([]);

  /**
   * State to manage the loading status while fetching brands.
   */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * A side effect that runs once on component mount to fetch the list of
   * available brands to populate the brand filter checkboxes.
   */
  useEffect(() => {
    const getBrands = async () => {
      try {
        const fetchedBrands = await fetchBrands();
        setBrands(fetchedBrands);
      } catch (error) {
        console.error("Failed to load brands for filters:", error);
        // TODO: Implement user-facing feedback for when brand fetching fails.
      } finally {
        setIsLoading(false);
      }
    };
    getBrands();
  }, []); // The empty dependency array ensures this effect runs only once.

  return (
    <div className="space-y-6">
      {/* Brand Filter Section */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Brands</h3>
        {isLoading ? (
          // Display skeleton loaders while brand data is being fetched.
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {brands.map((brand) => (
              <div
                key={brand._id.toString()}
                className="flex items-center space-x-2"
              >
                {/* TODO: Wire up the `onCheckedChange` handler to update filter state. */}
                <Checkbox id={`brand-${brand.name.toLowerCase()}`} />
                <Label
                  htmlFor={`brand-${brand.name.toLowerCase()}`}
                  className="font-normal"
                >
                  {brand.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter Section */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Price Range</h3>
        {/* TODO: The `max` value is hardcoded. This should be made dynamic, for instance, by fetching the min/max product prices from the API. */}
        {/* TODO: Connect the `onValueChange` handler to update filter state. */}
        <Slider defaultValue={[25, 75]} max={100} step={1} />
      </div>

      {/* Condition Filter Section */}
      <div>
        <h3 className="mb-3 text-lg font-medium">Condition</h3>
        {/* TODO: Connect the `onValueChange` handler to update filter state. */}
        <RadioGroup defaultValue="all">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="condition-all" />
            <Label htmlFor="condition-all">All</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="condition-new" />
            <Label htmlFor="condition-new">New</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="used" id="condition-used" />
            <Label htmlFor="condition-used">Used</Label>
          </div>
          {/* TODO: Add a 'restored' option to align with the IProduct interface. */}
        </RadioGroup>
      </div>
    </div>
  );
};
