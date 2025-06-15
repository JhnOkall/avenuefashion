import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import { IOrder } from '@/types';

/**
 * Internal webhook handler for Avenue Fashion.
 * This endpoint should ONLY be called by the central Nyota webhook router.
 * It is responsible for all database updates related to payment events.
 */
export async function POST(req: Request) {
  const internalSecret = process.env.AVENUE_FASHION_INTERNAL_SECRET!;
  if (!internalSecret) {
      console.error('FATAL: AVENUE_FASHION_INTERNAL_SECRET is not configured.');
      return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  const requestBody = await req.text();
  const headersList = await headers();
  const internalSignature = headersList.get('x-internal-signature');

  // Step 1: Verify the request came from our trusted central Nyota API
  const expectedSignature = crypto.createHmac('sha256', internalSecret).update(requestBody).digest('hex');
  if (expectedSignature !== internalSignature) {
    console.warn('Invalid internal webhook signature. Request rejected.');
    return NextResponse.json({ message: 'Forbidden: Invalid signature.' }, { status: 403 });
  }

  const event = JSON.parse(requestBody);

  // Step 2: Process the 'charge.success' event
  if (event.event === 'charge.success') {
    const { status, metadata } = event.data;

    if (status === 'success') {
      try {
        await connectDB();
        const orderId = metadata.orderId;

        if (!orderId) {
          console.error('Webhook payload is missing orderId in metadata.', metadata);
          return NextResponse.json({ status: 'error', message: 'Missing orderId' }, { status: 400 });
        }

        const order: IOrder | null = await Order.findOne({ orderId: orderId });
        if (!order) {
          console.error(`Order with ID ${orderId} not found in the database.`);
          return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
        }
        
        if (order.payment.status === 'completed') {
            console.log(`Payment for order ${orderId} has already been processed. Acknowledging.`);
            return NextResponse.json({ status: 'ok' });
        }

        // Step 3: Update the order document
        order.payment.status = 'completed';
        order.payment.transactionId = event.data.reference;
        order.status = 'Processing';

        // Update the timeline
        const placedEvent = order.timeline.find(e => e.title === 'Order Placed');
        if (placedEvent) {
            placedEvent.status = 'completed';
        }
        
        order.timeline.push({
            title: 'Processing',
            description: 'We are preparing your items for shipment at the warehouse.',
            status: 'current',
            timestamp: new Date(),
        });
        
        await order.save();

        // Step 4: Clear the user's cart AFTER successful payment
        const userCart = await Cart.findOne({ user: order.user });
        if (userCart) {
          userCart.items = [];
          await userCart.save();
          console.log(`Cart cleared for user ${order.user} after successful payment for order ${orderId}.`);
        }

        console.log(`Successfully processed payment and updated order ${orderId}.`);

      } catch (error) {
        console.error(`Error processing webhook for order ${metadata?.orderId}:`, error);
        return NextResponse.json({ message: 'Internal server error while updating order.' }, { status: 500 });
      }
    }
  }

  // Step 5: Acknowledge receipt of the event
  return NextResponse.json({ status: 'ok' });
}