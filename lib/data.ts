import { IProduct, IBrand, IOrder, IAddress, IReview, ICart, ICity, ICounty, ICountry, IUser, IVoucher } from "@/types";

/**
 * The base URL for all API requests, configured via environment variables.
 */
const API_BASE_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api`;

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
// PUBLIC DATA FETCHING FUNCTIONS
// =================================================================

/**
 * Fetches a paginated and filtered list of products from the API.
 * @param params - An object containing filter, sort, and pagination options.
 * @returns A promise that resolves to the product API response.
 * @throws Will throw an error if the network request fails or the API returns an error status.
 */
export const fetchProducts = async (params: FetchProductsParams): Promise<ProductApiResponse> => {
  const queryParams = new URLSearchParams();

  // Append non-empty parameters to the query string
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
            // Use Next.js Incremental Static Regeneration (ISR) to re-fetch data periodically.
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
 * Fetches a single order by its user-facing ID.
 * Assumes the request is authenticated, as the underlying API endpoint is protected.
 * @param orderId - The user-facing ID of the order.
 * @returns A promise that resolves to the order object, or null if not found.
 * @throws Will throw an error if the network request fails or the API returns a server error.
 */
export const fetchOrderById = async (orderId: string): Promise<IOrder | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);

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

    const response = await fetch(`${API_BASE_URL}/orders?${queryParams.toString()}`);
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
        const response = await fetch(`${API_BASE_URL}/me/addresses`);
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
  
        const response = await fetch(`${API_BASE_URL}/me/reviews?${queryParams.toString()}`);
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
      const response = await fetch(`${API_BASE_URL}/me/favourites`);
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
      const response = await fetch(`${API_BASE_URL}/cart`, {
          // Disable caching to ensure the most up-to-date cart state is retrieved.
          cache: 'no-store',
      });
      // A 404 status is expected if a user has not yet created a cart.
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
* Adds a new product to the cart or updates the quantity if it already exists.
* @param productId - The unique identifier of the product to add.
* @param quantity - The number of units to add.
* @returns A promise that resolves to the updated cart object.
* @throws Will throw an error if the API request fails.
*/
export const addToCart = async (productId: string, quantity: number): Promise<ICart> => {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
        });
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
* @returns A promise that resolves to the updated cart object.
* @throws Will throw an error if the API request fails.
*/
export const updateCartItem = async (productId: string, quantity: number): Promise<ICart> => {
  try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
      });
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
* @returns A promise that resolves to the updated cart object.
* @throws Will throw an error if the API request fails.
*/
export const removeCartItem = async (productId: string): Promise<ICart> => {
  try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
      });
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
// REVIEW & ORDER MUTATION FUNCTIONS
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
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
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
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });
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
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
          method: 'DELETE',
      });
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
 * Submits the checkout form data to create a new order.
 * @param payload - The data required to create an order, including shipping and payment details.
 * @returns A promise that resolves to the newly created order object.
 * @throws Will throw an error if the API request fails.
 */
export const placeOrder = async (payload: {
    shippingDetails: { name: string; email: string; phone: string; address: string; };
    paymentMethod: string;
    cityId: string;
}): Promise<IOrder> => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
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
// LOCATION HIERARCHY FUNCTIONS
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
// ADMIN-SPECIFIC FUNCTIONS
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
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, { cache: 'no-store' });
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
        
        const response = await fetch(`${API_BASE_URL}/admin/products?${queryParams.toString()}`, { cache: 'no-store' });
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
        const response = await fetch(`${API_BASE_URL}/admin/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
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
        const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update product.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

/**
 * Fetches orders for the admin panel with pagination and status filtering.
 * @param params - Options for pagination and filtering.
 * @returns A promise that resolves to a paginated list of orders.
 * @throws Will throw an error if the request fails.
 */
export const fetchAdminOrders = async (params: { page?: number, limit?: number, status?: string }): Promise<AdminPaginatedApiResponse<IOrder>> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        
        const response = await fetch(`${API_BASE_URL}/admin/orders?${queryParams.toString()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch admin orders.');
        return await response.json();
    } catch (error) { console.error(error); throw error; }
}

/**
 * Updates an order's status or adds a timeline event from the admin panel.
 * @param orderId - The user-facing ID of the order (e.g., "ORD-12345").
 * @param payload - The data to update, such as `status` or a new `timelineEvent`.
 * @returns A promise that resolves to the updated order object.
 * @throws Will throw an error if the request fails.
 */
export const updateAdminOrder = async (orderId: string, payload: { status?: IOrder['status'], timelineEvent?: any }): Promise<IOrder> => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update order.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

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
        
        const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams.toString()}`, { cache: 'no-store' });
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
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update user role.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

/**
 * Fetches all vouchers for the admin panel.
 * @returns A promise that resolves to a list of all vouchers.
 * @throws Will throw an error if the request fails.
 */
export const fetchAdminVouchers = async (): Promise<AdminVouchersApiResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/vouchers`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch admin vouchers.');
        return await response.json();
    } catch (error) { console.error(error); throw error; }
}

/**
 * Creates a new voucher from the admin panel.
 * @param voucherData - The initial data for the new voucher.
 * @returns A promise that resolves to the newly created voucher.
 * @throws Will throw an error if the request fails.
 */
export const createVoucher = async (voucherData: Partial<IVoucher>): Promise<IVoucher> => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/vouchers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create voucher.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
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
        const response = await fetch(`${API_BASE_URL}/admin/vouchers/${voucherId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update voucher.');
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

// --- Admin Location Management Functions ---

/**
 * Fetches all countries for the admin location management panel.
 * @returns A promise resolving to an array of all countries.
 */
export const fetchAdminCountries = async (): Promise<ICountry[]> => {
    const res = await fetch(`${API_BASE_URL}/admin/locations/countries`, { cache: 'no-store' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to fetch countries');
    return result.data;
}

/**
 * Fetches all counties for the admin location management panel.
 * @returns A promise resolving to an array of all counties.
 */
export const fetchAdminCounties = async (): Promise<ICounty[]> => {
    const res = await fetch(`${API_BASE_URL}/admin/locations/counties`, { cache: 'no-store' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to fetch counties');
    return result.data;
}

/**
 * Fetches all cities for the admin location management panel.
 * @returns A promise resolving to an array of all cities.
 */
export const fetchAdminCities = async (): Promise<ICity[]> => {
    const res = await fetch(`${API_BASE_URL}/admin/locations/cities`, { cache: 'no-store' });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to fetch cities');
    return result.data;
}

/**
 * A generic helper function to create a new location entity.
 * @param type - The type of location to create ('countries', 'counties', 'cities').
 * @param data - The payload for creating the new location.
 * @returns The newly created location object.
 */
const createLocation = async (type: 'countries' | 'counties' | 'cities', data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/locations/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Failed to create ${type}`);
    return result.data;
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
    const response = await fetch(`${API_BASE_URL}/admin/locations/${type}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Failed to update ${type}`);
    return result.data;
}

export const updateCountry = (id: string, data: Partial<ICountry>) => updateLocation('countries', id, data);
export const updateCounty = (id: string, data: Partial<ICounty>) => updateLocation('counties', id, data);
export const updateCity = (id: string, data: Partial<ICity>) => updateLocation('cities', id, data);