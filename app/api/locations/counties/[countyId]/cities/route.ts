import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import City from '@/models/City';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for fetching all active cities associated with a specific county.
 * This is a public endpoint, typically used to populate city dropdowns in address forms
 * after a user has selected a county.
 *
 * @param {Request} req - The incoming GET request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.countyId - The ID of the parent county.
 * @returns {Promise<NextResponse>} A JSON response containing a list of cities or an error message.
 */
// TODO: Consider caching the results of this endpoint, as location data changes infrequently. This can be done with route segment config options or a custom caching strategy.
export async function GET(req: Request, { params }: { params: Promise<{ countyId: string }> }) {

   // Await the params Promise to access the route parameters
  const resolvedParams = await params;
  
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    const { countyId } = resolvedParams;
    
    // Validates that the provided countyId is a valid MongoDB ObjectId format.
    if (!countyId || !mongoose.Types.ObjectId.isValid(countyId)) {
        return NextResponse.json({ message: 'Invalid County ID.' }, { status: 400 });
    }

    /**
     * Fetches all city documents where the `county` field matches the provided `countyId`
     * and the city is marked as active.
     * The results are sorted alphabetically by name for a consistent and user-friendly order.
     */
    const cities = await City.find({ county: countyId, isActive: true }).sort({ name: 'asc' });

    // Returns a successful response with the list of cities.
    return NextResponse.json({
      message: 'Cities fetched successfully.',
      data: cities,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error fetching cities for county ${resolvedParams.countyId}:`, error);
    // In case of an unexpected error, return a generic 500 Internal Server Error response.
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}