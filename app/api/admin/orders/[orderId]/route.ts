import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { ORDER_STAGES, statusToTimelineKey } from '@/lib/order-stages';
import { IOrder } from '@/types';
// --- 1. IMPORT THE NOTIFICATION SERVICE ---
import { sendNotificationToUser } from '@/lib/notification-service';


export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    const resolvedParams = await params;

  try {
    await connectDB();
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
    const newStageTemplate = newStageKey ? ORDER_STAGES.find(s => s.key === newStageKey) : null;

    const currentEventIndex = order.timeline.findIndex((e: any) => e.status === 'current');
    if (currentEventIndex > -1) {
      order.timeline[currentEventIndex].status = 'completed';
    }

    const newStageEventExists = order.timeline.some((e: any) => e.title === newStageTemplate?.title);

    if (newStageTemplate && !newStageEventExists) {
        order.timeline.push({
            title: newStageTemplate.title,
            description: newStageTemplate.description,
            status: 'current',
            timestamp: new Date(),
        });
    } else if (newStageTemplate && newStageEventExists) {
        const existingEventIndex = order.timeline.findIndex((e: any) => e.title === newStageTemplate!.title);
        if (existingEventIndex > -1) {
            order.timeline[existingEventIndex].status = 'current';
            order.timeline[existingEventIndex].timestamp = new Date();
        }
    }
    
    if (status === 'Cancelled') {
        if (!order.timeline.some((e: any) => e.title === 'Order Cancelled')) {
            order.timeline.push({
                title: 'Order Cancelled',
                description: 'This order has been cancelled.',
                status: 'completed',
                timestamp: new Date(),
            });
        }
    }
    
    // Update the main order status
    order.status = status;
    
    const updatedOrder = await order.save();


    // --- 2. TRIGGER NOTIFICATION ---
    // After the order is successfully saved, send a notification.
    if (updatedOrder && updatedOrder.user) {
        let notificationPayload = null;

        // Create different messages based on the new status
        switch (status) {
            case 'In transit':
                notificationPayload = {
                    title: 'Your Order is on its Way! 🚚',
                    body: `Great news! Your order #${updatedOrder.orderId} has been shipped.`,
                    url: `/me/orders/${updatedOrder.orderId}`,
                };
                break;
            case 'Delivered':
                notificationPayload = {
                    title: 'Your Order Has Been Delivered! ✅',
                    body: `We hope you enjoy your purchase! Please consider leaving a review.`,
                    url: `/me/orders/${updatedOrder.orderId}`,
                };
                break;
            case 'Cancelled':
                notificationPayload = {
                    title: 'Order Cancelled',
                    body: `Your order #${updatedOrder.orderId} has been cancelled. Please contact support if you have questions.`,
                    url: `/me/orders/${updatedOrder.orderId}`,
                };
                break;
        }

        if (notificationPayload) {
            try {
                // updatedOrder.user is an ObjectId, so we convert it to a string.
                await sendNotificationToUser(updatedOrder.user.toString(), notificationPayload);
            } catch (notificationError) {
                // Log the error but don't fail the API request.
                console.error("Failed to send order status update notification:", notificationError);
            }
        }
    }
    // --- END NOTIFICATION TRIGGER ---

    return NextResponse.json({ message: 'Order updated successfully', data: updatedOrder }, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating order:`, error);
    return NextResponse.json({ message: 'Error updating order', error: error.message }, { status: 500 });
  }
}