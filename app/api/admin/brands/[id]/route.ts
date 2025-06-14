import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Brand from '@/models/Brand';

/**
 * A Next.js API route handler for updating a specific brand by its ID.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The unique identifier of the brand to be updated.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

     // Await the params Promise to access the route parameters
     const resolvedParams = await params;
    
    // Parses the JSON body from the incoming PATCH request.
    // This body contains the fields to be updated (e.g., { name: 'New Name' } or { isActive: false }).
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has the correct shape and data types before processing.
    const body = await req.json();

    /**
     * Finds a brand document by its ID and applies the updates from the request body.
     * The `{ new: true }` option ensures that the updated document is returned.
     */
    const updatedBrand = await Brand.findByIdAndUpdate(resolvedParams.id, body, { new: true, runValidators: true });

    // If no document is found with the provided ID, return a 404 Not Found response.
    if (!updatedBrand) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }

    // On successful update, return a success message and the updated brand data.
    return NextResponse.json({ message: 'Brand updated successfully', data: updatedBrand }, { status: 200 });

  } catch (error: any) {
    // TODO: Implement a more robust logging service (e.g., Sentry, Pino) for production environments.
    console.error("Error updating brand:", error);
    // Handles potential errors, such as database connection issues or validation failures from Mongoose.
    return NextResponse.json({ message: 'Error updating brand', error: error.message }, { status: 500 });
  }
}