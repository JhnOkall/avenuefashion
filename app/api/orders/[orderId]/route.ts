import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for fetching the details of a specific order.
 * This is a protected route that requires user authentication. It also enforces
 * authorization by ensuring a regular user can only fetch their own orders,
 * while an admin can fetch any order.
 *
 * @param {Request} req - The incoming GET request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.orderId - The user-facing ID of the order to fetch.
 * @returns {Promise<NextResponse>} A JSON response containing the order details or an error message.
 */
export async function GET(req: Request, { params }: { params: { orderId: string } }) {
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
    const { orderId } = params;

    // Validates the presence of the required orderId parameter.
    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required.' }, { status: 400 });
    }

    /**
     * Constructs the base query to find an order by its user-facing ID.
     */
    // TODO: This query assumes the `orderId` in the database does not have a prefix.
    // If it does (e.g., "#ORD-123"), the query should be adjusted to `orderId: orderId`.
    const query: any = { orderId: orderId };

    /**
     * Authorization Logic:
     * - If the user is an admin, they can view any order.
     * - If the user is not an admin, the query is modified to ONLY match orders
     *   that also belong to the currently authenticated user. This is a critical
     *   security measure to prevent data leakage.
     */
    if (session.user.role !== 'admin') {
        query.user = session.user.id;
    }
    
    // Executes the query, populating the `user` field with their name and email.
    const order = await Order.findOne(query).populate('user', 'name email');

    // If no order is found matching the query, return a 404 Not Found response.
    if (!order) {
      return NextResponse.json({ message: 'Order not found or access denied.' }, { status: 404 });
    }

    // Returns a successful response with the detailed order data.
    return NextResponse.json({
      message: 'Order details fetched successfully.',
      data: order,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`GET /api/orders/${params.orderId} Error:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}