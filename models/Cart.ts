import { Schema, model, models } from 'mongoose';
import { ICart, ICartItem } from '@/types';
import '@/models/User'
import '@/models/Product'

/**
 * Mongoose subdocument schema for an item within a shopping cart.
 *
 * This schema does not create a separate collection. Instead, it defines the
 * structure of objects within the `items` array of the `Cart` document.
 * Product details (`price`, `name`, `imageUrl`) are duplicated ("snapshotted")
 * here to ensure that the cart's contents remain consistent even if the
 * original product is updated or removed from the store.
 */
const CartItemSchema = new Schema<ICartItem>({
  /**
   * Reference to the original product being added to the cart.
   */
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  /**
   * The number of units of this product. Must be at least 1.
   */
  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  /**
   * The price of the product at the time it was added to the cart.
   */
  price: {
    type: Number,
    required: true
  },

  /**
   * The name of the product at the time it was added to the cart.
   */
  name: {
    type: String,
    required: true
  },

  /**
   * The image URL of the product at the time it was added to the cart.
   */
  imageUrl: {
    type: String,
    required: true
  },
}, {
  /**
   * Disables the automatic creation of `_id` for these subdocuments, as they
   * are managed as part of the parent Cart document.
   */
  _id: false
});

/**
 * Mongoose schema for the Cart model.
 *
 * Represents a shopping cart that can be associated with either a logged-in user
 * or a guest session identified by a unique token.
 */
const CartSchema = new Schema<ICart>({
  /**
   * A reference to a registered user. This field is sparse and unique to ensure
   * a user can only have one active cart. It is optional to support guest carts.
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true, // Allows multiple documents to have a null `user` field.
  },

  /**
   * A unique token to identify and track carts for unauthenticated (guest) users.
   * This token would typically be stored in a client-side cookie or local storage.
   */
  sessionToken: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null `sessionToken` field.
  },

  /**
   * An array of items currently in the cart, conforming to the CartItemSchema.
   */
  items: [CartItemSchema],
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps. The `updatedAt`
   * timestamp is crucial for the TTL index that cleans up abandoned guest carts.
   */
  timestamps: true,
});

// TODO: Add a pre-save validation hook to ensure a cart has EITHER a `user` OR a `sessionToken`, but not neither.
// This would enforce data integrity and prevent orphaned cart documents.

/**
 * Creates a TTL (Time-To-Live) index on the `updatedAt` field.
 * This index automatically removes documents from the collection after a specified
 * number of seconds (here, 30 days). The `partialFilterExpression` ensures that
 * this rule ONLY applies to guest carts (i.e., those without a `user` ID),
 * preventing the deletion of carts belonging to registered users.
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
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Cart = models.Cart || model<ICart>('Cart', CartSchema);

export default Cart;