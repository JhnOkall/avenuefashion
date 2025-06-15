import { Schema, model, models } from 'mongoose';
import { IOrder, IOrderItem, IOrderTimelineEvent } from '@/types';
import { customAlphabet } from 'nanoid';
import '@/models/Product';
import '@/models/User';
import '@/models/Voucher';

/**
 * Generates a unique, user-friendly, 10-digit numeric order ID.
 * e.g., ORD-1234567890
 */
const nanoid = customAlphabet('0123456789', 10);

/**
 * Mongoose subdocument schema for an item within a finalized order.
 *
 * This schema defines the structure for individual line items in an order.
 * All product details (`name`, `imageUrl`, `price`) are snapshotted at the
 * time of purchase to create an immutable record, ensuring that future changes
 * to the source product do not affect historical order data.
 */
const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false }); // Disables `_id` for subdocuments.

/**
 * Mongoose subdocument schema for an event in the order's tracking timeline.
 *
 * Defines the structure for status updates within an order's lifecycle,
 * such as "Order Placed," "Shipped," or "Delivered."
 */
const OrderTimelineEventSchema = new Schema<IOrderTimelineEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['completed', 'current', 'upcoming'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false }); // Disables `_id` for subdocuments.

/**
 * Mongoose schema for the Order model.
 *
 * This is the primary schema for recording a transaction. It captures all
 * necessary details including the user, items purchased, pricing breakdown,
 * shipping, payment, and fulfillment status.
 */
const OrderSchema = new Schema<IOrder>({
  /**
   * A unique, human-readable identifier for the order, generated upon creation.
   */
  orderId: {
    type: String,
    default: () => `ORD-${nanoid()}`,
    unique: true,
    required: true,
  },

  /**
   * A reference to the user who placed the order. Indexed for fast lookups.
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  /**
   * An array of items included in the order.
   */
  items: [OrderItemSchema],

  /**
   * A financial snapshot of the order, including all costs and discounts.
   */
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
  },

  /**
   * A snapshot of the recipient's shipping details at the time of order.
   */
  shippingDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    // TODO: Deconstruct this address into a structured object (e.g., street, city, postalCode, country)
    // to improve data integrity and allow for easier analysis.
    address: { type: String, required: true },
  },

  /**
   * Information related to the payment transaction for the order.
   */
  payment: {
    method: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, index: true },
  },

  /**
   * The overall fulfillment status of the entire order.
   */
  // TODO: Implement a pre-save hook or application-level logic to automatically update this status
  // based on the latest event added to the `timeline`.
  status: {
    type: String,
    enum: ['Processing', 'Pending', 'In transit', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true,
  },

  /**
   * A chronological log of all fulfillment and delivery events for this order.
   */
  timeline: [OrderTimelineEventSchema],

  /**
   * An optional reference to a voucher that was applied to this order.
   */
  appliedVoucher: { type: Schema.Types.ObjectId, ref: 'Voucher' },
}, {
  /**
   * Automatically adds `createdAt` and `updatedAt` timestamps to the document.
   */
  timestamps: true
});

/**
 * The Order model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;