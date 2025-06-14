import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Address from '@/models/Address';

/**
 * A Next.js API route handler for fetching all saved addresses for the authenticated user.
 * This is a protected route that requires a valid user session.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the user's addresses or an error message.
 */
export async function GET(req: Request) {
  /**
   * Fetches the current user's session. If no session exists, the user is unauthorized.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    /**
     * Fetches all address documents associated with the authenticated user's ID.
     * The `populate` method is used to replace the ObjectId references for country, county, and city
     * with their actual document data, which is useful for display on the client.
     * The results are sorted to show the default address first.
     */
    const addresses = await Address.find({ user: session.user.id })
      .populate('country', 'name')
      .populate('county', 'name')
      .populate('city', 'name deliveryFee')
      .sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({
      message: 'Addresses fetched successfully.',
      data: addresses,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('Error fetching user addresses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for adding a new address to the authenticated user's profile.
 * This is a protected route that requires a valid user session.
 *
 * @param {Request} req - The incoming POST request object.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(req: Request) {
  /**
   * Fetches the current user's session.
   */
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();
    
    // Parses the JSON body from the incoming POST request.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure all required fields are present and have the correct data types.
    const body = await req.json();
    const { recipientName, phone, country, county, city, streetAddress, isDefault } = body;

    // A basic validation check for required fields.
    if (!recipientName || !phone || !country || !county || !city || !streetAddress) {
      return NextResponse.json({ message: 'All address fields are required.' }, { status: 400 });
    }

    /**
     * If the new address is being set as the default, this logic first ensures
     * that any other existing addresses for the user are marked as non-default.
     * This maintains the integrity of having only one default address per user.
     */
    if (isDefault) {
      await Address.updateMany({ user: session.user.id, isDefault: true }, { isDefault: false });
    }

    // Creates a new Address document instance, associating it with the authenticated user.
    const newAddress = new Address({
      user: session.user.id,
      ...body,
    });

    // Saves the new document to the database.
    await newAddress.save();

    // On successful creation, return a 201 Created status, a success message, and the new address data.
    return NextResponse.json({
      message: 'Address added successfully.',
      data: newAddress,
    }, { status: 201 });
  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('Error creating address:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}