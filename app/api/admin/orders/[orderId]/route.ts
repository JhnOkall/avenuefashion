import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { ORDER_STAGES, statusToTimelineKey } from '@/lib/order-stages';
import { IOrder } from '@/types';

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
export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  /**
   * Performs an authentication and authorization check.
   */
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  // Await the params Promise to access the route parameters
  const resolvedParams = await params;
  
  try {

// Establishes a connection to the MongoDB database.    await connectDB();
    const { orderId } = resolvedParams;
    const { status }: { status: IOrder['status'] } = await req.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required.' }, { status: 400 });
    }

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    
    // --- Intelligent Timeline Update Logic ---
    const newStageKey = statusToTimelineKey[status];
    
    // Find the master template for the new stage
    const newStageTemplate = newStageKey ? ORDER_STAGES.find(s => s.key === newStageKey) : null;

    // Mark the old 'current' event as 'completed'
    const currentEventIndex: number = order.timeline.findIndex((e: { status: string }) => e.status === 'current');
    if (currentEventIndex > -1) {
      order.timeline[currentEventIndex].status = 'completed';
    }

    // Check if an event for the new status already exists
    interface TimelineEvent {
      title: string;
      description: string;
      status: 'current' | 'completed' | 'pending';
      timestamp: Date;
    }
    const newStageEventExists: boolean = order.timeline.some((e: TimelineEvent) => e.title === newStageTemplate?.title);

    if (newStageTemplate && !newStageEventExists) {
        // If it doesn't exist, add it as the new 'current' event
        order.timeline.push({
            title: newStageTemplate.title,
            description: newStageTemplate.description,
            status: 'current',
            timestamp: new Date(),
        });
    } else if (newStageTemplate && newStageEventExists) {
        // If it exists (e.g., admin is moving back and forth), just mark it as 'current'
        const existingEventIndex: number = order.timeline.findIndex((e: TimelineEvent) => e.title === newStageTemplate!.title);
        if (existingEventIndex > -1) {
            order.timeline[existingEventIndex].status = 'current';
            order.timeline[existingEventIndex].timestamp = new Date(); // Update timestamp
        }
    }
    
    // Special handling for 'Cancelled' status
    if (status === 'Cancelled') {
        // Add a unique "Cancelled" event if it doesn't exist
        interface CancellationEvent {
            title: string;
            description: string;
            status: 'completed';
            timestamp: Date;
        }

        if (!order.timeline.some((e: TimelineEvent) => e.title === 'Order Cancelled')) {
            const cancellationEvent: CancellationEvent = {
          title: 'Order Cancelled',
          description: 'This order has been cancelled.',
          status: 'completed', // A terminal, completed state
          timestamp: new Date(),
            };
            order.timeline.push(cancellationEvent);
        }
    }
    
    // Update the main order status
    order.status = status;
    
    await order.save();

    return NextResponse.json({ message: 'Order updated successfully', data: order }, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating order ${resolvedParams.orderId}:`, error);
    return NextResponse.json({ message: 'Error updating order', error: error.message }, { status: 500 });
  }
}