import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import City from '@/models/City';
import mongoose from 'mongoose';
import { ICartItem } from '@/types';

/**
 * A Next.js API route handler for creating a new order from the user's current cart.
 * This is a protected route that requires user authentication.
 *
 * @param {Request} req - The incoming POST request object.
 * @returns {Promise<NextResponse>} A JSON response indicating the result of the order creation.
 */
export async function POST(req: Request) {
  /**
   * Fetches the current user's session.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to place an order.' }, { status: 401 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    // Parses the JSON body from the incoming POST request.
    const { shippingDetails, paymentMethod, cityId } = await req.json();

    // --- Server-Side Validation ---
    // TODO: Implement a more robust validation library like Zod for the request body.
    if (!shippingDetails || !paymentMethod || !cityId) {
      return NextResponse.json({ message: 'Shipping details, payment method, and city are required.' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return NextResponse.json({ message: 'Invalid City ID provided.' }, { status: 400 });
    }

    // --- Fetch Dependencies ---
    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty. Cannot place order.' }, { status: 400 });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return NextResponse.json({ message: 'Selected delivery city is not valid.' }, { status: 404 });
    }

    // --- Backend Price Calculation ---
    // It's critical to recalculate prices on the backend to prevent client-side manipulation.
    const subtotal = cart.items.reduce((acc: number, item: ICartItem) => acc + item.price * item.quantity, 0);
    const shipping = city.deliveryFee;
    const tax = subtotal * 0.16; // Example: 16% VAT. This should be a configurable value.
    const discount = 0; // TODO: Implement voucher/discount logic here.
    const total = subtotal + shipping + tax - discount;

    // --- Create the Order Document ---
    const newOrder = new Order({
      user: session.user.id,
      items: cart.items, // Cart items are already snapshots of product details.
      pricing: { subtotal, shipping, tax, discount, total },
      shippingDetails, // This is a snapshot of the shipping info at the time of order.
      payment: {
        method: paymentMethod,
        status: 'pending', // Payment status will be updated by a webhook or subsequent API call.
      },
      status: 'Pending',
      // Creates the initial timeline event for the order.
      timeline: [{
        title: 'Order Placed',
        description: 'Your order has been received and is waiting for processing.',
        status: 'completed',
        timestamp: new Date(),
      }],
    });

    await newOrder.save();

    // --- Post-Order Actions ---
    // Clear the user's cart after the order has been successfully created.
    cart.items = [];
    await cart.save();

    // TODO: Trigger other side effects, such as sending a confirmation email,
    // notifying inventory systems, or sending a webhook to a fulfillment service.

    // Return a 201 Created status with the newly created order data.
    return NextResponse.json({
      message: 'Order placed successfully.',
      data: newOrder,
    }, { status: 201 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('POST /api/orders Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for fetching a paginated list of the current user's past orders.
 * This is a protected route that requires user authentication.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response with the user's orders and pagination metadata.
 */
export async function GET(req: Request) {
  /**
   * Fetches the current user's session.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    
    // Parses URL search parameters for pagination and filtering.
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Builds the base filter query to only include orders by the authenticated user.
    const filter: any = { user: session.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    // Fetches the total count of documents that match the filter for calculating total pages.
    const totalOrders = await Order.countDocuments(filter);
    
    /**
     * Fetches the paginated and filtered list of orders.
     * The `.select()` method is an optimization to retrieve only the fields
     * necessary for the order list view, reducing payload size.
     */
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('orderId createdAt pricing.total status');

    // Returns the fetched data along with pagination metadata.
    return NextResponse.json({
      message: 'Orders fetched successfully.',
      data: orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    }, { status: 200 });
  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('GET /api/orders Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}