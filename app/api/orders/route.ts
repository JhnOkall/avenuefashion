import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Address from '@/models/Address'; 
import Product from '@/models/Product';
import Voucher from '@/models/Voucher'; 
import mongoose from 'mongoose';
import { ICity, IVoucher, ICartItem } from '@/types';
// --- 1. IMPORT THE NOTIFICATION SERVICE ---
import { sendNotificationToAdmins, sendNotificationToUser } from '@/lib/notification-service';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to place an order.' }, { status: 401 });
  }
  
  // Using a Mongoose session for transaction-like behavior
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  // Define newOrder outside the try block to make it accessible in the finally block
  let newOrder = null;

  try {
    await connectDB();

    const { addressId, paymentMethod, voucherCode } = await req.json();

    if (!addressId || !paymentMethod) {
      await dbSession.abortTransaction();
      return NextResponse.json({ message: 'Address and payment method are required.' }, { status: 400 });
    }
    
    const cart = await Cart.findOne({ user: session.user.id }).session(dbSession);
    if (!cart || cart.items.length === 0) {
      await dbSession.abortTransaction();
      return NextResponse.json({ message: 'Your cart is empty. Cannot place order.' }, { status: 400 });
    }

    const address = await Address.findOne({ _id: addressId, user: session.user.id }).populate('city').session(dbSession);
    if (!address || !address.city) {
      await dbSession.abortTransaction();
      return NextResponse.json({ message: 'Delivery address is invalid or incomplete.' }, { status: 404 });
    }

    const subtotal = cart.items.reduce((acc: number, item: ICartItem) => acc + item.price * item.quantity, 0);
    const shipping = (address.city as ICity).deliveryFee;
    const tax = subtotal * 0.16;
    let discount = 0;
    let validVoucher: IVoucher | null = null;

    if (voucherCode) {
      validVoucher = await Voucher.findOne({ code: voucherCode.toUpperCase() }).session(dbSession);
      if (!validVoucher || !validVoucher.isActive || (validVoucher.expiresAt && new Date() > new Date(validVoucher.expiresAt))) {
        await dbSession.abortTransaction();
        return NextResponse.json({ message: 'The provided voucher code is invalid or expired.' }, { status: 400 });
      }
      discount = validVoucher.discountType === 'percentage' ? subtotal * (validVoucher.discountValue / 100) : validVoucher.discountValue;
    }

    const total = Math.max(0, subtotal + shipping + tax - discount);

    // --- Decrement Stock ---
    for (const item of cart.items) {
      if (item.variantId) {
        // Decrement stock for a specific variant
        const result = await Product.updateOne(
          { _id: item.product, 'variants._id': item.variantId, 'variants.stock': { $gte: item.quantity } },
          { $inc: { 'variants.$.stock': -item.quantity } },
          { session: dbSession }
        );
        if (result.modifiedCount === 0) throw new Error(`Insufficient stock for variant of product ${item.name}`);
      } else {
        // Decrement stock for a simple product
        const result = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session: dbSession }
        );
        if (result.modifiedCount === 0) throw new Error(`Insufficient stock for product ${item.name}`);
      }
    }
    
    // --- FIX START: Update Order creation to match new status logic ---
    const orderInstance = new Order({
      user: session.user.id,
      items: cart.items, 
      pricing: { subtotal, shipping, tax, discount, total },
      shippingDetails: {
        name: address.recipientName,
        email: session.user.email || 'N/A', // Fallback for email
        phone: address.phone,
        address: `${address.streetAddress}, ${(address.city as ICity).name}`,
      },
      payment: { 
        method: paymentMethod, 
        status: 'Pending' // Capitalized to match schema
      },
      status: 'Confirmed', // Default delivery status is now 'Confirmed'
      timeline: [{
        title: 'Order Confirmed', // Updated timeline event title
        description: 'Your order has been confirmed and is waiting for processing.', // Updated description
        status: 'current',
        timestamp: new Date(),
      }],
      appliedVoucher: validVoucher ? validVoucher._id : undefined,
    });
    // --- FIX END ---

    // Assign the saved order to the outer scope variable
    newOrder = await orderInstance.save({ session: dbSession });

    // --- Post-Order Actions: Clear the cart ---
    cart.items = [];
    await cart.save({ session: dbSession });

    // If all operations were successful, commit the transaction
    await dbSession.commitTransaction();

   // --- 2. TRIGGER NOTIFICATIONS (User and Admin) ---
    if (newOrder) {
      // Promise for sending notification to the customer
      const userNotificationPromise = sendNotificationToUser(session.user.id, {
        title: 'Order Confirmed! 🎉',
        body: `Your order #${newOrder.orderId} has been successfully placed.`,
        url: `/me/orders/${newOrder.orderId}`,
      });

      // Promise for sending notification to all admins
      const adminNotificationPromise = sendNotificationToAdmins({
        title: 'New Order Received! 📦',
        body: `Order #${newOrder.orderId} from ${newOrder.shippingDetails.name} for KES ${newOrder.pricing.total.toFixed(2)}.`,
        url: `/orders/${newOrder.orderId}`, // Direct link to admin order detail page
      });

      // Execute both promises concurrently and log any errors without failing the request.
      Promise.all([userNotificationPromise, adminNotificationPromise]).catch(notificationError => {
        console.error("Failed to send one or more order confirmation notifications:", notificationError);
      });
    }
    // --- END NOTIFICATION TRIGGER ---


    return NextResponse.json({
      message: 'Order placed successfully.',
      data: newOrder,
    }, { status: 201 });

  } catch (error: any) {
    // If any error occurs, abort the transaction
    await dbSession.abortTransaction();
    console.error('POST /api/orders Error:', error);
    // Return the specific stock error message if that was the cause
    const errorMessage = error.message.startsWith('Insufficient stock') ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  } finally {
    // End the session
    dbSession.endSession();
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const filter: any = { user: session.user.id };
    if (status && status !== 'all') {
      filter.status = status;
    }
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('orderId createdAt pricing.total status items'); // Added items to show a summary on order list
    return NextResponse.json({
      message: 'Orders fetched successfully.',
      data: orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/orders Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}