import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Voucher from '@/models/Voucher';

/**
 * A Next.js API route handler for fetching all vouchers.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the list of vouchers or an error message.
 */
export async function GET(req: Request) {
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
    
    /**
     * Fetches all voucher documents from the database, sorted by creation date in descending order.
     */
    // TODO: For scalability, this should be refactored to support server-side pagination (e.g., fetchAdminVouchers({ page: 1, limit: 10 })) instead of fetching all vouchers at once.
    const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ data: vouchers }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching vouchers:", error);
    return NextResponse.json({ message: 'Error fetching vouchers', error: error.message }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for creating a new voucher.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming POST request object.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(req: Request) {
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
    
    // Parses the JSON body from the incoming POST request.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body contains all required fields with the correct data types.
    const body = await req.json();
    
    // Creates a new Voucher document instance with the provided data.
    const newVoucher = new Voucher(body);
    
    // Saves the new document to the database. Mongoose will handle schema validations.
    await newVoucher.save();
    
    // On successful creation, return a 201 Created status, a success message, and the new voucher data.
    return NextResponse.json({ message: 'Voucher created successfully', data: newVoucher }, { status: 201 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error creating voucher:", error);
    
    // Specifically handles the MongoDB duplicate key error (code 11000), which will be triggered by the unique 'code' index.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A voucher with this code already exists.' }, { status: 409 });
    }
    
    return NextResponse.json({ message: 'Error creating voucher', error: error.message }, { status: 500 });
  }
}