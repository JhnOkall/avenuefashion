import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for updating a specific review by its ID.
 * This is a protected route, accessible only by the review's original author or an admin.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.reviewId - The ID of the review to be updated.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  /**
   * Fetches the current user's session. If no session exists, the user is unauthorized.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

   // Await the params Promise to access the route parameters
   const resolvedParams = await params;

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    const { reviewId } = resolvedParams;
    
    // Parses the JSON body from the incoming PATCH request.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has the correct shape and data types (e.g., rating is a number between 1 and 5).
    const { rating, title, text } = await req.json();

    // Validates that the provided reviewId is a valid MongoDB ObjectId format.
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ message: 'Invalid Review ID' }, { status: 400 });
    }

    // Finds the review document to be updated.
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    /**
     * A critical security check to ensure the request is authorized.
     * The update is only allowed if the user is the original author of the review
     * OR if the user has an 'admin' role.
     */
    if (review.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden. You are not authorized to edit this review.' }, { status: 403 });
    }

    /**
     * Finds the review document by its ID and applies the updates.
     * The `{ new: true, runValidators: true }` options ensure that the updated document is returned and that schema validations are run on the update.
     */
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { rating, title, text },
      { new: true, runValidators: true }
    );

    // Note: The post-update hook on the Review model will automatically handle recalculating the associated product's rating statistics.

    // On successful update, return a success message and the updated review data.
    return NextResponse.json({
      message: 'Review updated successfully.',
      data: updatedReview,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error updating review ${resolvedParams.reviewId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for deleting a specific review by its ID.
 * This is a protected route, accessible only by the review's original author or an admin.
 *
 * @param {Request} req - The incoming DELETE request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.reviewId - The ID of the review to be deleted.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ reviewId: string }> }) {
  /**
   * Fetches the current user's session.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

   // Await the params Promise to access the route parameters
   const resolvedParams = await params;

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    const { reviewId } = resolvedParams;

    // Validates the provided reviewId format.
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json({ message: 'Invalid Review ID' }, { status: 400 });
    }

    // Finds the review to be deleted to perform an ownership check.
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    /**
     * A critical security check to ensure the user owns the review or is an admin.
     */
    if (review.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden. You are not authorized to delete this review.' }, { status: 403 });
    }

    // If all checks pass, delete the review document.
    await Review.findByIdAndDelete(reviewId);
    
    // Note: The post-delete hook on the Review model will automatically handle recalculating the associated product's rating statistics.

    // Return a success response.
    return NextResponse.json({ message: 'Review deleted successfully.' }, { status: 200 });
  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error deleting review ${resolvedParams.reviewId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}