import { Schema, model, models } from 'mongoose';
import { ICity } from '@/types';
import '@/models/County'; 

/**
 * Mongoose schema for the City model.
 *
 * This schema defines the structure for cities, which are part of the
 * geographical hierarchy used for shipping and address validation. Each city
 * belongs to a specific county.
 */
const CitySchema = new Schema<ICity>({
  /**
   * The name of the city.
   */
  name: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * The base delivery fee for orders shipped to this city.
   */
  deliveryFee: {
    type: Number,
    required: true,
    default: 0,
  },

  /**
   * A reference to the parent county this city belongs to.
   */
  county: {
    type: Schema.Types.ObjectId,
    ref: 'County', 
    required: true,
  },
  
  /**
   * A flag to determine if the city is active and available for selection
   * during address entry.
   */
  isActive: {
    type: Boolean,
    default: true,
  },
});

// TODO: Add a `slug` field for SEO-friendly URLs (e.g., /locations/new-york/new-york-city). This can be auto-generated from the name.

/**
 * Creates a compound unique index to ensure that no two cities within the
 * same county can have the same name. This enforces data integrity at the
 * database level.
 */
CitySchema.index({ county: 1, name: 1 }, { unique: true });

/**
 * The City model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const City = models.City || model<ICity>('City', CitySchema);

export default City;