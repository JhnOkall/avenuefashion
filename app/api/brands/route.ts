import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Brand from '@/models/Brand';

/**
 * A Next.js API route handler for fetching a list of all product brands.
 * This is a public endpoint, meaning it does not require authentication,
 * and is typically used to populate filter options on the storefront.
 *
 * @returns {Promise<NextResponse>} A JSON response containing an array of brand objects.
 */
// TODO: Consider adding a filter, such as `Brand.find({ isActive: true })`, to ensure only active brands are shown on the storefront.
export async function GET() {
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    /**
     * Fetches all brand documents from the database.
     * The `.select('name')` method is an optimization that ensures only the `_id` and `name`
     * fields are retrieved, reducing the payload size.
     * The results are sorted alphabetically by name for a consistent and user-friendly order.
     */
    const brands = await Brand.find({}).select('name').sort({ name: 'asc' });

    // Returns a successful response with the list of brands.
    return NextResponse.json({
      message: 'Brands fetched successfully.',
      data: brands,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service (e.g., Sentry, Pino) for production environments.
    console.error('Error fetching brands:', error);
    // In case of an unexpected error, return a generic 500 Internal Server Error response.
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}