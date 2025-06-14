import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Review from '@/models/Review';

/**
 * A Next.js API route handler for fetching the authenticated user's submitted reviews.
 * It supports pagination and filtering by rating.
 * This is a protected route that requires a valid user session.
 *
 * @param {Request} req - The incoming GET request object, which may contain URL search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing the user's reviews and pagination metadata.
 */
export async function GET(req: Request) {
  /**
   * Fetches the current user's session. If no session exists, the user is unauthorized.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    
    // Parses URL search parameters for pagination and filtering.
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = parseInt(searchParams.get('rating') || '0');
    
    // Calculates the number of documents to skip for pagination.
    const skip = (page - 1) * limit;

    // Builds the base filter query to only include reviews by the authenticated user.
    const filter: any = { user: session.user.id };

    // Adds the rating to the filter if a valid rating (1-5) is provided.
    if (rating > 0 && rating <= 5) {
      filter.rating = rating;
    }

    // Fetches the total count of documents that match the filter for calculating total pages.
    const totalReviews = await Review.countDocuments(filter);
    
    /**
     * Fetches the paginated and filtered list of reviews.
     * It populates the `product` field to include the product's name and slug,
     * which is needed for linking to the product page on the client.
     * The results are sorted by creation date in descending order (newest first).
     */
    const reviews = await Review.find(filter)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Returns the fetched data along with pagination metadata.
    return NextResponse.json({
      message: 'Your reviews fetched successfully.',
      data: reviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      totalReviews, // Including the total count is useful for displaying stats.
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}