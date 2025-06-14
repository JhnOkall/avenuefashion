import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import City from '@/models/City';

/**
 * A Next.js API route handler for updating a specific city by its ID.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The unique identifier of the city to be updated.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  /**
   * Performs an authentication and authorization check.
   */
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

     // Await the params Promise to access the route parameters
     const resolvedParams = await params;
    
    // Parses the JSON body from the incoming PATCH request (e.g., { name, isActive, deliveryFee }).
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has the correct shape and data types before processing.
    const body = await req.json();
    
    /**
     * Finds a city document by its ID and applies the updates from the request body.
     * The `{ new: true, runValidators: true }` options ensure that the updated document is returned and schema validations are run.
     */
    const updatedCity = await City.findByIdAndUpdate(resolvedParams.id, body, { new: true, runValidators: true });

    // If no document is found with the provided ID, return a 404 Not Found response.
    if (!updatedCity) {
      return NextResponse.json({ message: 'City not found' }, { status: 404 });
    }

    // On successful update, return a success message and the updated city data.
    return NextResponse.json({ message: 'City updated successfully', data: updatedCity }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error updating city:", error);
    return NextResponse.json({ message: 'Error updating city', error: error.message }, { status: 500 });
  }
}