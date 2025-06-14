import { Schema, model, models } from 'mongoose';
import { IUser } from '@/types';

/**
 * Mongoose schema for the User model.
 *
 * This schema defines the structure for user accounts in the application. It serves as
 * the central document for user identity, authentication details, and relationships
 * to other parts of the system like addresses, orders, and favorites.
 */
const UserSchema = new Schema<IUser>({
  /**
   * The user's full name.
   */
  name: {
    type: String,
    required: [true, 'User name is required.'],
  },

  /**
   * The user's email address. This serves as the primary unique identifier for
   * authentication and communication. It is indexed for fast lookups.
   */
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true, // Automatically converts email to lowercase to ensure uniqueness.
    index: true,
  },

  /**
   * The URL of the user's profile picture, typically provided by an OAuth provider.
   */
  image: {
    type: String,
  },

  /**
   * The user's role, which determines their permissions and access level within the system.
   */
  // TODO: For more complex applications, consider implementing a more robust Role-Based Access Control (RBAC)
  // system by referencing a separate `Role` collection with detailed permissions.
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
    default: 'user',
  },

  /**
   * An array of references to the user's saved shipping/billing addresses.
   */
  addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],

  /**
   * An array of references to products the user has marked as favorites.
   */
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

  /**
   * A reference to the user's active shopping cart.
   */
  cart: { type: Schema.Types.ObjectId, ref: 'Cart' },

  /**
   * An array of references to all orders placed by the user.
   */
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

/**
 * The User model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const User = models.User || model<IUser>('User', UserSchema);

export default User;