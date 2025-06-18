import { Schema, model, models, Document } from 'mongoose';
import { IUser } from '@/types';

export interface IPushSubscription extends Document {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
  user: Schema.Types.ObjectId | IUser;
}

/**
 * @file Mongoose schema for the PushSubscription model.
 *
 * This schema stores the necessary information for a web push subscription,
 * allowing the server to send notifications to a specific user's device/browser.
 * It is linked directly to a User document.
 */
const PushSubscriptionSchema = new Schema<IPushSubscription>({
  /**
   * The unique URL provided by the push service for this subscription.
   * This is the address the push server sends messages to.
   */
  endpoint: {
    type: String,
    required: true,
    unique: true, // Each endpoint is unique.
  },

  /**
   * The public key for the subscription, used for encryption.
   */
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },

  /**
   * A reference to the user who owns this subscription. This is crucial for
   * targeting notifications to the correct user.
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster lookups of a user's subscriptions.
  },
}, {
  timestamps: true,
});

const PushSubscription = models.PushSubscription || model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;