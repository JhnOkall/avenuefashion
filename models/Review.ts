import { Schema, model, models, Model, Types } from 'mongoose';
import { IReview } from '@/types';
import Product from './Product';
import '@/models/User';
import '@/models/Product';

/**
 * Interface to extend the Mongoose Model type with custom static methods.
 * This provides type safety for the `calculateProductStats` method.
 */
interface IReviewModel extends Model<IReview> {
  calculateProductStats(productId: Types.ObjectId): Promise<void>;
}

/**
 * Mongoose schema for the Review model.
 *
 * Defines the structure for user-submitted reviews of products. This schema includes
 * a static method and post-save/update hooks to automatically calculate and update
 * denormalized rating and review count statistics on the parent `Product` model,
 * which is a critical performance optimization for displaying product data.
 */
const ReviewSchema = new Schema<IReview, IReviewModel>({
  /**
   * The user who authored the review.
   */
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A review must have an author.'],
  },
  /**
   * The product to which this review belongs.
   */
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'A review must belong to a product.'],
  },
  /**
   * The star rating provided by the user, from 1 to 5.
   */
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'A review must have a rating.'],
  },
  /**
   * A short, descriptive title for the review.
   */
  title: {
    type: String,
    trim: true,
    required: [true, 'A review must have a title.'],
  },
  /**
   * The main body text of the review.
   */
  text: {
    type: String,
    required: [true, 'A review must have text content.'],
  },
  /**
   * A flag indicating if the review was made by a user who verifiably purchased the product.
   */
  // TODO: Implement the business logic to set this flag to true, likely by cross-referencing completed orders for the user and product.
  isVerified: {
    type: Boolean,
    default: false,
  },
  /**
   * An array of image URLs uploaded by the user with their review.
   */
  images: {
    type: [String],
    default: [],
  },
  /**
   * A counter for "helpful" votes from other users.
   */
  // TODO: Create API endpoints and controller logic to handle incrementing these vote counts atomically.
  helpfulVotes: {
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 },
  },
}, { timestamps: true });

/**
 * Creates a compound unique index to enforce the business rule that a user
 * can only submit one review per product.
 */
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

/**
 * A static method on the Review model to calculate the average rating and total
 * number of reviews for a given product and update the corresponding Product document.
 * This denormalization is crucial for efficient querying of product listings.
 * @param {Types.ObjectId} productId The ID of the product to update.
 */
ReviewSchema.statics.calculateProductStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      // If reviews exist, update the product with the calculated stats.
      await Product.findByIdAndUpdate(productId, {
        rating: stats[0].avgRating,
        numReviews: stats[0].numReviews
      });
    } else {
      // If no reviews are left (e.g., the last review was deleted), reset stats to default.
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product stats:', error);
    // TODO: Implement more robust error handling, such as logging to a dedicated service.
  }
};

/**
 * Mongoose middleware (post-save hook) that triggers the `calculateProductStats`
 * method after a new review is successfully saved to the database.
 */
ReviewSchema.post('save', function() {
  // `this.constructor` refers to the model itself (Review)
  (this.constructor as IReviewModel).calculateProductStats(this.product as Types.ObjectId);
});

/**
 * Mongoose middleware that triggers `calculateProductStats` after a review is
 * updated or deleted via `findOneAndUpdate` or `findOneAndDelete`.
 * The regular expression `/^findOneAnd/` captures all relevant Mongoose find-and-modify operations.
 * @param {IReview} doc The document that was operated on.
 */
ReviewSchema.post(/^findOneAnd/, async function(doc) {
  // `doc` is the document that was modified/deleted. If it exists, we recalculate stats.
  if (doc) {
    await (doc.constructor as IReviewModel).calculateProductStats(doc.product as Types.ObjectId);
  }
});

/**
 * The Review model.
 *
 * This pattern prevents Mongoose from recompiling the model on every hot-reload,
 * which is a common issue in Next.js development environments. It checks if the
 * model already exists in `mongoose.models` before creating a new one.
 */
const Review = (models.Review as IReviewModel) || model<IReview, IReviewModel>('Review', ReviewSchema);

export default Review;