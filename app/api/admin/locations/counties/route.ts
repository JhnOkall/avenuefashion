import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import County from '@/models/County';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for fetching all counties.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the list of counties or an error message.
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
     * Fetches all county documents. It uses `populate` to include the parent country's name,
     * which is useful for display in the admin UI. The results are sorted alphabetically.
     */
    const counties = await County.find({}).populate('country', 'name').sort({ name: 'asc' });
    
    return NextResponse.json({ data: counties });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching counties:", error);
    return NextResponse.json({ message: 'Error fetching counties', error: error.message }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for creating a new county.
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
    const { name, country } = await req.json();

    // Validates the presence of required fields.
    if (!name || !country) {
      return NextResponse.json({ message: 'County name and parent country ID are required.' }, { status: 400 });
    }

    // Validates that the provided parent country ID is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(country)) {
      return NextResponse.json({ message: 'Invalid parent Country ID' }, { status: 400 });
    }

    // Creates a new County document instance with the provided data.
    const newCounty = new County({ name, country });
    
    // Saves the new document to the database. Mongoose will handle schema validations, including the compound index for uniqueness.
    await newCounty.save();

    // On successful creation, return a 201 Created status, a success message, and the new county data.
    return NextResponse.json({
      message: 'County created successfully',
      data: newCounty,
    }, { status: 201 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error creating county:", error);
    
    // Handles potential errors, such as a duplicate key error if the county name already exists in the same country.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A county with this name already exists in the selected country.' }, { status: 409 });
    }
    
    return NextResponse.json({ message: 'Error creating county', error: error.message }, { status: 500 });
  }
}