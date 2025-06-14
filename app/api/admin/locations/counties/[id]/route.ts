import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import County from '@/models/County';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for updating a specific county by its ID.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The unique identifier of the county to be updated.
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
    
    const { id } = resolvedParams;

    // Validates that the provided ID is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid County ID' }, { status: 400 });
    }
    
    // Parses the JSON body from the incoming PATCH request (e.g., { name, isActive, country }).
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has the correct shape and data types before processing.
    const body = await req.json();

    /**
     * Finds a county document by its ID and applies the updates from the request body.
     * The `{ new: true, runValidators: true }` options ensure that the updated document is returned and schema validations are run.
     */
    const updatedCounty = await County.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    // If no document is found with the provided ID, return a 404 Not Found response.
    if (!updatedCounty) {
      return NextResponse.json({ message: 'County not found' }, { status: 404 });
    }
    
    // On successful update, return a success message and the updated county data.
    return NextResponse.json({
      message: 'County updated successfully',
      data: updatedCounty,
    }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error updating county:", error);
    
    // Handles potential errors, such as a duplicate key error if the county name already exists in the same country.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A county with this name already exists in the selected country.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Error updating county', error: error.message }, { status: 500 });
  }
}