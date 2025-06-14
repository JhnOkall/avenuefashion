import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Voucher from '@/models/Voucher';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for updating a specific voucher by its ID.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The unique identifier of the voucher to be updated.
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

   // Await the params Promise to access the route parameters
   const resolvedParams = await params;
  
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    
    // Validates that the provided ID is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
      return NextResponse.json({ message: 'Invalid Voucher ID' }, { status: 400 });
    }

    // Parses the JSON body from the incoming PATCH request. The body can contain any field to update.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has a valid shape and data types before processing.
    const body = await req.json();

    /**
     * Finds a voucher document by its ID and applies the updates from the request body.
     * The `{ new: true, runValidators: true }` options ensure that the updated document is returned and schema validations are run.
     */
    const updatedVoucher = await Voucher.findByIdAndUpdate(resolvedParams.id, body, { new: true, runValidators: true });

    // If no document is found with the provided ID, return a 404 Not Found response.
    if (!updatedVoucher) {
      return NextResponse.json({ message: 'Voucher not found' }, { status: 404 });
    }

    // On successful update, return a success message and the updated voucher data.
    return NextResponse.json({ message: 'Voucher updated successfully', data: updatedVoucher }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error updating voucher ${resolvedParams.id}:`, error);
    
    // Specifically handles the MongoDB duplicate key error (code 11000), which can occur if the `code` is changed to one that already exists.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A voucher with this code already exists.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Error updating voucher', error: error.message }, { status: 500 });
  }
}