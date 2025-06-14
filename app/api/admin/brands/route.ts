import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Brand from '@/models/Brand';

/**
 * A Next.js API route handler for creating a new brand.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming POST request object.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(req: Request) {
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
    
    // Parses the JSON body from the incoming POST request.
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body contains a non-empty `name` string before processing.
    const { name } = await req.json();

    // If the name is missing, return a client error response.
    if (!name) {
      return NextResponse.json({ message: 'Brand name is required' }, { status: 400 });
    }

    // Creates a new Brand document instance with the provided name.
    const newBrand = new Brand({ name });
    
    // Saves the new document to the database. Mongoose will handle validation based on the schema.
    await newBrand.save();
    
    // On successful creation, return a 201 Created status, a success message, and the new brand data.
    return NextResponse.json({ message: 'Brand created successfully', data: newBrand }, { status: 201 });

  } catch (error: any) {
    // TODO: Implement a more robust logging service (e.g., Sentry, Pino) for production environments.
    console.error("Error creating brand:", error);
    
    // Handles potential errors, such as a duplicate key error if the brand name already exists,
    // or other database/validation issues.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A brand with this name already exists' }, { status: 409 }); // 409 Conflict
    }

    return NextResponse.json({ message: 'Error creating brand', error: error.message }, { status: 500 });
  }
}