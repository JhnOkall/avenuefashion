import { Schema, model, models } from 'mongoose';
import { ICountry } from '@/types';

/**
 * Mongoose schema for the Country model.
 *
 * This schema defines the top-level entity in the geographical hierarchy,
 * used for address and shipping management.
 */
const CountrySchema = new Schema<ICountry>({
  /**
   * The official name of the country. Must be unique across all documents.
   */
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  
  /**
   * A flag to determine if the country is active and available for selection
   * in address forms.
   */
  isActive: {
    type: Boolean,
    default: true,
  },
});

// TODO: Add a `slug` field (e.g., "united-states") for use in URLs. This should also be unique.

/**
 * The Country model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Country = models.Country || model<ICountry>('Country', CountrySchema);

export default Country;