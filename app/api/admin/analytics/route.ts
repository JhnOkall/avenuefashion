import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for fetching aggregated analytics data for the admin dashboard.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response containing the analytics data or an error message.
 */
export async function GET(req: Request) {
  /**
   * Performs an authentication and authorization check.
   * Ensures that a session exists and the user has the 'admin' role.
   * This is a critical security gate for the endpoint.
   */
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    // Calculate the date 30 days ago for time-based queries.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // --- Define all database query promises ---
    // This approach allows all queries to be prepared before execution.

    // 1. Fetch high-level statistics.
    // Calculates the sum of the 'total' field from all confirmed orders.
    const totalRevenuePromise = Order.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    // Counts the total number of confirmed orders.
    const totalSalesPromise = Order.countDocuments({ status: 'Confirmed' });
    // Counts the number of new user accounts created in the last 30 days.
    const newCustomersPromise = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    // Counts the total number of products marked as active.
    const activeProductsPromise = Product.countDocuments({ isActive: true });

    // 2. Fetch data for the revenue overview chart (last 30 days).
    const revenueOverTimePromise = Order.aggregate([
      // Filter for confirmed orders within the last 30 days.
      { $match: { status: 'Confirmed', createdAt: { $gte: thirtyDaysAgo } } },
      // Group documents by day and sum the revenue for each day.
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
        },
      },
      // Sort the results chronologically.
      { $sort: { _id: 1 } },
      // Reshape the output to a more friendly format for the client-side chart.
      { $project: { _id: 0, date: '$_id', revenue: 1 } }
    ]);

    // 3. Fetch the 5 most recent orders for the "Recent Sales" list.
    // TODO: The `populate` call can be made more efficient by explicitly selecting fields: .populate('user', 'name email image').
    const recentOrdersPromise = Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    /**
     * Executes all defined promises concurrently using `Promise.all`.
     * This is significantly more performant than awaiting each query individually,
     * as it allows the database to process the queries in parallel.
     */
    const [
      revenueResult,
      salesCount,
      customerCount,
      productCount,
      revenueData,
      recentOrders,
    ] = await Promise.all([
      totalRevenuePromise,
      totalSalesPromise,
      newCustomersPromise,
      activeProductsPromise,
      revenueOverTimePromise,
      recentOrdersPromise,
    ]);

    /**
     * Structures the results from the promises into a clean `stats` object.
     */
    const stats = {
      totalRevenue: revenueResult[0]?.total || 0,
      totalSales: salesCount,
      newCustomers: customerCount,
      activeProducts: productCount,
    };

    /**
     * Returns the complete, aggregated analytics data in a single response.
     */
    return NextResponse.json({
      stats,
      revenueOverTime: revenueData,
      recentOrders,
    }, { status: 200 });

  } catch (error: any) {
    // TODO: Implement a more robust logging service (e.g., Sentry, Pino) for production environments.
    console.error("Error fetching admin analytics:", error);
    // In a production environment, you might want to avoid sending the raw error message to the client.
    return NextResponse.json({ message: 'Error fetching analytics data', error: error.message }, { status: 500 });
  }
}