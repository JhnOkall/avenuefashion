import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * A Next.js API route handler for fetching all favorite products for the currently authenticated user.
 * This is a protected route that requires a valid user session.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the user's favorite products or an error message.
 */
// TODO: Implement POST and DELETE methods here to allow adding/removing favorites. For example, a POST to `/api/me/favourites` with a `productId` in the body would add a product to the user's favorites array.
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

    /**
     * Finds the authenticated user by their ID and populates their `favorites` array.
     * The `select('favorites')` optimization ensures only the favorites field is retrieved from the User document.
     * The nested `populate` call further enriches the data by including the brand name for each favorite product.
     */
    const user = await User.findById(session.user.id)
      .select('favorites')
      .populate({
        path: 'favorites',
        // Further populate the brand within each favorite product for display purposes.
        populate: {
          path: 'brand',
          select: 'name'
        }
      });

    // If the user document is not found (which should be rare for an authenticated user), return a 404.
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return a successful response with the populated list of favorite products.
    return NextResponse.json({
      message: 'Favorites fetched successfully.',
      data: user.favorites,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('Error fetching user favorites:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}