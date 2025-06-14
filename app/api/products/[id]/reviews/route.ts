import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for fetching all reviews for a specific product.
 * This is a public endpoint accessible to all users.
 *
 * @param {Request} req - The incoming GET request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The ID of the product whose reviews are being fetched.
 * @returns {Promise<NextResponse>} A JSON response with paginated reviews or an error message.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    const { id: productId } = params;
    // Validates that the provided productId is a valid MongoDB ObjectId format.
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid Product ID.' }, { status: 400 });
    }

    // Parses URL search parameters for pagination.
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    // Fetches the total count of reviews for the specified product to calculate total pages.
    const totalReviews = await Review.countDocuments({ product: productId });
    
    /**
     * Fetches the paginated list of reviews for the product.
     * It populates the `user` field to include the reviewer's name and profile image.
     * The results are sorted by creation date in descending order (newest first).
     */
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Returns the fetched reviews along with pagination metadata.
    return NextResponse.json({
      message: 'Reviews fetched successfully.',
      data: reviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      totalReviews,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error fetching reviews for product ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for creating a new review for a product.
 * This is a protected route that requires user authentication.
 *
 * @param {Request} req - The incoming POST request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The ID of the product being reviewed.
 * @returns {Promise<NextResponse>} A JSON response with the newly created review or an error message.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  /**
   * Fetches the current user's session. If no session exists, the user is unauthorized.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to leave a review.' }, { status: 401 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    const { id: productId } = params;
    // Parses the JSON body from the incoming POST request.
    const body = await req.json();
    const { rating, title, text } = body;

    // --- Server-Side Validation ---
    // TODO: Implement a more robust validation library like Zod for the request body.
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid Product ID.' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5.' }, { status: 400 });
    }
    if (!title || !text) {
      return NextResponse.json({ message: 'Title and text are required.' }, { status: 400 });
    }

    // Checks if the product being reviewed actually exists.
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // Prevents a user from submitting more than one review per product.
    const existingReview = await Review.findOne({ product: productId, user: session.user.id });
    if (existingReview) {
      return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 409 }); // 409 Conflict
    }

    /**
     * Checks if the user has purchased the product by looking for a completed order
     * that contains the product. This determines if the review is marked as "verified".
     */
    const hasPurchased = await Order.findOne({
        user: session.user.id,
        'items.product': productId,
        status: 'Confirmed'
    });

    // Creates a new Review document instance.
    const newReview = new Review({
      user: session.user.id,
      product: productId,
      rating,
      title,
      text,
      isVerified: !!hasPurchased, // Coerces the result of the `findOne` query to a boolean.
    });

    // Saves the new review. The post-save hook on the Review model will automatically update the product's stats.
    await newReview.save();

    // On successful creation, return a 201 Created status with the new review data.
    return NextResponse.json({
      message: 'Review submitted successfully.',
      data: newReview,
    }, { status: 201 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error creating review for product ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}