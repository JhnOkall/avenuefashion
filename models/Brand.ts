import { Schema, model, models } from 'mongoose';
import { IBrand } from '@/types';

/**
 * Mongoose schema for the Brand model.
 *
 * This schema defines the structure for product brands, which helps in
 * organizing and filtering products by their manufacturer.
 */
const BrandSchema = new Schema<IBrand>({
  /**
   * The unique name of the brand. This field is indexed for efficient lookups.
   */
  name: {
    type: String,
    required: [true, 'Brand name is required.'],
    unique: true,
    trim: true,
    index: true,
  },
  /**
   * Flag to determine if the brand is active. Inactive brands and their
   * associated products might be hidden from the storefront.
   */
  // TODO: Add the `isActive` field to the schema to align with the IBrand interface.
  // isActive: {
  //   type: Boolean,
  //   default: true,
  // },
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

// TODO: Consider adding a 'slug' field for creating SEO-friendly URLs (e.g., /brands/apple).
// This could be auto-generated from the name using a pre-save hook.

/**
 * The Brand model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Brand = models.Brand || model<IBrand>('Brand', BrandSchema);

export default Brand;