import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Address from '@/models/Address';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * A helper function to ensure only one address is the default.
 * If a new address is set as default, this function will find any other
 * default address for the user and set its `isDefault` flag to false.
 * 
 * @param userId The ID of the user.
 * @param newDefaultAddressId The ID of the address being set as the new default.
 */
const demoteOldDefaultAddress = async (userId: string, newDefaultAddressId: string) => {
  await Address.updateMany(
    { user: userId, _id: { $ne: newDefaultAddressId }, isDefault: true },
    { $set: { isDefault: false } }
  );
};

// =================================================================
// PATCH - Update an Address
// =================================================================

/**
 * A Next.js API route handler for updating one of the authenticated user's addresses.
 * This is a protected route.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {string} context.params.addressId - The ID of the address to be updated.
 * @returns {Promise<NextResponse>} A JSON response indicating the result of the operation.
 */
export async function PATCH(req: Request, { params }: { params: { addressId: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { addressId } = params;
        const body = await req.json();

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return NextResponse.json({ message: 'Invalid Address ID' }, { status: 400 });
        }

        const address = await Address.findById(addressId);
        if (!address) {
            return NextResponse.json({ message: 'Address not found' }, { status: 404 });
        }
        if (address.user.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // If the user is setting this address as the new default, demote the old one.
        if (body.isDefault === true) {
            await demoteOldDefaultAddress(session.user.id, addressId);
        }

        // Update the address document with the provided data.
        const updatedAddress = await Address.findByIdAndUpdate(addressId, body, { new: true, runValidators: true }).populate('country county city');

        return NextResponse.json({ message: 'Address updated successfully', data: updatedAddress }, { status: 200 });

    } catch (error) {
        console.error(`Error updating address ${params.addressId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// =================================================================
// DELETE - Delete an Address
// =================================================================

/**
 * A Next.js API route handler for deleting one of the authenticated user's addresses.
 * This is a protected route that requires a valid user session.
 */
export async function DELETE(req: Request, { params }: { params: { addressId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
 
  try {
    await connectDB();
    const { addressId } = params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ message: 'Invalid Address ID' }, { status: 400 });
    }

    const addressToDelete = await Address.findById(addressId);
    if (!addressToDelete) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }
    if (addressToDelete.user.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Perform deletion
    await Address.findByIdAndDelete(addressId);
    
    // Also remove the address reference from the User document's addresses array
    await User.findByIdAndUpdate(session.user.id, { $pull: { addresses: addressId } });

    // --- Auto-promotion logic (Completing the TODO) ---
    // If the deleted address was the default one, promote the most recently updated remaining address to be the new default.
    if (addressToDelete.isDefault) {
      const nextAddress = await Address.findOneAndUpdate(
        { user: session.user.id }, // Find any remaining address for this user
        { $set: { isDefault: true } }, // Set it as default
        { new: true, sort: { updatedAt: -1 } } // Sort by most recently updated to pick a consistent one
      );
    }

    return NextResponse.json({ message: 'Address deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting address ${params.addressId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}