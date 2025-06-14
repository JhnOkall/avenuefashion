import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

/**
 * A Next.js API route handler for updating a specific order by its user-facing ID.
 * This can be used to update the order's status or add an event to its timeline.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.orderId - The user-facing identifier of the order to update (e.g., "ORD-12345").
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function PATCH(req: Request, { params }: { params: { orderId: string } }) {
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
    
    // Parses the JSON body from the incoming PATCH request.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has the correct shape and data types.
    const { status, timelineEvent } = await req.json();

    // Finds the order document using its custom, user-facing `orderId` field.
    const order = await Order.findOne({ orderId: params.orderId });

    // If no order is found with the provided ID, return a 404 Not Found response.
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    // Updates the order's status if a new status is provided in the request body.
    if (status) {
      order.status = status;
    }

    // Adds a new event to the beginning of the order's timeline array if provided.
    if (timelineEvent) {
      // TODO: Add validation for the `timelineEvent` object structure.
      order.timeline.unshift(timelineEvent);
    }
    
    // Saves the modified order document to the database.
    await order.save();

    // On successful update, return a success message and the updated order data.
    return NextResponse.json({ message: 'Order updated successfully', data: order }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error updating order ${params.orderId}:`, error);
    return NextResponse.json({ message: 'Error updating order', error: error.message }, { status: 500 });
  }
}