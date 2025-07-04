import { IProduct, IBrand, IOrder, IAddress, IReview, ICart, ICity, ICounty, ICountry, IUser, IVoucher } from "@/types";

/**
 * @file Server-side API data fetching utilities for the Next.js application.
 * Note: The functions in this file are designed for server-side use (Server Components, Route Handlers, Server Actions)
 * as they use server-only utilities like `next/headers` and Next.js-extended fetch options (`cache`, `next`).
 */

/**
 * The base URL for all API requests, configured via environment variables.
 */
const API_BASE_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

/**
 * Creates the options object for an authenticated server-side fetch request.
 * This helper retrieves the cookies from the incoming request and forwards them
 * in the `Cookie` header of the `fetch` call. This is essential for API routes
 * to identify the user's session.
 *
 * @param options - The original `fetch` options (e.g., method, body, cache).
 * @returns A new `RequestInit` options object with the authentication cookie header merged.
 */
const getAuthFetchOptions = async (options: RequestInit = {}): Promise<RequestInit> => {
    let headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
    };
    
    // Only import and use cookies on the server side
    if (typeof window === 'undefined') {
        try {
            const { cookies } = await import('next/headers');
            const cookieHeader = cookies().toString();
            
            // Forward the cookies to the API route if they exist.
            if (cookieHeader) {
                headers = { ...headers, Cookie: cookieHeader };
            }
        } catch (error) {
            console.warn('Failed to get cookies:', error);
        }
    }

    // Automatically set the Content-Type header for requests with a body.
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    return { ...options, headers };
};


// =================================================================
// API RESPONSE & PAYLOAD TYPES
// =================================================================

// TODO: Create a generic `PaginatedApiResponse<T>` type to reduce redundancy across different response types (e.g., ProductApiResponse, MyOrdersApiResponse).

/**
 * Defines the parameters for fetching a list of products, including
 * filtering, sorting, and pagination options.
 */
export interface FetchProductsParams {
  page?: number;
  limit?: number;
  brand?: string;
  condition?: "new" | "used" | "restored" | "";
  sortBy?: "price" | "createdAt" | "rating";
  order?: "asc" | "desc";
  searchQuery?: string;
}

/**
 * The structure of the API response for a paginated list of products.
 */
export interface ProductApiResponse {
  message: string;
  data: IProduct[];
  totalPages: number;
  currentPage: number;
  totalProducts: number;
}

/**
 * The structure of the API response for a list of brands.
 */
export interface BrandApiResponse {
  message: string;
  data: IBrand[];
}

/**
 * The structure of the API response for a single resource.
 * @template T The type of the data object.
 */
export interface SingleResourceApiResponse<T> {
  message: string;
  data: T;
}

/**
 * The structure of the API response for paginated user orders.
 */
export interface MyOrdersApiResponse {
  message: string;
  data: IOrder[];
  totalPages: number;
  currentPage: number;
  totalOrders: number;
}

/**
 * The structure of the API response for a list of user addresses.
 */
export interface MyAddressesApiResponse {
    message: string;
    data: IAddress[];
}

/**
 * The structure of the API response for paginated user reviews.
 */
export interface MyReviewsApiResponse {
    message: string;
    data: IReview[];
    totalPages: number;
    currentPage: number;
    totalReviews: number;
}

/**
 * The structure of the API response for a user's favorite products.
 */
export interface FavouritesApiResponse {
  message: string;
  data: IProduct[];
}

/**
 * The structure of the API response for product reviews.
 */
export interface ReviewsApiResponse {
  message: string;
  data: IReview[];
  totalPages: number;
  currentPage: number;
  totalReviews: number;
}

/**
 * The structure of the API response for admin vouchers.
 * This is used when fetching all vouchers for the admin panel.
 */
export interface AdminVouchersApiResponse {
  message: string;
  data: IVoucher[];
}


// =================================================================
// PUBLIC DATA FETCHING FUNCTIONS (No Authentication Required)
// =================================================================

/**
 * Fetches a paginated and filtered list of products from the API.
 * @param params - An object containing filter, sort, and pagination options.
 * @returns A promise that resolves to the product API response.
 * @throws Will throw an error if the network request fails or the API returns an error status.
 */
export const fetchProducts = async (params: FetchProductsParams): Promise<ProductApiResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.brand) queryParams.append("brand", params.brand);
  if (params.condition) queryParams.append("condition", params.condition);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.order) queryParams.append("order", params.order);
  if (params.searchQuery) queryParams.append("searchQuery", params.searchQuery);

  try {
    const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    // TODO: Integrate a centralized error reporting service (e.g., Sentry) to capture client-side fetch errors.
    throw error;
  }
};

/**
 * Fetches all available product brands from the API.
 * @returns A promise that resolves to an array of brand objects.
 * @throws Will throw an error if the network request fails or the API returns an error status.
 */
export const fetchBrands = async (): Promise<IBrand[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.statusText}`);
    }

    const result: BrandApiResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error in fetchBrands:", error);
    throw error;
  }
};

/**
 * Fetches a single product by its unique slug.
 * @param slug - The URL-friendly identifier of the product.
 * @returns A promise that resolves to the product object, or null if not found.
 * @throws Will throw an error if the network request fails.
 */
export const fetchProductBySlug = async (slug: string): Promise<IProduct | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${slug}`, {
            next: { revalidate: 60 }
        });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to fetch product.');
        
        const result: SingleResourceApiResponse<IProduct> = await response.json();
        return result.data;
    } catch (error) {
        console.error(`Error fetching product by slug ${slug}:`, error);
        throw error;
    }
};

/**
 * Fetches a paginated list of reviews for a specific product.
 * @param productId - The unique identifier of the product.
 * @param params - Pagination options (`page`, `limit`).
 * @returns A promise that resolves to the reviews API response.
 * @throws Will throw an error if the network request fails.
 */
export const fetchReviewsByProduct = async (productId: string, params: { page?: number, limit?: number }): Promise<ReviewsApiResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch reviews.');

        return await response.json();
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw error;
    }
};

/**
 * Fetches a short list of products for search suggestions based on a query.
 * @param searchQuery - The user's search input.
 * @returns A promise that resolves to an array of matching products, or an empty array on failure.
 */
export const fetchProductSuggestions = async (searchQuery: string): Promise<IProduct[]> => {
  try {
      const response = await fetch(`${API_BASE_URL}/products?searchQuery=${searchQuery}&limit=5`);
      if (!response.ok) return [];
      const result: ProductApiResponse = await response.json();
      return result.data;
  } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
  }
}

// =================================================================
// AUTHENTICATED USER FUNCTIONS
// =================================================================

/**
 * Fetches a single order by its user-facing ID.
 * Assumes the request is authenticated, as the underlying API endpoint is protected.
 * @param orderId - The user-facing ID of the order.
 * @returns A promise that resolves to the order object, or null if not found.
 * @throws Will throw an error if the network request fails or the API returns a server error.
 */
export const fetchOrderById = async (orderId: string): Promise<IOrder | null> => {
  try {
    const authOptions = await getAuthFetchOptions();
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, authOptions);

    if (response.status === 404) {
      console.warn(`Order with ID ${orderId} not found.`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    const result: SingleResourceApiResponse<IOrder> = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Error in fetchOrderById for ID ${orderId}:`, error);
    throw error;
  }
};

/**
 * Fetches the current authenticated user's orders with pagination and status filtering.
 * @param params - Options for pagination (`limit`, `page`) and filtering (`status`).
 * @returns A promise that resolves to the paginated orders API response.
 * @throws Will throw an error if the request fails.
 */
export const fetchMyOrders = async (params: { limit?: number; page?: number; status?: string; }): Promise<MyOrdersApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.status && params.status !== 'all') {
      queryParams.append('status', params.status);
    }

    const authOptions = await getAuthFetchOptions();
    const response = await fetch(`${API_BASE_URL}/orders?${queryParams.toString()}`, authOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch user orders: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchMyOrders:", error);
    throw error;
  }
};

/**
 * Fetches all saved addresses for the current authenticated user.
 * @returns A promise that resolves to an array of address objects.
 * @throws Will throw an error if the request fails.
 */
export const fetchMyAddresses = async (): Promise<IAddress[]> => {
    try {
        const authOptions = await getAuthFetchOptions();
        const response = await fetch(`${API_BASE_URL}/me/addresses`, authOptions);
        if (!response.ok) {
            throw new Error(`Failed to fetch user addresses: ${response.statusText}`);
        }
        const result: MyAddressesApiResponse = await response.json();
        return result.data;
    } catch (error) {
        console.error("Error in fetchMyAddresses:", error);
        throw error;
    }
};

/**
 * Fetches the current authenticated user's reviews with pagination and rating filtering.
 * @param params - Options for pagination (`limit`, `page`) and filtering (`rating`).
 * @returns A promise that resolves to the paginated reviews API response.
 * @throws Will throw an error if the request fails.
 */
export const fetchMyReviews = async (params: { limit?: number; page?: number; rating?: number; }): Promise<MyReviewsApiResponse> => {
     try {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.rating) queryParams.append('rating', params.rating.toString());
  
        const authOptions = await getAuthFetchOptions();
        const response = await fetch(`${API_BASE_URL}/me/reviews?${queryParams.toString()}`, authOptions);
        if (!response.ok) {
            throw new Error(`Failed to fetch user reviews: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error in fetchMyReviews:", error);
        throw error;
    }
  }

/**
* Fetches the current authenticated user's list of favorite products.
* @returns A promise that resolves to an array of product objects.
* @throws Will throw an error if the request fails.
*/
export const fetchMyFavourites = async (): Promise<IProduct[]> => {
  try {
      const authOptions = await getAuthFetchOptions();
      const response = await fetch(`${API_BASE_URL}/me/favourites`, authOptions);
      if (!response.ok) {
          throw new Error(`Failed to fetch user favourites: ${response.statusText}`);
      }
      const result: FavouritesApiResponse = await response.json();
      return result.data;
  } catch (error) {
      console.error("Error in fetchMyFavourites:", error);
      throw error;
  }
}

/**
* Adds a product to the current authenticated user's list of favorites.
* @param {string} productId - The unique identifier of the product to add.
* @returns {Promise<void>} A promise that resolves when the operation is successful.
* @throws Will throw an error if the API request fails.
*/
export const addToFavourites = async (productId: string): Promise<void> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify({ productId }),
        });
        // This assumes you have a POST endpoint at /api/me/favourites
        const response = await fetch(`${API_BASE_URL}/me/favourites`, authOptions);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to favorites.');
        }
    } catch (error) {
        console.error(`Error in addToFavourites for product ${productId}:`, error);
        throw error;
    }
  };

  /**
 * Removes a product from the current authenticated user's list of favorites.
 * @param {string} productId - The unique identifier of the product to remove.
 * @returns {Promise<void>} A promise that resolves when the operation is successful.
 * @throws Will throw an error if the API request fails.
 */
export const removeFromFavourites = async (productId: string): Promise<void> => {
    try {
      // We still need authentication to know which user is making the request.
      const authOptions = await getAuthFetchOptions({
        method: 'DELETE',
        body: JSON.stringify({ productId }),
      });
      // The request is sent to the same endpoint, but with the DELETE method.
      const response = await fetch(`${API_BASE_URL}/me/favourites`, authOptions);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove from favorites.');
      }
    } catch (error) {
      console.error(`Error in removeFromFavourites for product ${productId}:`, error);
      throw error;
    }
  };

  /**
 * Updates the current authenticated user's details.
 * Can update the user's name and the phone number on their default address.
 *
 * @param {object} payload - The data to update.
 * @param {string} [payload.name] - The new name for the user.
 * @param {string} [payload.phone] - The new phone number for the user's default address.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 * @throws Will throw an error if the API request fails.
 */
export const updateMyDetails = async (payload: { name?: string; phone?: string }): Promise<void> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'PATCH', // PATCH is suitable for partial updates
            body: JSON.stringify(payload),
        });
        // Assumes you have a PATCH handler at /api/me
        const response = await fetch(`${API_BASE_URL}/me`, authOptions);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update your details.');
        }
    } catch (error) {
        console.error("Error in updateMyDetails:", error);
        throw error;
    }
};
  

// =================================================================
// CART MUTATION FUNCTIONS
// =================================================================

/**
* Fetches the current user's cart. Works for both authenticated and session-based guest users.
* @returns A promise that resolves to the user's cart object, or null if no cart exists.
* @throws Will throw an error if the request fails with a non-404 status.
*/
export const getCart = async (): Promise<ICart | null> => {
  try {
      const authOptions = await getAuthFetchOptions({
          cache: 'no-store',
      });
      const response = await fetch(`${API_BASE_URL}/cart`, authOptions);
      if (response.status === 404) return null;
      if (!response.ok) {
          throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }
      const result: SingleResourceApiResponse<ICart> = await response.json();
      return result.data;
  } catch (error) {
      console.error("Error in getCart:", error);
      throw error;
  }
};

/**
* Adds a new product or variant to the cart, or updates the quantity if it already exists.
* @param productId - The unique identifier of the product to add.
* @param quantity - The number of units to add.
* @param variantId - The unique identifier of the product variant, if applicable.
* @returns A promise that resolves to the updated cart object.
* @throws Will throw an error if the API request fails.
*/
export const addToCart = async (productId: string, quantity: number, variantId?: string): Promise<ICart> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify({ productId, quantity, variantId }),
        });
        const response = await fetch(`${API_BASE_URL}/cart`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add item to cart.');
        }
        return result.data;
    } catch (error) {
        console.error(`Error in addToCart for product ${productId}:`, error);
        throw error;
    }
};

/**
* Updates the quantity of a specific item in the cart.
* @param productId - The unique identifier of the product to update.
* @param quantity - The new quantity for the item. A quantity of 0 will remove the item.
* @param variantId - The unique identifier of the product variant, required to uniquely identify the cart item.
* @returns A promise that resolves to the updated cart object.
* @throws Will throw an error if the API request fails.
*/
export const updateCartItem = async (productId: string, quantity: number, variantId?: string): Promise<ICart> => {
  try {
      const authOptions = await getAuthFetchOptions({
          method: 'PATCH',
          body: JSON.stringify({ productId, quantity, variantId }),
      });
      const response = await fetch(`${API_BASE_URL}/cart`, authOptions);
      const result = await response.json();
      if (!response.ok) {
          throw new Error(result.message || 'Failed to update cart item.');
      }
      return result.data;
  } catch (error) {
      console.error(`Error in updateCartItem for product ${productId}:`, error);
      throw error;
  }
};

/**
* Removes an item completely from the cart, regardless of its quantity.
* @param productId - The unique identifier of the product to remove.
* @param variantId - The unique identifier of the product variant, required to uniquely identify the cart item.
* @returns A promise that resolves to the updated cart object.
* @throws Will throw an error if the API request fails.
*/
export const removeCartItem = async (productId: string, variantId?: string): Promise<ICart> => {
  try {
      const authOptions = await getAuthFetchOptions({
          method: 'DELETE',
          body: JSON.stringify({ productId, variantId }),
      });
      const response = await fetch(`${API_BASE_URL}/cart`, authOptions);
       const result = await response.json();
       if (!response.ok) {
          throw new Error(result.message || 'Failed to remove cart item.');
      }
      return result.data;
  } catch (error) {
      console.error(`Error in removeCartItem for product ${productId}:`, error);
      throw error;
  }
};

// =================================================================
// REVIEW, VOUCHER, & ORDER MUTATION FUNCTIONS
// =================================================================

/**
 * Submits a new review for a product.
 * @param productId - The unique identifier of the product being reviewed.
 * @param data - An object containing the review's `rating`, `title`, and `text`.
 * @returns A promise that resolves to the newly created review object.
 * @throws Will throw an error if the API request fails.
 */
export const submitReview = async (productId: string, data: { rating: number, title: string, text: string }): Promise<IReview> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(data),
        });
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit review.');
        }
        return result.data;
    } catch (error) {
        console.error(`Error submitting review for product ${productId}:`, error);
        throw error;
    }
};

/**
 * Updates an existing review written by the current user.
 * @param reviewId - The unique identifier of the review to update.
 * @param data - An object containing the updated `title`, `text`, and `rating`.
 * @returns A promise that resolves to the updated review object.
 * @throws Will throw an error if the API request fails.
 */
export const updateReview = async (reviewId: string, data: { title: string; text: string; rating: number }): Promise<IReview> => {
  try {
      const authOptions = await getAuthFetchOptions({
          method: 'PATCH',
          body: JSON.stringify(data),
      });
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, authOptions);
      const result = await response.json();
      if (!response.ok) {
          throw new Error(result.message || 'Failed to update review.');
      }
      return result.data;
  } catch (error) {
      console.error(`Error in updateReview for ID ${reviewId}:`, error);
      throw error;
  }
};

/**
* Deletes a review written by the current user.
* @param reviewId - The unique identifier of the review to delete.
* @returns A promise that resolves when the deletion is successful.
* @throws Will throw an error if the API request fails.
*/
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
      const authOptions = await getAuthFetchOptions({
          method: 'DELETE',
      });
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, authOptions);
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete review.');
      }
  } catch (error) {
      console.error(`Error in deleteReview for ID ${reviewId}:`, error);
      throw error;
  }
};

/**
 * Validates a voucher code against the API to check if it's active and unexpired.
 * @param code - The voucher code to validate.
 * @returns A promise that resolves to the voucher object if valid.
 * @throws Will throw an error if the voucher is invalid, expired, or the request fails.
 */
export const validateVoucher = async (code: string): Promise<IVoucher> => {
    try {
        // The API route should handle case-insensitivity, but it's good practice
        // to match the schema's `uppercase` property.
        const response = await fetch(`${API_BASE_URL}/vouchers/${code.toUpperCase()}`);
        const result = await response.json();

        if (!response.ok) {
            // Forward the specific error message from the API
            throw new Error(result.message || 'Invalid voucher code.');
        }

        // The API should return the voucher data in a `data` property
        return result.data;
    } catch (error) {
        console.error(`Error validating voucher ${code}:`, error);
        throw error; // Re-throw to be caught by the calling component
    }
};

/**
 * Fetches a single random, active, percentage-based voucher for promotional use.
 * Returns null if no eligible voucher is found or if an error occurs.
 * @returns A promise that resolves to a voucher object or null.
 */
export const fetchRandomPromotionalVoucher = async (): Promise<IVoucher | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/random`, {
        cache: 'no-store', // We want this to be dynamic on each request
      });
      if (!response.ok) {
        console.error('Failed to fetch promotional voucher');
        return null;
      }
      const result: SingleResourceApiResponse<IVoucher | null> = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error in fetchRandomPromotionalVoucher:", error);
      return null;
    }
  };
  

/**
 * Updates an existing address for the current authenticated user.
 * @param addressId - The unique identifier of the address to update.
 * @param data - An object containing the fields to update.
 * @returns A promise that resolves to the updated address object.
 * @throws Will throw an error if the API request fails.
 */
export const updateAddress = async (addressId: string, data: Partial<IAddress>): Promise<IAddress> => {
    try {
      const authOptions = await getAuthFetchOptions({
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      const response = await fetch(`${API_BASE_URL}/me/addresses/${addressId}`, authOptions);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update address.');
      }
      return result.data;
    } catch (error) {
      console.error(`Error updating address ${addressId}:`, error);
      throw error;
    }
  };
  
  /**
   * Deletes an address for the current authenticated user.
   * @param addressId - The unique identifier of the address to delete.
   * @returns A promise that resolves when the deletion is successful.
   * @throws Will throw an error if the API request fails.
   */
  export const deleteAddress = async (addressId: string): Promise<void> => {
    try {
      const authOptions = await getAuthFetchOptions({
        method: 'DELETE',
      });
      const response = await fetch(`${API_BASE_URL}/me/addresses/${addressId}`, authOptions);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete address.');
      }
    } catch (error) {
      console.error(`Error deleting address ${addressId}:`, error);
      throw error;
    }
  };

/**
 * Creates a new address for the current authenticated user.
 * This function is typically called during checkout when a new address is entered.
 * @param addressData The details of the new address.
 * @returns A promise that resolves to the newly created address object.
 * @throws Will throw an error if the request fails.
 */
export const createAddress = async (addressData: {
    recipientName: string;
    phone: string;
    country: string; // ID
    county: string;  // ID
    city: string;    // ID
    streetAddress: string;
    isDefault?: boolean;
}): Promise<IAddress> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(addressData),
        });
        // Assumes API endpoint at /api/me/addresses handles POST to create new address
        const response = await fetch(`${API_BASE_URL}/me/addresses`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to save new address.');
        }
        return result.data;
    } catch (error) {
        console.error("Error in createAddress:", error);
        throw error;
    }
};

/**
 * Submits the checkout form data to create a new order.
 * @param payload - The data required to create an order, including a reference to the shipping address.
 * @returns A promise that resolves to the newly created order object.
 * @throws Will throw an error if the API request fails.
 */
export const placeOrder = async (payload: {
    addressId: string; // MODIFICATION: Now requires a specific address ID.
    paymentMethod: string;
    voucherCode?: string;
}): Promise<IOrder> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const response = await fetch(`${API_BASE_URL}/orders`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to place order.');
        }
        return result.data;
    } catch (error) {
        console.error("Error in placeOrder:", error);
        throw error;
    }
};

// =================================================================
// LOCATION HIERARCHY FUNCTIONS (Public)
// =================================================================

/**
 * Fetches all available countries.
 * @returns A promise that resolves to an array of country objects.
 * @throws Will throw an error if the request fails.
 */
export const fetchCountries = async (): Promise<ICountry[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/locations/countries`);
        if (!res.ok) throw new Error('Failed to fetch countries');
        const result: SingleResourceApiResponse<ICountry[]> = await res.json();
        return result.data;
    } catch (error) {
        console.error("Error in fetchCountries:", error);
        throw error;
    }
}

/**
 * Fetches all counties for a given country ID.
 * @param countryId - The unique identifier of the parent country.
 * @returns A promise that resolves to an array of county objects.
 * @throws Will throw an error if the request fails.
 */
export const fetchCountiesByCountry = async (countryId: string): Promise<ICounty[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/locations/countries/${countryId}/counties`);
        if (!res.ok) throw new Error('Failed to fetch counties');
        const result: SingleResourceApiResponse<ICounty[]> = await res.json();
        return result.data;
    } catch (error) {
        console.error("Error in fetchCountiesByCountry:", error);
        throw error;
    }
}

/**
 * Fetches all cities for a given county ID.
 * @param countyId - The unique identifier of the parent county.
 * @returns A promise that resolves to an array of city objects.
 * @throws Will throw an error if the request fails.
 */
export const fetchCitiesByCounty = async (countyId: string): Promise<ICity[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/locations/counties/${countyId}/cities`);
        if (!res.ok) throw new Error('Failed to fetch cities');
        const result: SingleResourceApiResponse<ICity[]> = await res.json();
        return result.data;
    } catch (error) {
        console.error("Error in fetchCitiesByCounty:", error);
        throw error;
    }
}

// =================================================================
// ADMIN-SPECIFIC FUNCTIONS (Authentication Required)
// =================================================================

/**
 * The structure of the analytics data for the admin dashboard.
 */
export interface AdminAnalyticsData {
  stats: {
      totalRevenue: number;
      totalSales: number;
      newCustomers: number;
      activeProducts: number;
  };
  revenueOverTime: { date: string; revenue: number }[];
  recentOrders: IOrder[];
}

/**
* Fetches all analytics data for the admin dashboard.
* @returns A promise that resolves to the complete analytics data object.
* @throws Will throw an error if the request fails.
*/
export const fetchAdminAnalytics = async (): Promise<AdminAnalyticsData> => {
  try {
      const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, authOptions);
      if (!response.ok) {
          throw new Error(`Failed to fetch admin analytics: ${response.statusText}`);
      }
      return await response.json();
  } catch (error) {
      console.error("Error in fetchAdminAnalytics:", error);
      throw error;
  }
}

/**
 * The structure of a paginated API response for admin resource management.
 * @template T The type of the resource data.
 */
export interface AdminPaginatedApiResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

/** Specific type for the admin products paginated response. */
export type AdminProductsApiResponse = AdminPaginatedApiResponse<IProduct>;
/** Specific type for the admin orders paginated response. */
export type AdminOrdersApiResponse = AdminPaginatedApiResponse<IOrder>;
/** Specific type for the admin users paginated response. */
export type AdminUsersApiResponse = AdminPaginatedApiResponse<IUser>;

/**
 * Fetches products for the admin panel with pagination and search.
 * @param params - Options for pagination and searching.
 * @returns A promise that resolves to a paginated list of products.
 * @throws Will throw an error if the request fails.
 */
export const fetchAdminProducts = async (params: { page?: number, limit?: number, searchQuery?: string }): Promise<AdminPaginatedApiResponse<IProduct>> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);
        
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/products?${queryParams.toString()}`, authOptions);
        if (!response.ok) throw new Error('Failed to fetch admin products.');
        return await response.json();
    } catch (error) { console.error(error); throw error; }
}

/**
 * Creates a new product from the admin panel.
 * @param productData - The initial data for the new product.
 * @returns A promise that resolves to the newly created product.
 * @throws Will throw an error if the request fails.
 */
export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(productData)
        });
        const response = await fetch(`${API_BASE_URL}/admin/products`, authOptions);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create product.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

/**
 * Updates an existing product from the admin panel.
 * @param productId - The unique identifier of the product to update.
 * @param productData - The data fields to update.
 * @returns A promise that resolves to the updated product.
 * @throws Will throw an error if the request fails.
 */
export const updateProduct = async (productId: string, productData: Partial<IProduct>): Promise<IProduct> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'PATCH',
            body: JSON.stringify(productData)
        });
        const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, authOptions);
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update product.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

/**
 * Creates a new brand from the admin panel.
 * @param brandData - The data for the new brand (requires at least a name).
 * @returns A promise that resolves to the newly created brand.
 * @throws Will throw an error if the request fails.
 */
export const createBrand = async (brandData: Partial<IBrand>): Promise<IBrand> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(brandData)
        });
        const response = await fetch(`${API_BASE_URL}/admin/brands`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create brand.');
        }
        return result.data;
    } catch (error) {
        console.error("Error in createBrand:", error);
        throw error;
    }
}

/**
 * Fetches orders for the admin panel with pagination and status filtering.
 * @param params - Options for pagination and filtering by delivery and/or payment status.
 * @returns A promise that resolves to a paginated list of orders.
 * @throws Will throw an error if the request fails.
 */
export const fetchAdminOrders = async (params: {
    page?: number;
    limit?: number;
    deliveryStatus?: string;
    paymentStatus?: string;
}): Promise<AdminPaginatedApiResponse<IOrder>> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        // --- FIX: Add both delivery and payment status to query parameters ---
        if (params.deliveryStatus && params.deliveryStatus !== 'all') {
            queryParams.append('deliveryStatus', params.deliveryStatus);
        }
        if (params.paymentStatus && params.paymentStatus !== 'all') {
            queryParams.append('paymentStatus', params.paymentStatus);
        }
        
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/orders?${queryParams.toString()}`, authOptions);
        if (!response.ok) throw new Error('Failed to fetch admin orders.');
        return await response.json();
    } catch (error) { 
        console.error("Error in fetchAdminOrders:", error);
        throw error; 
    }
}

/**
 * Updates an order's status from the admin panel.
 * Can update delivery status, payment status, or add a timeline event.
 * @param orderId - The user-facing ID of the order (e.g., "ORD-12345").
 * @param payload - The data to update, containing `status` and/or `paymentStatus`.
 * @returns A promise that resolves to the updated order object.
 * @throws Will throw an error if the request fails.
 */
export const updateAdminOrder = async (
    orderId: string,
    // --- FIX: Expanded payload to include paymentStatus ---
    payload: {
      status?: IOrder["status"];
      paymentStatus?: IOrder["payment"]["status"];
      timelineEvent?: any;
    }
  ): Promise<IOrder> => {
    try {
      const authOptions = await getAuthFetchOptions({
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const response = await fetch(
        `${API_BASE_URL}/admin/orders/${orderId}`,
        authOptions
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update order.");
      }
      return result.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  };

/**
 * Fetches users for the admin panel with pagination and search.
 * @param params - Options for pagination and searching.
 * @returns A promise that resolves to a paginated list of users.
 * @throws Will throw an error if the request fails.
 */
export const fetchAdminUsers = async (params: { page?: number, limit?: number, searchQuery?: string }): Promise<AdminPaginatedApiResponse<IUser>> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);
        
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams.toString()}`, authOptions);
        if (!response.ok) throw new Error('Failed to fetch admin users.');
        return await response.json();
    } catch (error) { console.error(error); throw error; }
}

/**
 * Updates a user's role from the admin panel.
 * @param userId - The unique identifier of the user to update.
 * @param role - The new role to assign ('user' or 'admin').
 * @returns A promise that resolves to the updated user object.
 * @throws Will throw an error if the request fails.
 */
export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<IUser> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'PATCH',
            body: JSON.stringify({ role })
        });
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update user role.');
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Fetches all vouchers for the admin panel.
 * @returns A promise that resolves to a list of all vouchers.
 * @throws Will throw an error if the request fails.
 */
export const fetchAdminVouchers = async (): Promise<AdminVouchersApiResponse> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/vouchers`, authOptions);
        if (!response.ok) {
            throw new Error('Failed to fetch admin vouchers.');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Creates a new voucher from the admin panel.
 * @param voucherData - The initial data for the new voucher.
 * @returns A promise that resolves to the newly created voucher.
 * @throws Will throw an error if the request fails.
 */
export const createVoucher = async (voucherData: Partial<IVoucher>): Promise<IVoucher> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(voucherData)
        });
        const response = await fetch(`${API_BASE_URL}/admin/vouchers`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create voucher.');
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Updates an existing voucher from the admin panel.
 * @param voucherId - The unique identifier of the voucher to update.
 * @param voucherData - The data fields to update.
 * @returns A promise that resolves to the updated voucher.
 * @throws Will throw an error if the request fails.
 */
export const updateVoucher = async (voucherId: string, voucherData: Partial<IVoucher>): Promise<IVoucher> => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'PATCH',
            body: JSON.stringify(voucherData)
        });
        const response = await fetch(`${API_BASE_URL}/admin/vouchers/${voucherId}`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update voucher.');
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// --- Admin Location Management Functions ---

/**
 * Fetches all countries for the admin location management panel.
 * @returns A promise resolving to an array of all countries.
 */
export const fetchAdminCountries = async (): Promise<ICountry[]> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/locations/countries`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch countries');
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Fetches all counties for the admin location management panel.
 * @returns A promise resolving to an array of all counties.
 */
export const fetchAdminCounties = async (): Promise<ICounty[]> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/locations/counties`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch counties');
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Fetches all cities for the admin location management panel.
 * @returns A promise resolving to an array of all cities.
 */
export const fetchAdminCities = async (): Promise<ICity[]> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await fetch(`${API_BASE_URL}/admin/locations/cities`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch cities');
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * A generic helper function to create a new location entity.
 * @param type - The type of location to create ('countries', 'counties', 'cities').
 * @param data - The payload for creating the new location.
 * @returns The newly created location object.
 */
const createLocation = async (type: 'countries' | 'counties' | 'cities', data: any) => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'POST',
            body: JSON.stringify(data)
        });
        const response = await fetch(`${API_BASE_URL}/admin/locations/${type}`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to create ${type}`);
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createCountry = (data: { name: string, isActive: boolean }) => createLocation('countries', data);
export const createCounty = (data: { name: string, country: string, isActive: boolean }) => createLocation('counties', data);
export const createCity = (data: { name: string, county: string, deliveryFee: number, isActive: boolean }) => createLocation('cities', data);

/**
 * A generic helper function to update an existing location entity.
 * @param type - The type of location to update.
 * @param id - The ID of the location to update.
 * @param data - The payload containing the fields to update.
 * @returns The updated location object.
 */
const updateLocation = async (type: 'countries' | 'counties' | 'cities', id: string, data: any) => {
    try {
        const authOptions = await getAuthFetchOptions({
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        const response = await fetch(`${API_BASE_URL}/admin/locations/${type}/${id}`, authOptions);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to update ${type}`);
        }
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const updateCountry = (id: string, data: Partial<ICountry>) => updateLocation('countries', id, data);
export const updateCounty = (id: string, data: Partial<ICounty>) => updateLocation('counties', id, data);
export const updateCity = (id: string, data: Partial<ICity>) => updateLocation('cities', id, data);