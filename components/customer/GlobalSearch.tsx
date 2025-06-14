"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, History, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { fetchProductSuggestions } from "@/lib/data";
import { IProduct } from "@/types";
import Link from "next/link";
import Cookies from "js-cookie";

/**
 * The key used to store and retrieve the user's search history from cookies.
 */
const SEARCH_HISTORY_KEY = "search_history";

/**
 * A global search component that provides real-time product suggestions,
 * debouncing of user input, and a persistent search history using cookies.
 * It is designed to be placed in a central location, like the main navbar.
 */
export const GlobalSearch = () => {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // State for the search input and its debounced value.
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // State for suggestions, history, loading, and dropdown visibility.
  const [suggestions, setSuggestions] = useState<IProduct[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Effect to fetch product suggestions when the debounced search term changes.
   * This prevents API calls on every keystroke.
   */
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Only search if the term is at least 2 characters long.
      if (debouncedSearchTerm.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const results = await fetchProductSuggestions(debouncedSearchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error("Failed to fetch search suggestions:", error);
        // TODO: Optionally provide user feedback on fetch failure.
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearchTerm]);

  /**
   * Effect to handle clicks outside the search component, used to close the
   * suggestions/history dropdown.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup: remove the event listener when the component unmounts.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Handles the input focus event by loading search history from cookies
   * and opening the suggestions/history dropdown.
   */
  const handleFocus = () => {
    try {
      const storedHistory = Cookies.get(SEARCH_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse search history cookie:", error);
      // Clear corrupted cookie
      Cookies.remove(SEARCH_HISTORY_KEY);
    }
    setIsOpen(true);
  };

  /**
   * Handles the search form submission. It updates and saves the search history,
   * then navigates the user to the main search results page.
   *
   * @param {React.FormEvent} e - The form event.
   * @param {string} query - The search query to submit.
   */
  const handleSearchSubmit = (e: React.FormEvent, query: string) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add the new query to the history, ensuring no duplicates and limiting size.
    const updatedHistory = [
      query,
      ...history.filter((h) => h !== query).slice(0, 4), // Keep the 5 most recent unique searches
    ];
    setHistory(updatedHistory);
    Cookies.set(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory), {
      expires: 365, // Keep history for one year.
    });

    setIsOpen(false);
    setSearchTerm("");
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  // Conditional flags to determine what to show in the dropdown.
  const showHistory = searchTerm.length === 0 && history.length > 0;
  const showSuggestions = searchTerm.length > 0;

  return (
    // TODO: Consider replacing this custom implementation with a library like `cmdk` for a more robust and accessible command-palette experience.
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={(e) => handleSearchSubmit(e, searchTerm)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search for products..."
          className="w-full border-none bg-muted pl-9 focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search for products"
        />
      </form>
      {/* Dropdown for suggestions and history */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-md border bg-background shadow-lg">
          {showHistory && (
            <div className="p-2">
              <h3 className="px-2 text-xs font-semibold text-muted-foreground">
                RECENT
              </h3>
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={(e) => handleSearchSubmit(e, h)}
                  className="flex w-full items-center gap-2 rounded p-2 text-left text-sm hover:bg-accent"
                >
                  <History className="h-4 w-4" />
                  {h}
                </button>
              ))}
            </div>
          )}
          {showSuggestions && (
            <div className="p-2">
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {!isLoading &&
                suggestions.length > 0 &&
                suggestions.map((product) => (
                  <Link
                    key={product._id.toString()}
                    href={`/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded p-2 text-sm hover:bg-accent"
                  >
                    {product.name}
                  </Link>
                ))}
              {!isLoading &&
                suggestions.length === 0 &&
                debouncedSearchTerm.length > 1 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No results for "{debouncedSearchTerm}"
                  </p>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
