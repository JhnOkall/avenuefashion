import { Schema, model, models } from 'mongoose';
import { IVoucher } from '@/types';

/**
 * Mongoose schema for the Voucher model.
 *
 * Defines the structure for promotional codes, discount vouchers, or gift cards
 * that can be applied to orders to receive a discount.
 */
const VoucherSchema = new Schema<IVoucher>({
  /**
   * The unique code that users enter to apply the voucher. It is indexed for
   * fast lookups and automatically converted to uppercase to ensure case-insensitivity.
   */
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  },

  /**
   * The type of discount the voucher provides.
   * 'percentage': A percentage off the order subtotal.
   * 'fixed': A fixed monetary amount off the order total.
   */
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },

  /**
   * The numerical value of the discount (e.g., 10 for a 10% or $10 discount).
   */
  // TODO: Add validation to ensure that for `percentage` types, the value is between 0 and 100.
  discountValue: {
    type: Number,
    required: true
  },

  /**
   * A flag to enable or disable the voucher. Inactive vouchers cannot be applied.
   */
  isActive: {
    type: Boolean,
    default: true
  },

  /**
   * The optional expiration date for the voucher. If not set, the voucher does not expire.
   */
  expiresAt: {
    type: Date
  },
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

// TODO: Enhance functionality by adding usage constraints and tracking, for example:
// - `timesUsed: { type: Number, default: 0 }` to count how many times it has been applied.
// - `maxUses: { type: Number }` for a global usage limit.
// - `minimumSpend: { type: Number }` to require a minimum order value.
// - `applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]` to restrict the voucher to specific products.

/**
 * The Voucher model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Voucher = models.Voucher || model<IVoucher>('Voucher', VoucherSchema);

export default Voucher;