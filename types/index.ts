// types/index.ts
import { Document, Types } from 'mongoose';

// =================================================================
// LOCATION HIERARCHY
// Represents the administrative-defined geographical structure.
// =================================================================

/**
 * Represents a country in the system.
 */
export interface ICountry extends Document {
  /**
   * The unique identifier for the country.
   */
  _id: Types.ObjectId;
  /**
   * The official name of the country.
   */
  name: string;
  /**
   * Flag to determine if the country is active and available for selection.
   */
  isActive: boolean;
}

/**
 * Represents a county or state within a country.
 */
export interface ICounty extends Document {
  /**
   * The unique identifier for the county.
   */
  _id: Types.ObjectId;
  /**
   * The official name of the county.
   */
  name: string;
  /**
   * Reference to the parent country.
   */
  country: Types.ObjectId | ICountry;
  /**
   * Flag to determine if the county is active and available for selection.
   */
  isActive: boolean;
}

/**
 * Represents a city within a county.
 */
export interface ICity extends Document {
  /**
   * The unique identifier for the city.
   */
  _id: Types.ObjectId;
  /**
   * The official name of the city.
   */
  name: string;
  /**
   * The base delivery fee for this city.
   */
  deliveryFee: number;
  /**
   * Reference to the parent county.
   */
  county: Types.ObjectId | ICounty;
  /**
   * Flag to determine if the city is active and available for selection.
   */
  isActive: boolean;
}


// =================================================================
// USER & ADDRESS
// Core entities for user management and shipping information.
// =================================================================

/**
 * Represents a reusable shipping or billing address associated with a user.
 */
export interface IAddress extends Document {
  /**
   * The unique identifier for the address.
   */
  _id: Types.ObjectId;
  /**
   * Reference to the user who owns this address.
   */
  user: Types.ObjectId | IUser;
  /**
   * The full name of the recipient at this address.
   */
  recipientName: string;
  /**
   * The contact phone number for the recipient.
   */
  phone: string;
  /**
   * Reference to the address's country.
   */
  country: Types.ObjectId | ICountry;
  /**
   * Reference to the address's county.
   */
  county: Types.ObjectId | ICounty;
  /**
   * Reference to the address's city.
   */
  city: Types.ObjectId | ICity;
  /**
   * The specific street address, including house number and apartment/suite.
   */
  streetAddress: string;
  /**
   * Flag to mark this as the user's primary/default address.
   */
  isDefault: boolean;
}

/**
 * Represents a user account in the system.
 */
export interface IUser extends Document {
  /**
   * The unique identifier for the user.
   */
  _id: Types.ObjectId;
  /**
   * The user's full name.
   */
  name: string;
  /**
   * The user's email address, used for login and communication. Must be unique.
   */
  email: string;
  /**
   * URL to the user's profile picture, typically from an OAuth provider.
   */
  image?: string;
  /**
   * The user's role, determining their access level.
   */
  // TODO: Consider a more robust role-based access control (RBAC) system by referencing a separate `Role` collection.
  role: 'user' | 'admin';
  /**
   * A list of saved addresses associated with the user.
   */
  addresses: (Types.ObjectId | IAddress)[];
  /**
   * A list of products the user has marked as favorites.
   */
  favorites: (Types.ObjectId | IProduct)[];
  /**
   * Reference to the user's active shopping cart.
   */
  cart?: Types.ObjectId | ICart;
  /**
   * A list of all orders placed by the user.
   */
  orders: (Types.ObjectId | IOrder)[];
  /**
   * Timestamp of when the user account was created.
   */
  createdAt: Date;
  /**
   * Timestamp of the last update to the user account.
   */
  updatedAt: Date;
}


// =================================================================
// CATALOG
// Entities related to products, brands, and reviews.
// =================================================================

/**
 * Defines a type of variation for a product, like 'Color' or 'Size'.
 */
export interface IVariationType {
  _id: Types.ObjectId;
  /**
   * The name of the variation type (e.g., "Color").
   */
  name: string;
  /**
   * A list of possible option values for this variation type (e.g., "Red", "Blue").
   */
  options: string[];
}

/**
 * Represents a specific combination of variation options for a product.
 * This is the actual sellable unit with its own price, stock, and images.
 */
export interface IProductVariant {
  _id: Types.ObjectId;
  /**
   * A map of variation type names to the selected option value for this variant.
   * e.g., { "Color": "Blue", "Size": "XL" }
   */
  options: Map<string, string>;
  /**
   * The price of this specific variant.
   */
  price: number;
  /**
   * The original price before a sale or discount.
   */
  originalPrice?: number;
  /**
   * The number of units available for this variant.
   */
  stock: number;
  /**
   * A list of image URLs specific to this variant.
   */
  images: string[];
  /**
   * A unique Stock Keeping Unit for inventory tracking.
   */
  sku?: string;
}

/**
 * Represents a product brand or manufacturer.
 */
export interface IBrand extends Document {
  _id: Types.ObjectId;
  /**
   * The name of the brand.
   */
  name: string;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Flag to determine if the brand is active and its products should be visible.
   */
  isActive: boolean;
}

/**
 * Represents a user-submitted review for a product.
 */
export interface IReview extends Document {
  _id: Types.ObjectId;
  /**
   * The user who submitted the review.
   */
  user: Types.ObjectId | IUser;
  /**
   * The product that was reviewed.
   */
  product: Types.ObjectId | IProduct;
  /**
   * The star rating given by the user (e.g., 1-5).
   */
  rating: number;
  /**
   * A brief title for the review.
   */
  title: string;
  /**
   * The main content of the review.
   */
  text: string;
  /**
   * Flag indicating if the review is from a verified purchaser.
   */
  isVerified: boolean;
  /**
   * A list of image URLs attached to the review.
   */
  images: string[];
  /**
   * A count of votes indicating if the review was helpful.
   */
  helpfulVotes: {
    yes: number;
    no: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a product available for sale.
 */
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  /**
   * A URL-friendly version of the product name for clean routing.
   */
  slug: string;
  /**
   * A structured description, where each string is a paragraph or a section.
   */
  description: string[];
  /**
   * The base price of the product. For products with variants, this may act as a
   * "starting from" price or be superseded by variant-specific prices.
   */
  price: number;
  /**
   * The original price before a sale or discount, used for display purposes.
   */
  originalPrice?: number;
  /**
   * The calculated discount percentage, if applicable.
   */
  discount?: number;
  /**
   * An array of image URLs for the product. The first image is the primary one.
   * Variant-specific images are stored within the `variants` array.
   */
  images: string[];
  /**
   * A list of key features or specifications for the product.
   */
  features: string[];
  /**
   * The physical condition of the product.
   */
  condition: 'new' | 'used' | 'restored';
  /**
   * Reference to the product's brand.
   */
  brand: Types.ObjectId | IBrand;
  /**
   * The average rating, denormalized from reviews for performance.
   */
  rating: number;
  /**
   * The total number of reviews, denormalized for performance.
   */
  numReviews: number;
  /**
   * A list of reviews for this product.
   */
  reviews: (Types.ObjectId | IReview)[];
  /**
   * Flag to control the visibility of the product in the store.
   */
  isActive: boolean;
  /**
   * The stock count for a simple product. For products with variants,
   * inventory is managed at the variant level.
   */
  stock?: number;
  /**
   * Defines the variation structure for this product, such as "Color" and "Size".
   * Each item in the array defines a variation type and its available options.
   */
  variationSchema?: IVariationType[];
  /**
   * An array of all concrete product variants. If this array is empty or does not exist,
   * the product is considered a simple product without variations.
   */
  variants?: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}


// =================================================================
// CART
// Entities for managing the user's shopping cart.
// =================================================================

/**
 * Represents a single line item within a shopping cart.
 * Product details are duplicated here to create a snapshot at the time of adding,
 * preventing issues if the source product's price or name changes later.
 */
export interface ICartItem {
  /**
   * Reference to the parent product.
   */
  product: Types.ObjectId | IProduct;
  /**
   * Reference to the specific product variant, if applicable.
   */
  variantId?: Types.ObjectId;
  /**
   * The number of units of this item in the cart.
   */
  quantity: number;
  /**
   * The price of the item at the time it was added to the cart.
   */
  price: number;
  /**
   * The name of the product at the time it was added.
   */
  name: string;
  /**
   * The image URL of the item at the time it was added.
   */
  imageUrl: string;
  /**
   * Details of the selected variant options, e.g., { "Color": "Blue", "Size": "XL" }
   */
  variantOptions?: Map<string, string>;
}

/**
 * Represents a shopping cart, which can be associated with a logged-in user or a guest session.
 */
export interface ICart extends Document {
  _id: Types.ObjectId;
  /**
   * Reference to the user who owns the cart. Optional for guest carts.
   */
  user?: Types.ObjectId | IUser;
  /**
   * A unique token to identify and retrieve a guest's cart across sessions.
   */
  sessionToken?: string;
  /**
   * A list of items currently in the cart.
   */
  items: ICartItem[];
  createdAt: Date;
  // TODO: Add an `expiresAt` field with a TTL index to automatically clear abandoned carts from the database.
  updatedAt: Date;
}


// =================================================================
// VOUCHER
// Represents a promotional discount or gift card.
// =================================================================

/**
 * Represents a discount voucher that can be applied to an order.
 */
export interface IVoucher extends Document {
  _id: Types.ObjectId;
  /**
   * The unique, case-insensitive code a user enters to apply the voucher.
   */
  code: string;
  /**
   * The type of discount: a fixed amount or a percentage of the subtotal.
   */
  discountType: 'percentage' | 'fixed';
  /**
   * The numeric value of the discount.
   */
  discountValue: number;
  /**
   * Flag to enable or disable the voucher.
   */
  isActive: boolean;
  /**
   * The expiration date, after which the voucher is no longer valid.
   */
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // TODO: Add usage constraints, such as `maxUses`, `usesPerUser`, `minimumSpend`, or product/category applicability.
}


// =================================================================
// ORDER
// Represents a completed transaction and its associated data.
// =================================================================

/**
 * Represents a single line item within a finalized order.
 * This is an immutable record of a purchased product.
 */
export interface IOrderItem {
  /**
   * Reference to the product that was purchased.
   */
  product: Types.ObjectId | IProduct;
  /**
   * Reference to the specific product variant purchased, if applicable.
   */
  variantId?: Types.ObjectId;
  /**
   * The name of the product at the time of purchase.
   */
  name: string;
  /**
   * The image URL of the product at the time of purchase.
   */
  imageUrl: string;
  /**
   * The price per unit at the time of purchase.
   */
  price: number;
  /**
   * The quantity of the product purchased.
   */
  quantity: number;
  /**
   * A snapshot of the selected variant options.
   */
  variantOptions?: Map<string, string>;
}

/**
 * Represents a single event in the order's fulfillment and delivery timeline.
 */
export interface IOrderTimelineEvent {
  /**
   * The title of the timeline event (e.g., "Order Placed", "Shipped").
   */
  title: string;
  /**
   * A detailed description of the event.
   */
  description: string;
  /**
   * The status of this specific event in the overall timeline.
   */
  status: 'completed' | 'current' | 'upcoming';
  /**
   * The timestamp when this event occurred.
   */
  timestamp: Date;
}

/**
 * Represents a complete order document, serving as the primary record of a transaction.
 */
export interface IOrder extends Document {
  _id: Types.ObjectId;
  /**
   * A user-friendly, unique identifier for the order (e.g., #ORD-12345).
   */
  orderId: string;
  /**
   * The user who placed the order.
   */
  user: Types.ObjectId | IUser;
  /**
   * A list of all items included in the order.
   */
  items: IOrderItem[];
  /**
   * A breakdown of the final pricing for the order.
   */
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  /**
   * A snapshot of the shipping details used for this order.
   */
  shippingDetails: {
    name: string;
    phone: string;
    email: string;
    // TODO: Deconstruct this address into a structured object (street, city, etc.) or reference an immutable address snapshot to improve data integrity.
    address: string;
  };
  /**
   * Details about the payment transaction.
   */
  payment: {
    method: string;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
  };
  /**
   * The overall status of the order.
   */
  status: 'Processing' | 'Pending' | 'In transit' | 'Confirmed' |'Delivered' | 'Cancelled';
  /**
   * A chronological log of events related to the order's fulfillment.
   */
  timeline: IOrderTimelineEvent[];
  /**
   * Reference to a voucher, if one was applied to the order.
   */
  appliedVoucher?: Types.ObjectId | IVoucher;
  createdAt: Date;
  updatedAt: Date;
}