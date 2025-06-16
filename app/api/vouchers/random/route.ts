import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Voucher from '@/models/Voucher';
import { IVoucher } from '@/types';

/**
 * A Next.js API route handler for fetching a single random, active, percentage-based voucher.
 * This is designed to power dynamic promotional banners on the site.
 *
 * @returns {Promise<NextResponse>} A JSON response with a random voucher or an empty object.
 */
export async function GET() {
  try {
    await connectDB();

    // Define the criteria for a "promotable" voucher
    const query = {
      isActive: true,
      discountType: 'percentage',
      // Ensure the voucher has not expired
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    // Use MongoDB's aggregation pipeline to efficiently get a random document
    const randomVoucher: IVoucher[] = await Voucher.aggregate([
      { $match: query }, // Filter for promotable vouchers
      { $sample: { size: 1 } }, // Get 1 random document from the results
    ]);

    // If a voucher was found, return it. Otherwise, return null.
    if (randomVoucher.length > 0) {
      return NextResponse.json({
        message: 'Random voucher fetched successfully.',
        data: randomVoucher[0],
      }, { status: 200 });
    } else {
      // It's not an error if no vouchers are available, just return no data.
      return NextResponse.json({
        message: 'No eligible promotional vouchers found.',
        data: null,
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching random voucher:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}