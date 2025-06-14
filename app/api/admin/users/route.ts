import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * A Next.js API route handler for fetching a paginated and searchable list of all users.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object, which may contain URL search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing the list of users and pagination metadata, or an error message.
 */
export async function GET(req: Request) {
  /**
   * Performs an authentication and authorization check.
   */
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    
    // Parses URL search parameters for pagination and searching.
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchQuery = searchParams.get('searchQuery');
    
    // Builds the filter query for the database lookup.
    const filter: any = {};
    if (searchQuery) {
        // Creates a case-insensitive search across both the 'name' and 'email' fields.
        filter.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
        ];
    }

    // Calculates the number of documents to skip for pagination.
    const skip = (page - 1) * limit;
    
    // Fetches the total count of documents that match the filter for calculating total pages.
    const totalUsers = await User.countDocuments(filter);
    
    /**
     * Fetches the paginated and filtered list of users.
     * The `.select()` method is an optimization that ensures only the necessary fields
     * are retrieved from the database, reducing payload size and improving performance.
     * The results are sorted by creation date in descending order (newest first).
     */
    const users = await User.find(filter)
      .select('name email role image createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Returns the fetched data along with pagination metadata.
    return NextResponse.json({
      data: users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ message: 'Error fetching users', error: error.message }, { status: 500 });
  }
}