import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { ORDER_STAGES, statusToTimelineKey } from '@/lib/order-stages';
import { IOrder, IOrderTimelineEvent } from '@/types';
import { sendNotificationToUser } from '@/lib/notification-service';

// --- NEW: Define an interface for the expected request body ---
interface UpdateOrderPayload {
    status?: IOrder['status'];
    paymentStatus?: IOrder['payment']['status'];
}

export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

    const resolvedParams = await params;
    
  try {
    await connectDB();
    const { orderId } = resolvedParams;
    
    // --- FIX: Apply the strong type to the entire parsed JSON body ---
    const { status, paymentStatus }: UpdateOrderPayload = await req.json();

    if (!status && !paymentStatus) {
      return NextResponse.json({ message: 'A delivery status or payment status is required.' }, { status: 400 });
    }

    const order = await Order.findOne({ orderId: orderId });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    let notificationPayload = null;

    // Logic to handle DELIVERY status update
    if (status) {
      order.status = status;

      // --- This line no longer causes an error ---
      // TypeScript now knows `status` is of type `IOrder['status']` and is a valid key.
      const newStageKey = statusToTimelineKey[status];
      const newStageTemplate = newStageKey ? ORDER_STAGES.find(s => s.key === newStageKey) : null;

      const currentEventIndex = order.timeline.findIndex((e: IOrderTimelineEvent) => e.status === 'current');
      if (currentEventIndex > -1) {
        order.timeline[currentEventIndex].status = 'completed';
      }

      const newStageEventExists = order.timeline.some((e: IOrderTimelineEvent) => e.title === newStageTemplate?.title);

      if (newStageTemplate && !newStageEventExists) {
        order.timeline.push({
            title: newStageTemplate.title,
            description: newStageTemplate.description,
            status: 'current',
            timestamp: new Date(),
        });
      } else if (newStageTemplate && newStageEventExists) {
        const existingEventIndex = order.timeline.findIndex((e: IOrderTimelineEvent) => e.title === newStageTemplate!.title);
        if (existingEventIndex > -1) {
            order.timeline[existingEventIndex].status = 'current';
            order.timeline[existingEventIndex].timestamp = new Date();
        }
      }
      
      if (status === 'Cancelled') {
        if (!order.timeline.some((e: IOrderTimelineEvent) => e.title === 'Order Cancelled')) {
            order.timeline.push({
                title: 'Order Cancelled',
                description: 'This order has been cancelled.',
                status: 'completed',
                timestamp: new Date(),
            });
        }
      }

      // Set notification for delivery status change
      switch (status) {
        case 'In transit':
            notificationPayload = { title: 'Your Order is on its Way! 🚚', body: `Great news! Your order #${order.orderId} has been shipped.`, url: `/me/orders/${order.orderId}`};
            break;
        case 'Delivered':
            notificationPayload = { title: 'Your Order Has Been Delivered! ✅', body: `We hope you enjoy your purchase! Please consider leaving a review.`, url: `/me/orders/${order.orderId}` };
            break;
        case 'Cancelled':
            notificationPayload = { title: 'Order Cancelled', body: `Your order #${order.orderId} has been cancelled. Please contact support if you have questions.`, url: `/me/orders/${order.orderId}` };
            break;
      }
    }
    
    // Logic to handle PAYMENT status update
    if (paymentStatus) {
      order.payment.status = paymentStatus;

      if (paymentStatus === 'Completed' && order.status === 'Confirmed') {
        notificationPayload = { title: 'Payment Confirmed', body: `Payment for your order #${order.orderId} has been confirmed. It's now being processed.`, url: `/me/orders/${order.orderId}` };
      }
    }
    
    const updatedOrder = await order.save();

    if (notificationPayload && updatedOrder.user) {
        try {
            await sendNotificationToUser(updatedOrder.user.toString(), notificationPayload);
        } catch (notificationError) {
            console.error("Failed to send order status update notification:", notificationError);
        }
    }

    return NextResponse.json({ message: 'Order updated successfully', data: updatedOrder }, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating order:`, error);
    return NextResponse.json({ message: 'Error updating order', error: error.message }, { status: 500 });
  }
}