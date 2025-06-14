"use client";

import { useState } from "react";
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
  SheetFooter,
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

/**
 * Defines the props for the ProductGrid component.
 */
interface ProductGridProps {
  /**
   * The initial set of products to display, typically pre-fetched on the server.
   */
  initialProducts: IProduct[];
  /**
   * The total number of pages available, used to control the "Show More" button.
   */
  initialTotalPages: number;
}

/**
 * A client-side component that displays a grid of products with controls for
 * filtering, sorting, and "load more" style pagination. It is initialized
 * with server-fetched data and handles subsequent data fetching on the client.
 *
 * @param {ProductGridProps} props - The initial data for the component.
 */
// TODO: Refactor state management to use URL query parameters for filters and sorting.
// This would make the state shareable, bookmarkable, and improve SEO.
const ProductGrid = ({
  initialProducts,
  initialTotalPages,
}: ProductGridProps) => {
  // Manages the list of products displayed on the client.
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  // Tracks the current page number for pagination.
  const [currentPage, setCurrentPage] = useState(1);
  // Stores the total number of pages available from the API.
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  // Manages the loading state for fetching more products to provide UI feedback.
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implement state management for filters and sorting.
  // const [filters, setFilters] = useState<Partial<FetchProductsParams>>({});
  // const [sortBy, setSortBy] = useState<string>('createdAt');
  // const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // TODO: Implement a `useEffect` hook that re-fetches products when filters or sorting change.
  // This will reset the product list and pagination.

  /**
   * Fetches the next page of products and appends them to the current list.
   */
  const handleShowMore = async () => {
    // Prevent fetching if already on the last page or another fetch is in progress.
    if (currentPage >= totalPages || isLoading) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;
    try {
      // TODO: Pass the current filter and sort state to the fetchProducts call.
      const response = await fetchProducts({ page: nextPage, limit: 8 });
      setProducts((prevProducts) => [...prevProducts, ...response.data]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Failed to load more products", error);
      // TODO: Display a user-facing error message (e.g., a toast notification).
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * A placeholder component that mimics the product grid structure, shown during
   * data fetching to improve perceived performance and prevent layout shifts.
   */
  const ProductGridSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
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
    <section className="bg-muted py-8 md:py-12">
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
                {/* TODO: Pass filter state and an update handler to the ProductFilters component. */}
                <ProductFilters />
              </div>
              <SheetFooter>
                <Button type="submit" className="w-full">
                  Apply Filters
                </Button>
              </SheetFooter>
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
              {/* TODO: Wire up these menu items to update the sorting state. */}
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
              <DropdownMenuItem>Rating</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Product Grid Display */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>

        {/* Loading State and Pagination */}
        {isLoading && <ProductGridSkeleton />}
        <div className="mt-8 w-full text-center">
          {currentPage < totalPages && (
            <Button
              variant="outline"
              onClick={handleShowMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Show More"}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
