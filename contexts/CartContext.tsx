"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import useSWR from "swr";
import { ICart } from "@/types";
import { removeCartItem } from "@/lib/data";

/**
 * Defines the shape of the cart context, including the cart data
 * and actions to manipulate it.
 */
interface CartContextType {
  /**
   * The current cart object. It can be `ICart` if a cart exists,
   * `null` if no cart is found (e.g., for a new user), or `undefined`
   * while SWR is initially fetching the data.
   */
  cart: ICart | null | undefined;
  /**
   * A boolean flag indicating whether the cart data is currently being fetched.
   */
  isLoading: boolean;
  /**
   * Stores any error object returned by SWR if the data fetching fails.
   */
  error: any;
  /**
   * The total number of items in the cart, calculated by summing the quantities
   * of all line items.
   */
  itemCount: number;
  /**
   * An asynchronous function to remove a product entirely from the cart.
   * @param {string} productId - The ID of the product to remove.
   */
  removeFromCart: (productId: string) => Promise<void>;
  // TODO: Implement `updateCartItem` and `addToCart` functions following the optimistic UI pattern.
  // updateItemQuantity: (productId: string, newQuantity: number) => Promise<void>;
  // addToCart: (productId: string, quantity: number) => Promise<void>;
}

/**
 * React context for providing global access to the shopping cart state.
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * A generic fetcher function for use with SWR. It fetches data from a URL,
 * parses the JSON response, and returns the `data` property from the response body.
 * @param {string} url - The URL to fetch.
 */
const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.data);

/**
 * The CartProvider component wraps parts of the application that need access
 * to the cart state. It uses SWR for efficient data fetching, caching, and
 * revalidation.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to render.
 */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: cart,
    error,
    isLoading,
    mutate,
  } = useSWR<ICart | null>("/api/cart", fetcher, {
    // Re-fetches cart data when the user focuses on the window or tab,
    // ensuring the cart state is up-to-date across multiple tabs.
    revalidateOnFocus: true,
  });

  /**
   * Asynchronously removes an item from the cart using an optimistic UI approach.
   * This provides instant feedback to the user by updating the local state
   * immediately, before the API call completes.
   *
   * @param {string} productId - The ID of the product to be removed.
   */
  const removeFromCart = async (productId: string) => {
    try {
      // Optimistically update the local SWR cache for an immediate UI response.
      // We prevent revalidation here because we will manually trigger it later.
      mutate(
        async (currentCart) => {
          if (!currentCart) return null;
          const updatedItems = currentCart.items.filter(
            (item) => item.product._id.toString() !== productId
          );
          return {
            ...currentCart,
            items: updatedItems,
          } as ICart;
        },
        { revalidate: false }
      );

      // Perform the actual API call to remove the item from the server.
      await removeCartItem(productId);

      // Trigger a revalidation to sync the local state with the server's
      // definitive state, ensuring consistency.
      mutate();
    } catch (err) {
      console.error("Failed to remove item from cart", err);
      // If the API call fails, re-trigger a mutation to revert the
      // optimistic update and fetch the correct state from the server.
      mutate();
      // TODO: Implement user-facing error feedback (e.g., a toast notification).
    }
  };

  /**
   * Memoized calculation of the total number of items in the cart.
   * This avoids recalculating on every render unless the cart itself changes.
   */
  const itemCount = useMemo(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }, [cart]);

  /**
   * Memoizes the context value to prevent unnecessary re-renders of consumer
   * components that rely on the context.
   */
  const value = useMemo(
    () => ({
      cart,
      isLoading,
      error,
      itemCount,
      removeFromCart,
    }),
    [cart, isLoading, error, itemCount] // Dependencies array for useMemo
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * A custom hook to consume the CartContext.
 * It provides a convenient and safe way for components to access cart state
 * and actions, while ensuring it is used within a CartProvider.
 *
 * @returns {CartContextType} The cart context value.
 * @throws {Error} If the hook is used outside of a CartProvider.
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
