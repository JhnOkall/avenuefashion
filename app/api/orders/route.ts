import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Address from '@/models/Address'; 
import Voucher from '@/models/Voucher'; 
import mongoose from 'mongoose';
import { ICity, IVoucher, ICartItem } from '@/types';

/**
 * A Next.js API route handler for creating a new order.
 * This is a protected route that requires user authentication.
 *
 * @param {Request} req - The incoming POST request object.
 * @returns {Promise<NextResponse>} A JSON response indicating the result of the order creation.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to place an order.' }, { status: 401 });
  }

  try {
    await connectDB();

    const { addressId, paymentMethod, voucherCode } = await req.json();

    // --- Server-Side Validation ---
    if (!addressId || !paymentMethod) {
      return NextResponse.json({ message: 'Address and payment method are required.' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ message: `Invalid Address ID format: ${addressId}` }, { status: 400 });
    }

    // --- Fetch Dependencies ---
    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty. Cannot place order.' }, { status: 400 });
    }

    const address = await Address.findOne({ _id: addressId, user: session.user.id }).populate('city');
    if (!address) {
      return NextResponse.json({ message: 'The selected delivery address could not be found for your account.' }, { status: 404 });
    }
    if (!address.city) {
      return NextResponse.json({ message: 'Address data is incomplete. Missing city information.' }, { status: 400 });
    }

    // --- Backend Price & Voucher Calculation ---
    const subtotal = cart.items.reduce((acc: number, item: ICartItem) => acc + item.price * item.quantity, 0);
    const shipping = (address.city as ICity).deliveryFee;
    const tax = subtotal * 0.16; // Example: 16% VAT
    let discount = 0;
    let validVoucher: IVoucher | null = null;

    if (voucherCode) {
      validVoucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
      if (!validVoucher || !validVoucher.isActive || (validVoucher.expiresAt && new Date() > new Date(validVoucher.expiresAt))) {
        return NextResponse.json({ message: 'The provided voucher code is invalid or expired.' }, { status: 400 });
      }
      discount = validVoucher.discountType === 'percentage' ? subtotal * (validVoucher.discountValue / 100) : validVoucher.discountValue;
    }

    const total = Math.max(0, subtotal + shipping + tax - discount);

    const shippingDetailsSnapshot = {
      name: address.recipientName,
      email: session.user.email,
      phone: address.phone,
      address: `${address.streetAddress}, ${(address.city as ICity).name}`,
    };

    // --- Create the Order Document ---
    const newOrder = new Order({
      user: session.user.id,
      items: cart.items,
      pricing: { subtotal, shipping, tax, discount, total },
      shippingDetails: shippingDetailsSnapshot,
      payment: {
        method: paymentMethod,
        // For 'on-delivery', we can consider the payment 'pending' until cash is received.
        // For 'paystack', it's 'pending' until the webhook confirms it.
        status: 'pending',
      },
      status: 'Pending',
      timeline: [{
        title: 'Order Placed',
        description: 'Your order has been received and is waiting for processing.',
        status: 'current',
        timestamp: new Date(),
      }],
      voucherUsed: validVoucher ? validVoucher._id : undefined,
    });

    await newOrder.save();

    // --- Post-Order Actions: Conditional Cart Clearing ---
    if (paymentMethod === 'on-delivery') {
      // For "Pay on Delivery", the user flow is complete. Clear the cart now.
      cart.items = [];
      await cart.save();
      console.log(`Cart cleared for on-delivery order: ${newOrder.orderId}`);
    }
    // For "paystack", we do NOT clear the cart here. This will be handled by the webhook.

    return NextResponse.json({
      message: 'Order placed successfully.',
      data: newOrder,
    }, { status: 201 });

  } catch (error) {
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