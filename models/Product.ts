import { Schema, model, models } from 'mongoose';
import { IProduct } from '@/types';

/**
 * Mongoose schema for the Product model.
 *
 * This schema defines the structure for products sold in the store. It includes
 * pricing, descriptive details, brand and review associations, and inventory status.
 */
const ProductSchema = new Schema<IProduct>({
  /**
   * The display name of the product.
   */
  name: {
    type: String,
    required: [true, 'Product name is required.'],
    trim: true,
  },

  /**
   * A URL-friendly version of the product name, used for SEO and routing.
   * This is automatically generated from the `name` field via a pre-save hook.
   */
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  /**
   * An array of strings representing paragraphs or sections of the product description.
   */
  description: {
    type: [String],
    default: [],
  },

  /**
   * The current selling price of the product.
   */
  price: {
    type: Number,
    required: [true, 'Price is required.'],
  },

  /**
   * The original price of the product before any discounts are applied.
   * This is optional and used to display a "slash" price for items on sale.
   */
  originalPrice: {
    type: Number,
  },

  /**
   * The discount percentage applied to the original price.
   */
  discount: {
    type: Number,
    min: 0,
    max: 100,
  },

  /**
   * The primary image URL for the product.
   */
  // TODO: Consider converting `imageUrl` to an array `images: [String]` to support a full product gallery.
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required.'],
  },

  /**
   * An array of strings listing key features or specifications.
   */
  features: {
    type: [String],
    default: [],
  },

  /**
   * The condition of the product.
   */
  // TODO: Add 'restored' to the enum to fully match the IProduct interface definition.
  condition: {
    type: String,
    enum: ['new', 'used', 'restored'],
    required: [true, 'Product condition is required.'],
  },

  /**
   * A reference to the product's brand.
   */
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required.'],
  },

  /**
   * The average rating of the product, denormalized from its reviews for query performance.
   */
  // TODO: Implement a robust mechanism (e.g., a static method on the schema) to recalculate
  // this value atomically when a review is added, updated, or deleted.
  rating: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  },

  /**
   * The total number of reviews for the product, denormalized for query performance.
   */
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },

  /**
   * An array of references to reviews associated with this product.
   */
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],

  /**
   * A flag to control the visibility of the product on the storefront.
   */
  // TODO: Add an `inventory` or `stockCount` number field to manage product availability and prevent overselling.
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

/**
 * Pre-save middleware to automatically generate a URL-friendly slug from the
 * product name before saving a new or modified document.
 */
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ /g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, ''); // Remove all non-word chars except hyphens
  }
  next();
});

/**
 * The Product model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;