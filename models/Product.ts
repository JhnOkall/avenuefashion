// models/Product.ts
import { Schema, model, models } from 'mongoose';
import { IProduct } from '@/types';
import '@/models/Review';
import '@/models/Brand';

/**
 * Mongoose schema for a concrete, sellable product variant.
 * Each variant has its own price, stock, and images.
 */
const ProductVariantSchema = new Schema({
  /**
   * A map of variation type names to option values, e.g., { "Color": "Blue", "Size": "XL" }.
   */
  options: {
    type: Map,
    of: String,
    required: true,
  },
  /**
   * The specific price for this variant.
   */
  price: {
    type: Number,
    required: [true, 'Variant price is required.'],
  },
  /**
   * The original price for this variant, for displaying discounts.
   */
  originalPrice: {
    type: Number,
  },
  /**
   * The inventory count for this specific variant.
   */
  stock: {
    type: Number,
    required: [true, 'Variant stock is required.'],
    default: 0,
  },
  /**
   * An array of image URLs specific to this variant.
   */
  images: {
    type: [String],
    default: [],
  },
  /**
   * An optional, unique Stock Keeping Unit for this variant.
   */
  sku: {
    type: String,
    trim: true,
  },
});

/**
 * Mongoose schema for defining a type of variation (e.g., "Color") and its
 * available options (e.g., ["Red", "Blue", "Green"]).
 */
const VariationTypeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
  },
});

/**
 * Mongoose schema for the Product model.
 *
 * This schema defines the structure for products, supporting both simple products
 * and products with multiple variations.
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
   * The base selling price of the product. For products with variants, this may
   * act as a "starting from" price or be superseded by variant-specific prices.
   */
  price: {
    type: Number,
    required: [true, 'A base price is required.'],
  },

  /**
   * The original base price of the product before any discounts are applied.
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
   * An array of image URLs for the product. The first image is the primary display image.
   */
  images: {
    type: [String],
    required: [true, 'At least one image URL is required.'],
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
  isActive: {
    type: Boolean,
    default: true,
  },

  /**
   * The stock count for a simple product (without variants). For products with
   * variants, inventory is managed at the variant level.
   */
  stock: {
    type: Number,
  },

  /**
   * Defines the variation structure for this product (e.g., "Color", "Size").
   */
  variationSchema: {
    type: [VariationTypeSchema],
    default: undefined,
  },

  /**
   * An array of all concrete product variants. If this is empty or undefined,
   * the product is treated as a simple product.
   */
  variants: {
    type: [ProductVariantSchema],
    default: undefined,
  },
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

/**
 * Pre-validate middleware to automatically generate a URL-friendly slug from the
 * product name. This hook runs *before* Mongoose's built-in validation, ensuring
 * the slug exists when the `required` check is performed.
 */
ProductSchema.pre('validate', function(next) {
  // We check if the document is new or if the name has been changed.
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/ /g, '-')     // Replace spaces with hyphens
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