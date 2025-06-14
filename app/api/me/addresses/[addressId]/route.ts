import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Address from '@/models/Address';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for deleting one of the authenticated user's addresses.
 * This is a protected route that requires a valid user session.
 *
 * @param {Request} req - The incoming DELETE request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.addressId - The ID of the address to be deleted.
 * @returns {Promise<NextResponse>} A JSON response indicating the result of the operation.
 */
// TODO: When an address is deleted, consider if it was the default address. If so, logic should be added to promote another address to be the new default.
export async function DELETE(req: Request, { params }: { params: Promise<{ addressId: string }> }) {
  /**
   * Fetches the current user's session. If no session exists, the user is unauthorized.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

   // Await the params Promise to access the route parameters
   const resolvedParams = await params;

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    const { addressId } = resolvedParams;

    // Validates that the provided addressId is a valid MongoDB ObjectId format.
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ message: 'Invalid Address ID' }, { status: 400 });
    }

    // Finds the address document to be deleted.
    const address = await Address.findById(addressId);

    // If no address is found with the provided ID, return a 404 Not Found response.
    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }

    /**
     * A critical security check to ensure the address being deleted belongs to the
     * currently authenticated user. This prevents one user from deleting another's address.
     */
    if (address.user.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // If all checks pass, delete the address document.
    await Address.findByIdAndDelete(addressId);

    // Return a success response.
    return NextResponse.json({ message: 'Address deleted successfully' }, { status: 200 });
  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error deleting address ${resolvedParams.addressId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}