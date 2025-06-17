// models/Cart.ts
import { Schema, model, models } from 'mongoose';
import { ICart, ICartItem } from '@/types';
import '@/models/User'
import '@/models/Product'

/**
 * Mongoose subdocument schema for an item within a shopping cart.
 *
 * Defines the structure of objects within the `items` array of a `Cart` document.
 * It includes an optional `variantId` to distinguish between different variations
 * of the same product.
 */
const CartItemSchema = new Schema<ICartItem>({
  /**
   * Reference to the parent product.
   */
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  /**
   * Optional reference to the specific product variant chosen by the user.
   * Its presence indicates this cart item is for a product variation.
   */
  variantId: {
    type: Schema.Types.ObjectId,
  },

  /**
   * The number of units of this item. Must be at least 1.
   */
  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  /**
   * The price of the product or variant at the time it was added to the cart.
   */
  price: {
    type: Number,
    required: true
  },

  /**
   * The name of the product at the time it was added.
   */
  name: {
    type: String,
    required: true
  },

  /**
   * The image URL of the item at the time it was added. This will be the
   * variant's image if available, otherwise the product's main image.
   */
  imageUrl: {
    type: String,
    required: true
  },

  /**
   * A snapshot of the selected variant options (e.g., { "Color": "Blue" }).
   */
  variantOptions: {
    type: Map,
    of: String,
  },
}, {
  /**
   * We use a composite key of (product, variantId) to identify items,
   * so a separate subdocument _id is not needed.
   */
  _id: false
});

/**
 * Mongoose schema for the Cart model.
 *
 * Represents a shopping cart for both logged-in users and guest sessions.
 */
const CartSchema = new Schema<ICart>({
  /**
   * A reference to a registered user.
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true, // Allows multiple documents to have a null `user` field for guests.
  },

  /**
   * A unique token to identify guest carts.
   */
  sessionToken: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null `sessionToken`.
  },

  /**
   * An array of items currently in the cart.
   */
  items: [CartItemSchema],
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps.
   */
  timestamps: true,
});

/**
 * Creates a TTL (Time-To-Live) index to automatically delete abandoned guest carts
 * after 30 days of inactivity. This does not affect carts of registered users.
 */
CartSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { user: { $exists: false } }
  }
);

/**
 * The Cart model.
 */
const Cart = models.Cart || model<ICart>('Cart', CartSchema);

export default Cart;