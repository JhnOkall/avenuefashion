"use client";

import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, ArrowUpDown } from "lucide-react";
import { ProductFilters } from "./ProductFilters";
import ProductCard from "./productCard";
import { IProduct } from "@/types";
import { fetchProducts } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  initialProducts: IProduct[];
  initialTotalPages: number;
}

/** Defines the structure for our filter state */
interface Filters {
  brand: string | null;
  condition: ("new" | "used" | "restored" | "") | null;
}

const ProductGrid = ({
  initialProducts,
  initialTotalPages,
}: ProductGridProps) => {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  // Differentiated loading states for a better user experience
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For "Show More" button
  const [isRefetching, setIsRefetching] = useState(false); // For filter/sort changes

  // State for filters and sorting
  const [filters, setFilters] = useState<Filters>({
    brand: null,
    condition: null,
  });
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "rating">(
    "createdAt"
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // A ref to prevent the useEffect from running on the initial mount
  const isInitialMount = useRef(true);

  /**
   * Re-fetches products from the first page whenever filters or sorting options change.
   * This effect resets the product list and pagination.
   */
  useEffect(() => {
    // Prevent re-fetching with initial state on component mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const refetchProducts = async () => {
      setIsRefetching(true);
      try {
        const response = await fetchProducts({
          page: 1, // Always reset to page 1 on filter/sort change
          limit: 8,
          sortBy,
          order,
          brand: filters.brand || undefined, // Pass undefined if null
          condition: filters.condition || undefined,
        });
        setProducts(response.data);
        setTotalPages(response.totalPages);
        setCurrentPage(1); // Reset pagination
      } catch (error) {
        console.error("Failed to refetch products:", error);
      } finally {
        setIsRefetching(false);
      }
    };

    refetchProducts();
  }, [filters, sortBy, order]); // Dependency array triggers the effect

  /**
   * Fetches the next page of products and appends them to the current list,
   * respecting the current filter and sort settings.
   */
  const handleShowMore = async () => {
    if (currentPage >= totalPages || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const response = await fetchProducts({
        page: nextPage,
        limit: 8,
        sortBy,
        order,
        brand: filters.brand || undefined,
        condition: filters.condition || undefined,
      });
      setProducts((prevProducts) => [...prevProducts, ...response.data]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Failed to load more products", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 gap-4 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="flex flex-col space-y-3">
          <Skeleton className="h-[225px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-muted/40 py-8 md:py-12">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        {/* Toolbar for Filtering and Sorting */}
        <div className="mb-4 flex items-center gap-2 md:mb-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="-ms-0.5 mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Refine your search to find the perfect product.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <ProductFilters
                  selectedBrand={filters.brand}
                  onBrandChange={(brand) =>
                    setFilters((prev) => ({ ...prev, brand: brand || null }))
                  }
                  selectedCondition={filters.condition}
                  onConditionChange={(
                    condition: "new" | "used" | "restored" | "" | null
                  ) =>
                    setFilters((prev) => ({
                      ...prev,
                      condition: condition,
                    }))
                  }
                />
              </div>
              {/* SheetFooter is removed as filters apply instantly */}
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="-ms-0.5 mr-2 h-4 w-4" />
                Sort
                <ChevronDown className="-mr-0.5 ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  setSortBy("createdAt");
                  setOrder("desc");
                }}
              >
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setSortBy("price");
                  setOrder("asc");
                }}
              >
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setSortBy("price");
                  setOrder("desc");
                }}
              >
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setSortBy("rating");
                  setOrder("desc");
                }}
              >
                Rating
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Product Grid Display with Loading and Empty States */}
        {isRefetching ? (
          <ProductGridSkeleton />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id.toString()} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <h3 className="text-xl font-semibold">No Products Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Loading State for "Show More" */}
        {isLoadingMore && <ProductGridSkeleton />}

        {/* Pagination Button */}
        <div className="mt-8 w-full text-center">
          {!isRefetching && currentPage < totalPages && (
            <Button
              variant="outline"
              onClick={handleShowMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Show More"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
