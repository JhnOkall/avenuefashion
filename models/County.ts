import { Schema, model, models } from 'mongoose';
import { ICounty } from '@/types';

/**
 * Mongoose schema for the County model.
 *
 * This schema defines the structure for counties (or states/provinces),
 * which are part of the geographical hierarchy, linking cities to a parent country.
 */
const CountySchema = new Schema<ICounty>({
  /**
   * The name of the county or state.
   */
  name: {
    type: String,
    required: true,
    trim: true,
  },

  /**
   * A reference to the parent country this county belongs to.
   */
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    required: true,
  },
  
  /**
   * A flag to determine if the county is active and available for selection
   * in address forms.
   */
  isActive: {
    type: Boolean,
    default: true,
  },
});

// TODO: Add a `slug` field for SEO-friendly URLs (e.g., /locations/united-states/new-york).

/**
 * Creates a compound unique index to ensure that no two counties within the
 * same country can have the same name. This maintains data integrity.
 */
CountySchema.index({ country: 1, name: 1 }, { unique: true });

/**
 * The County model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const County = models.County || model<ICounty>('County', CountySchema);

export default County;