import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Country from '@/models/Country';

/**
 * A Next.js API route handler for fetching all countries.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the list of countries or an error message.
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
     * Fetches all country documents from the database, sorted alphabetically by name.
     */
    // TODO: For applications with a very large number of countries, consider implementing pagination.
    const countries = await Country.find({}).sort({ name: 'asc' });
    
    return NextResponse.json({ data: countries });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching countries:", error);
    return NextResponse.json({ message: 'Error fetching countries', error: error.message }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for creating a new country.
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
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body contains a non-empty `name` string.
    const { name } = await req.json();

    // Validates the presence of the required 'name' field.
    if (!name) {
      return NextResponse.json({ message: 'Country name is required.' }, { status: 400 });
    }

    // Creates a new Country document instance with the provided name.
    const newCountry = new Country({ name });
    
    // Saves the new document to the database. Mongoose will handle schema validations.
    await newCountry.save();
    
    // On successful creation, return a 201 Created status, a success message, and the new country data.
    return NextResponse.json({
      message: 'Country created successfully',
      data: newCountry,
    }, { status: 201 });
  } catch (error: any)
  {
    // TODO: Implement a more robust logging service for production.
    console.error("Error creating country:", error);
    
    // Specifically handles the MongoDB duplicate key error (code 11000) if a country with the same name is created.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A country with this name already exists.' }, { status: 409 }); // 409 Conflict
    }
    
    return NextResponse.json({ message: 'Error creating country', error: error.message }, { status: 500 });
  }
}