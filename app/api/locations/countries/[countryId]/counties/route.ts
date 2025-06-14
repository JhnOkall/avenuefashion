import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import County from '@/models/County';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for fetching all active counties associated with a specific country.
 * This is a public endpoint, typically used to populate county/state dropdowns in
 * address forms after a user has selected a country.
 *
 * @param {Request} req - The incoming GET request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.countryId - The ID of the parent country.
 * @returns {Promise<NextResponse>} A JSON response containing a list of counties or an error message.
 */
// TODO: Consider caching the results of this endpoint, as location data changes infrequently. This can be done with route segment config options or a custom caching strategy.
export async function GET(req: Request, { params }: { params: Promise<{ countryId: string }> }) {

 // Await the params Promise to access the route parameters
  const resolvedParams = await params;
  
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    const { countryId } = resolvedParams;
    
    // Validates that the provided countryId is a valid MongoDB ObjectId format.
    if (!countryId || !mongoose.Types.ObjectId.isValid(countryId)) {
        return NextResponse.json({ message: 'Invalid Country ID.' }, { status: 400 });
    }

    /**
     * Fetches all county documents where the `country` field matches the provided `countryId`
     * and the county is marked as active.
     * The results are sorted alphabetically by name for a consistent and user-friendly order.
     */
    const counties = await County.find({ country: countryId, isActive: true }).sort({ name: 'asc' });

    // Returns a successful response with the list of counties.
    return NextResponse.json({
      message: 'Counties fetched successfully.',
      data: counties,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error fetching counties for country ${resolvedParams.countryId}:`, error);
    // In case of an unexpected error, return a generic 500 Internal Server Error response.
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}