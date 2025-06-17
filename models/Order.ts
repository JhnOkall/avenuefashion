// models/Order.ts
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
 * This schema creates an immutable snapshot of the purchased item, including
 * variant-specific details if applicable.
 */
const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variantOptions: { type: Map, of: String },
}, { _id: false });

/**
 * Mongoose subdocument schema for an event in the order's tracking timeline.
 */
const OrderTimelineEventSchema = new Schema<IOrderTimelineEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['completed', 'current', 'upcoming'], required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

/**
 * Mongoose schema for the Order model.
 */
const OrderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    default: () => `ORD-${nanoid()}`,
    unique: true,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [OrderItemSchema],
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
  },
  shippingDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  payment: {
    method: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, index: true },
  },
  status: {
    type: String,
    enum: ['Processing', 'Pending', 'In transit', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true,
  },
  timeline: [OrderTimelineEventSchema],
  appliedVoucher: { type: Schema.Types.ObjectId, ref: 'Voucher' },
}, {
  timestamps: true
});

/**
 * The Order model.
 */
const Order = models.Order || model<IOrder>('Order', OrderSchema);

export default Order;