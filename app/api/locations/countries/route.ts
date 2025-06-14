import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Country from '@/models/Country';

/**
 * A Next.js API route handler for fetching a list of all active countries.
 * This is a public endpoint, typically used to populate the country dropdown
 * in address forms on the storefront.
 *
 * @returns {Promise<NextResponse>} A JSON response containing an array of country objects.
 */
// TODO: Consider caching the results of this endpoint, as location data changes infrequently. This can be done with route segment config options or a custom caching strategy.
export async function GET() {
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    /**
     * Fetches all country documents from the database that are marked as active.
     * The results are sorted alphabetically by name for a consistent and user-friendly order.
     */
    const countries = await Country.find({ isActive: true }).sort({ name: 'asc' });

    // Returns a successful response with the list of countries.
    return NextResponse.json({
      message: 'Countries fetched successfully.',
      data: countries,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('Error fetching countries:', error);
    // In case of an unexpected error, return a generic 500 Internal Server Error response.
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}