import { IProduct, IBrand, IOrder, IAddress, IReview, ICart, ICity, ICounty, ICountry, IUser, IVoucher } from "@/types";

/**
 * @file Robust API data fetching utilities for the Next.js application.
 *
 * This file contains a centralized set of functions for interacting with the application's internal API routes.
 * It employs a `serverSafeFetch` wrapper to ensure that requests work seamlessly across server-side
 * (RSC, Server Actions) and client-side environments, avoiding common pitfalls with environment variables
 * and server-to-server fetch requests.
 */

/**
 * The base path for all internal API requests. Using a relative path is crucial.
 */
const API_BASE_PATH = '/api';

/**
 * A server-safe fetch wrapper for internal API calls.
 * 
 * On the server (during SSR, in RSCs, or Server Actions), it constructs a full absolute URL 
 * using request headers to satisfy the strict requirements of the Node.js fetch implementation.
 * On the client, it uses a relative path, which the browser handles correctly and efficiently.
 * 
 * This approach solves two common problems:
 * 1. `TypeError: Failed to parse URL` on the server when using relative paths.
 * 2. `Unauthorized` errors from WAFs/bot protection that block server-to-server requests using full URLs.
 * 
 * @param path The relative path for the API endpoint (e.g., '/products?page=1').
 * @param options The standard RequestInit options for fetch.
 * @returns A Promise that resolves to the Response object.
 */
async function serverSafeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  // Check if we are executing on the server
  if (typeof window === 'undefined') {
    // On the server, we need to construct an absolute URL
    try {
      const { headers } = await import('next/headers');
      const host = (await headers()).get('host');
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      const absoluteUrl = `${protocol}://${host}${path}`;

      // Use the absolute URL for the server-side fetch
      return fetch(absoluteUrl, options);
    } catch (error) {
      console.warn('Could not import next/headers or get host header. Falling back to relative path.', error);
      // Fallback to relative path if headers can't be accessed
      return fetch(path, options);
    }
  }

  // On the client, a relative path is sufficient and preferred
  return fetch(path, options);
}

/**
 * Creates the options object for an authenticated fetch request.
 * It dynamically retrieves cookies from the incoming request on the server and forwards them,
 * allowing API routes to identify the user's session.
 *
 * @param options - The original `fetch` options (e.g., method, body).
 * @returns A new `RequestInit` options object with the authentication cookie header.
 */
const getAuthFetchOptions = async (options: RequestInit = {}): Promise<RequestInit> => {
    const requestHeaders: Record<string, string> = { ...options.headers as Record<string, string> };
    
    // This logic only runs on the server
    if (typeof window === 'undefined') {
        try {
            const { cookies } = await import('next/headers');
            const cookieHeader = cookies().toString();
            
            if (cookieHeader) {
                requestHeaders['Cookie'] = cookieHeader;
            }
        } catch (error) {
            console.warn('Could not get cookies for server-side authenticated fetch. This might be expected if not in a request context.', error);
        }
    }

    if (options.body && !requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    return { ...options, headers: requestHeaders };
};

/**
 * A robust response handler that reads the body only once.
 * - On success (2xx status), it parses the body as JSON.
 * - On failure (non-2xx status), it reads the body as text to include in the thrown error.
 * @param response The Response object from a fetch call.
 * @returns A promise that resolves to the parsed JSON data.
 * @throws Will throw a detailed error if the response is not ok.
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        // Read the error body as text once.
        const errorText = await response.text();
        // Throw an error with all available details.
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    // On success, read the body as JSON once.
    return response.json();
}

// =================================================================
// API RESPONSE & PAYLOAD TYPES
// =================================================================
export interface FetchProductsParams { page?: number; limit?: number; brand?: string; condition?: "new" | "used" | "restored" | ""; sortBy?: "price" | "createdAt" | "rating"; order?: "asc" | "desc"; searchQuery?: string; }
export interface ProductApiResponse { message: string; data: IProduct[]; totalPages: number; currentPage: number; totalProducts: number; }
export interface BrandApiResponse { message: string; data: IBrand[]; }
export interface SingleResourceApiResponse<T> { message: string; data: T; }
export interface MyOrdersApiResponse { message: string; data: IOrder[]; totalPages: number; currentPage: number; totalOrders: number; }
export interface MyAddressesApiResponse { message: string; data: IAddress[]; }
export interface MyReviewsApiResponse { message: string; data: IReview[]; totalPages: number; currentPage: number; totalReviews: number; }
export interface FavouritesApiResponse { message: string; data: IProduct[]; }
export interface ReviewsApiResponse { message: string; data: IReview[]; totalPages: number; currentPage: number; totalReviews: number; }
export interface AdminVouchersApiResponse { message:string; data: IVoucher[]; }
export interface AdminAnalyticsData { stats: { totalRevenue: number; totalSales: number; newCustomers: number; activeProducts: number; }; revenueOverTime: { date: string; revenue: number }[]; recentOrders: IOrder[]; }
export interface AdminPaginatedApiResponse<T> { data: T[]; totalPages: number; currentPage: number; }
export type AdminProductsApiResponse = AdminPaginatedApiResponse<IProduct>;
export type AdminOrdersApiResponse = AdminPaginatedApiResponse<IOrder>;
export type AdminUsersApiResponse = AdminPaginatedApiResponse<IUser>;

// =================================================================
// PUBLIC DATA FETCHING FUNCTIONS
// =================================================================

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
    const response = await serverSafeFetch(`${API_BASE_PATH}/products?${queryParams.toString()}`);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    throw error;
  }
};

export const fetchBrands = async (): Promise<IBrand[]> => {
  try {
    const response = await serverSafeFetch(`${API_BASE_PATH}/brands`);
    const result: BrandApiResponse = await handleResponse(response);
    return result.data;
  } catch (error) {
    console.error("Error in fetchBrands:", error);
    throw error;
  }
};

export const fetchProductBySlug = async (slug: string): Promise<IProduct | null> => {
    try {
        const response = await serverSafeFetch(`${API_BASE_PATH}/products/${slug}`, { next: { revalidate: 60 } });
        if (response.status === 404) return null;
        const result: SingleResourceApiResponse<IProduct> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(`Error fetching product by slug ${slug}:`, error);
        throw error;
    }
};

export const fetchReviewsByProduct = async (productId: string, params: { page?: number, limit?: number }): Promise<ReviewsApiResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        const response = await serverSafeFetch(`${API_BASE_PATH}/products/${productId}/reviews?${queryParams.toString()}`);
        return await handleResponse(response);
    } catch (error) {
        console.error(`Error fetching reviews for product ${productId}:`, error);
        throw error;
    }
};

export const fetchProductSuggestions = async (searchQuery: string): Promise<IProduct[]> => {
  try {
      const response = await serverSafeFetch(`${API_BASE_PATH}/products?searchQuery=${searchQuery}&limit=5`);
      if (!response.ok) return [];
      const result: ProductApiResponse = await response.json();
      return result.data;
  } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
  }
}

export const fetchRandomPromotionalVoucher = async (): Promise<IVoucher | null> => {
    try {
      const response = await serverSafeFetch(`${API_BASE_PATH}/vouchers/random`, { cache: 'no-store' });
      if (!response.ok) return null;
      const result: SingleResourceApiResponse<IVoucher | null> = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error in fetchRandomPromotionalVoucher:", error);
      return null;
    }
};

// =================================================================
// AUTHENTICATED USER FUNCTIONS
// =================================================================

export const fetchOrderById = async (orderId: string): Promise<IOrder | null> => {
  try {
    const authOptions = await getAuthFetchOptions();
    const response = await serverSafeFetch(`${API_BASE_PATH}/orders/${orderId}`, authOptions);
    if (response.status === 404) return null;
    const result: SingleResourceApiResponse<IOrder> = await handleResponse(response);
    return result.data;
  } catch (error) {
    console.error(`Error in fetchOrderById for ID ${orderId}:`, error);
    throw error;
  }
};

export const fetchMyOrders = async (params: { limit?: number; page?: number; status?: string; }): Promise<MyOrdersApiResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    const authOptions = await getAuthFetchOptions();
    const response = await serverSafeFetch(`${API_BASE_PATH}/orders?${queryParams.toString()}`, authOptions);
    return await handleResponse(response);
  } catch (error) {
    console.error("Error in fetchMyOrders:", error);
    throw error;
  }
};

export const fetchMyAddresses = async (): Promise<IAddress[]> => {
    try {
        const authOptions = await getAuthFetchOptions();
        const response = await serverSafeFetch(`${API_BASE_PATH}/me/addresses`, authOptions);
        const result: MyAddressesApiResponse = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error("Error in fetchMyAddresses:", error);
        throw error;
    }
};

export const fetchMyReviews = async (params: { limit?: number; page?: number; rating?: number; }): Promise<MyReviewsApiResponse> => {
     try {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.rating) queryParams.append('rating', params.rating.toString());
        const authOptions = await getAuthFetchOptions();
        const response = await serverSafeFetch(`${API_BASE_PATH}/me/reviews?${queryParams.toString()}`, authOptions);
        return await handleResponse(response);
    } catch (error) {
        console.error("Error in fetchMyReviews:", error);
        throw error;
    }
}

export const fetchMyFavourites = async (): Promise<IProduct[]> => {
  try {
      const authOptions = await getAuthFetchOptions();
      const response = await serverSafeFetch(`${API_BASE_PATH}/me/favourites`, authOptions);
      const result: FavouritesApiResponse = await handleResponse(response);
      return result.data;
  } catch (error) {
      console.error("Error in fetchMyFavourites:", error);
      throw error;
  }
}

export const addToFavourites = async (productId: string): Promise<void> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify({ productId }) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/me/favourites`, authOptions);
        await handleResponse(response);
    } catch (error) {
        console.error(`Error in addToFavourites for product ${productId}:`, error);
        throw error;
    }
};

export const removeFromFavourites = async (productId: string): Promise<void> => {
    try {
      const authOptions = await getAuthFetchOptions({ method: 'DELETE', body: JSON.stringify({ productId }) });
      const response = await serverSafeFetch(`${API_BASE_PATH}/me/favourites`, authOptions);
      await handleResponse(response);
    } catch (error) {
      console.error(`Error in removeFromFavourites for product ${productId}:`, error);
      throw error;
    }
};

export const updateMyDetails = async (payload: { name?: string; phone?: string }): Promise<void> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify(payload) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/me`, authOptions);
        await handleResponse(response);
    } catch (error) {
        console.error("Error in updateMyDetails:", error);
        throw error;
    }
};
  
// =================================================================
// CART & CHECKOUT FUNCTIONS
// =================================================================

export const getCart = async (): Promise<ICart | null> => {
  try {
      const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
      const response = await serverSafeFetch(`${API_BASE_PATH}/cart`, authOptions);
      if (response.status === 404) return null;
      const result: SingleResourceApiResponse<ICart> = await handleResponse(response);
      return result.data;
  } catch (error) {
      console.error("Error in getCart:", error);
      throw error;
  }
};

export const addToCart = async (productId: string, quantity: number, variantId?: string): Promise<ICart> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify({ productId, quantity, variantId }) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/cart`, authOptions);
        const result: SingleResourceApiResponse<ICart> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(`Error in addToCart for product ${productId}:`, error);
        throw error;
    }
};

export const updateCartItem = async (productId: string, quantity: number, variantId?: string): Promise<ICart> => {
  try {
      const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify({ productId, quantity, variantId }) });
      const response = await serverSafeFetch(`${API_BASE_PATH}/cart`, authOptions);
      const result: SingleResourceApiResponse<ICart> = await handleResponse(response);
      return result.data;
  } catch (error) {
      console.error(`Error in updateCartItem for product ${productId}:`, error);
      throw error;
  }
};

export const removeCartItem = async (productId: string, variantId?: string): Promise<ICart> => {
  try {
      const authOptions = await getAuthFetchOptions({ method: 'DELETE', body: JSON.stringify({ productId, variantId }) });
      const response = await serverSafeFetch(`${API_BASE_PATH}/cart`, authOptions);
      const result: SingleResourceApiResponse<ICart> = await handleResponse(response);
      return result.data;
  } catch (error) {
      console.error(`Error in removeCartItem for product ${productId}:`, error);
      throw error;
  }
};

export const submitReview = async (productId: string, data: { rating: number, title: string, text: string }): Promise<IReview> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(data) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/products/${productId}/reviews`, authOptions);
        const result: SingleResourceApiResponse<IReview> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(`Error submitting review for product ${productId}:`, error);
        throw error;
    }
};

export const updateReview = async (reviewId: string, data: { title: string; text: string; rating: number }): Promise<IReview> => {
  try {
      const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify(data) });
      const response = await serverSafeFetch(`${API_BASE_PATH}/reviews/${reviewId}`, authOptions);
      const result: SingleResourceApiResponse<IReview> = await handleResponse(response);
      return result.data;
  } catch (error) {
      console.error(`Error in updateReview for ID ${reviewId}:`, error);
      throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
      const authOptions = await getAuthFetchOptions({ method: 'DELETE' });
      const response = await serverSafeFetch(`${API_BASE_PATH}/reviews/${reviewId}`, authOptions);
      await handleResponse(response);
  } catch (error) {
      console.error(`Error in deleteReview for ID ${reviewId}:`, error);
      throw error;
  }
};

export const validateVoucher = async (code: string): Promise<IVoucher> => {
    try {
        const response = await serverSafeFetch(`${API_BASE_PATH}/vouchers/${code.toUpperCase()}`);
        const result: SingleResourceApiResponse<IVoucher> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(`Error validating voucher ${code}:`, error);
        throw error;
    }
};

export const updateAddress = async (addressId: string, data: Partial<IAddress>): Promise<IAddress> => {
    try {
      const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify(data) });
      const response = await serverSafeFetch(`${API_BASE_PATH}/me/addresses/${addressId}`, authOptions);
      const result: SingleResourceApiResponse<IAddress> = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error updating address ${addressId}:`, error);
      throw error;
    }
};
  
export const deleteAddress = async (addressId: string): Promise<void> => {
    try {
      const authOptions = await getAuthFetchOptions({ method: 'DELETE' });
      const response = await serverSafeFetch(`${API_BASE_PATH}/me/addresses/${addressId}`, authOptions);
      await handleResponse(response);
    } catch (error) {
      console.error(`Error deleting address ${addressId}:`, error);
      throw error;
    }
};

export const createAddress = async (addressData: { recipientName: string; phone: string; country: string; county: string; city: string; streetAddress: string; isDefault?: boolean; }): Promise<IAddress> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(addressData) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/me/addresses`, authOptions);
        const result: SingleResourceApiResponse<IAddress> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error("Error in createAddress:", error);
        throw error;
    }
};

export const placeOrder = async (payload: { addressId: string; paymentMethod: string; voucherCode?: string; }): Promise<IOrder> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(payload) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/orders`, authOptions);
        const result: SingleResourceApiResponse<IOrder> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error("Error in placeOrder:", error);
        throw error;
    }
};

// =================================================================
// LOCATION HIERARCHY FUNCTIONS
// =================================================================

export const fetchCountries = async (): Promise<ICountry[]> => {
    try {
        const res = await serverSafeFetch(`${API_BASE_PATH}/locations/countries`);
        const result: SingleResourceApiResponse<ICountry[]> = await handleResponse(res);
        return result.data;
    } catch (error) { console.error("Error in fetchCountries:", error); throw error; }
}

export const fetchCountiesByCountry = async (countryId: string): Promise<ICounty[]> => {
    try {
        const res = await serverSafeFetch(`${API_BASE_PATH}/locations/countries/${countryId}/counties`);
        const result: SingleResourceApiResponse<ICounty[]> = await handleResponse(res);
        return result.data;
    } catch (error) { console.error("Error in fetchCountiesByCountry:", error); throw error; }
}

export const fetchCitiesByCounty = async (countyId: string): Promise<ICity[]> => {
    try {
        const res = await serverSafeFetch(`${API_BASE_PATH}/locations/counties/${countyId}/cities`);
        const result: SingleResourceApiResponse<ICity[]> = await handleResponse(res);
        return result.data;
    } catch (error) { console.error("Error in fetchCitiesByCounty:", error); throw error; }
}

// =================================================================
// ADMIN-SPECIFIC FUNCTIONS
// =================================================================

export const fetchAdminAnalytics = async (): Promise<AdminAnalyticsData> => {
  try {
      const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
      const response = await serverSafeFetch(`${API_BASE_PATH}/admin/analytics`, authOptions);
      return await handleResponse(response);
  } catch (error) {
      console.error("Error in fetchAdminAnalytics:", error);
      throw error;
  }
}

export const fetchAdminProducts = async (params: { page?: number, limit?: number, searchQuery?: string }): Promise<AdminProductsApiResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/products?${queryParams.toString()}`, authOptions);
        return await handleResponse(response);
    } catch (error) { console.error(error); throw error; }
}

export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(productData) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/products`, authOptions);
        const result: SingleResourceApiResponse<IProduct> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

export const updateProduct = async (productId: string, productData: Partial<IProduct>): Promise<IProduct> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify(productData) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/products/${productId}`, authOptions);
        const result: SingleResourceApiResponse<IProduct> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

export const createBrand = async (brandData: Partial<IBrand>): Promise<IBrand> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(brandData) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/brands`, authOptions);
        const result: SingleResourceApiResponse<IBrand> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error("Error in createBrand:", error);
        throw error;
    }
}

export const fetchAdminOrders = async (params: { page?: number; limit?: number; deliveryStatus?: string; paymentStatus?: string; }): Promise<AdminOrdersApiResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.deliveryStatus && params.deliveryStatus !== 'all') queryParams.append('deliveryStatus', params.deliveryStatus);
        if (params.paymentStatus && params.paymentStatus !== 'all') queryParams.append('paymentStatus', params.paymentStatus);
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/orders?${queryParams.toString()}`, authOptions);
        return await handleResponse(response);
    } catch (error) { 
        console.error("Error in fetchAdminOrders:", error);
        throw error; 
    }
}

export const updateAdminOrder = async (orderId: string, payload: { status?: IOrder["status"]; paymentStatus?: IOrder["payment"]["status"]; timelineEvent?: any; }): Promise<IOrder> => {
    try {
      const authOptions = await getAuthFetchOptions({ method: "PATCH", body: JSON.stringify(payload) });
      const response = await serverSafeFetch(`${API_BASE_PATH}/admin/orders/${orderId}`, authOptions);
      const result: SingleResourceApiResponse<IOrder> = await handleResponse(response);
      return result.data;
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
};

export const fetchAdminUsers = async (params: { page?: number, limit?: number, searchQuery?: string }): Promise<AdminUsersApiResponse> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/users?${queryParams.toString()}`, authOptions);
        return await handleResponse(response);
    } catch (error) { console.error(error); throw error; }
}

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<IUser> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify({ role }) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/users/${userId}`, authOptions);
        const result: SingleResourceApiResponse<IUser> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const fetchAdminVouchers = async (): Promise<AdminVouchersApiResponse> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/vouchers`, authOptions);
        return await handleResponse(response);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const createVoucher = async (voucherData: Partial<IVoucher>): Promise<IVoucher> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(voucherData) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/vouchers`, authOptions);
        const result: SingleResourceApiResponse<IVoucher> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const updateVoucher = async (voucherId: string, voucherData: Partial<IVoucher>): Promise<IVoucher> => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify(voucherData) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/vouchers/${voucherId}`, authOptions);
        const result: SingleResourceApiResponse<IVoucher> = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const fetchAdminCountries = async (): Promise<ICountry[]> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/locations/countries`, authOptions);
        const result: SingleResourceApiResponse<ICountry[]> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

export const fetchAdminCounties = async (): Promise<ICounty[]> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/locations/counties`, authOptions);
        const result: SingleResourceApiResponse<ICounty[]> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

export const fetchAdminCities = async (): Promise<ICity[]> => {
    try {
        const authOptions = await getAuthFetchOptions({ cache: 'no-store' });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/locations/cities`, authOptions);
        const result: SingleResourceApiResponse<ICity[]> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

const createLocation = async (type: 'countries' | 'counties' | 'cities', data: any) => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'POST', body: JSON.stringify(data) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/locations/${type}`, authOptions);
        const result: SingleResourceApiResponse<any> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

export const createCountry = (data: { name: string, isActive: boolean }) => createLocation('countries', data);
export const createCounty = (data: { name: string, country: string, isActive: boolean }) => createLocation('counties', data);
export const createCity = (data: { name: string, county: string, deliveryFee: number, isActive: boolean }) => createLocation('cities', data);

const updateLocation = async (type: 'countries' | 'counties' | 'cities', id: string, data: any) => {
    try {
        const authOptions = await getAuthFetchOptions({ method: 'PATCH', body: JSON.stringify(data) });
        const response = await serverSafeFetch(`${API_BASE_PATH}/admin/locations/${type}/${id}`, authOptions);
        const result: SingleResourceApiResponse<any> = await handleResponse(response);
        return result.data;
    } catch (error) { console.error(error); throw error; }
}

export const updateCountry = (id: string, data: Partial<ICountry>) => updateLocation('countries', id, data);
export const updateCounty = (id: string, data: Partial<ICounty>) => updateLocation('counties', id, data);
export const updateCity = (id: string, data: Partial<ICity>) => updateLocation('cities', id, data);