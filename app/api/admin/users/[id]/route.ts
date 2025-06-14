import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for updating a specific user's role by their ID.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The unique identifier of the user to be updated.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function PATCH(req: Request, { params }: { params: { id:string } }) {
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
    const { id } = params;

    // Validates that the provided ID is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    // Parses the JSON body from the incoming PATCH request.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body has the correct shape.
    const { role } = await req.json();

    // Validates that the provided role is one of the allowed values.
    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }
    
    /**
     * A critical safety check to prevent an administrator from accidentally
     * locking themselves out of the system by demoting the last remaining admin account.
     */
    if (role === 'user') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            const userToUpdate = await User.findById(id);
            if (userToUpdate?.role === 'admin') {
                return NextResponse.json({ message: 'Cannot demote the last admin account.' }, { status: 400 });
            }
        }
    }

    /**
     * Finds a user document by its ID and updates the `role` field.
     * The `{ new: true }` option ensures that the updated document is returned.
     */
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

    // If no document is found with the provided ID, return a 404 Not Found response.
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // On successful update, return a success message and the updated user data.
    return NextResponse.json({ message: 'User role updated successfully', data: updatedUser }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error updating role for user ${params.id}:`, error);
    return NextResponse.json({ message: 'Error updating user role', error: error.message }, { status: 500 });
  }
}