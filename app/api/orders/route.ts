import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import City from '@/models/City';
import Address from '@/models/Address'; 
import Voucher from '@/models/Voucher'; 
import mongoose from 'mongoose';
import { ICartItem, ICity, IVoucher } from '@/types';

/**
 * A Next.js API route handler for creating a new order from the user's current cart.
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

    // MODIFICATION: Expect addressId and optional voucherCode instead of old payload
    const { addressId, paymentMethod, voucherCode } = await req.json();

    // --- Server-Side Validation ---
    if (!addressId || !paymentMethod) {
      return NextResponse.json({ message: 'Address and payment method are required.' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ message: 'Invalid Address ID provided.' }, { status: 400 });
    }

    // --- Fetch Dependencies ---
    const cart = await Cart.findOne({ user: session.user.id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty. Cannot place order.' }, { status: 400 });
    }

    // MODIFICATION: Fetch the full address, and populate its 'city' field to get deliveryFee
    const address = await Address.findById(addressId).populate('city');
    if (!address || !address.city) {
      return NextResponse.json({ message: 'Selected delivery address is not valid.' }, { status: 404 });
    }

    // --- Backend Price & Voucher Calculation ---
    const subtotal = cart.items.reduce((acc: number, item: ICartItem) => acc + item.price * item.quantity, 0);
    const shipping = (address.city as ICity).deliveryFee;
    const tax = subtotal * 0.16;
    let discount = 0;
    let validVoucher: IVoucher | null = null;

    // MODIFICATION: Server-side voucher validation
    if (voucherCode) {
      validVoucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
      if (!validVoucher || !validVoucher.isActive || (validVoucher.expiresAt && new Date() > new Date(validVoucher.expiresAt))) {
        // Voucher is invalid, expired, or inactive. Fail the request.
        return NextResponse.json({ message: 'The provided voucher code is invalid or expired.' }, { status: 400 });
      }

      // Calculate discount based on the validated voucher
      if (validVoucher.discountType === 'percentage') {
        discount = subtotal * (validVoucher.discountValue / 100);
      } else {
        discount = validVoucher.discountValue;
      }
    }

    const total = Math.max(0, subtotal + shipping + tax - discount);

    // MODIFICATION: Create a snapshot of the shipping details from the fetched address
    const shippingDetailsSnapshot = {
      name: address.recipientName,
      email: session.user.email, // Use the session email for the order record
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
        status: 'pending',
      },
      status: 'Pending',
      timeline: [{
        title: 'Order Placed',
        description: 'Your order has been received and is waiting for processing.',
        status: 'completed',
        timestamp: new Date(),
      }],
      voucherUsed: validVoucher ? validVoucher._id : undefined, // Optional: Link the voucher
    });

    await newOrder.save();

    // --- Post-Order Actions ---
    cart.items = [];
    await cart.save();

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