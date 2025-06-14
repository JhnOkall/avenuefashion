import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

/**
 * A Next.js API route handler for fetching a paginated and filtered list of all orders.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object, which may contain URL search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing the list of orders and pagination metadata, or an error message.
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
    
    // Parses URL search parameters for pagination and filtering.
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    // Builds the filter query for the database lookup.
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculates the number of documents to skip for pagination.
    const skip = (page - 1) * limit;
    
    // Fetches the total count of documents that match the filter for calculating total pages.
    // TODO: For very large datasets, this count operation can be slow. Consider alternative strategies if performance becomes an issue.
    const totalOrders = await Order.countDocuments(filter);
    
    /**
     * Fetches the paginated and filtered list of orders.
     * It populates the `user` field to include the customer's name and email.
     * The results are sorted by creation date in descending order (newest first).
     */
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Returns the fetched data along with pagination metadata.
    return NextResponse.json({
      data: orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
    }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ message: 'Error fetching orders', error: error.message }, { status: 500 });
  }
}