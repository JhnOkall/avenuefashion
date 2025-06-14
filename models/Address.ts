import { Schema, model, models } from 'mongoose';
import { IAddress } from '@/types';
import '@/models/User';
import '@/models/Country';
import '@/models/County';
import '@/models/City';

/**
 * Mongoose schema for the Address model.
 *
 * This schema defines the structure for user addresses, which are used for
 * shipping and billing purposes. It includes references to geographical
 * entities (Country, County, City) to ensure data consistency.
 */
const AddressSchema = new Schema<IAddress>({
  /**
   * A reference to the user who owns this address.
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indexing for efficient lookups of addresses by user.
  },

  /**
   * The full name of the recipient at the shipping address.
   */
  recipientName: {
    type: String,
    required: true,
    trim: true
  },

  /**
   * The contact phone number for delivery purposes.
   */
  // TODO: Implement a validation regex to ensure the phone number format is consistent.
  phone: {
    type: String,
    required: true
  },

  /**
   * Reference to the country for this address.
   */
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },

  /**
   * Reference to the county/state for this address.
   */
  county: {
    type: Schema.Types.ObjectId,
    ref: 'County',
    required: true
  },

  /**
   * Reference to the city for this address.
   */
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },

  /**
   * The specific street and house/apartment number.
   */
  streetAddress: {
    type: String,
    required: true,
    trim: true
  },

  /**
   * A flag to indicate if this is the user's primary/default address.
   */
  // TODO: Add a pre-save hook to ensure that only one address per user can be marked as default.
  // When a new address is set to default, all other addresses for that user should have this flag set to false.
  isDefault: {
    type: Boolean,
    default: false
  },
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

/**
 * The Address model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Address = models.Address || model<IAddress>('Address', AddressSchema);

export default Address;