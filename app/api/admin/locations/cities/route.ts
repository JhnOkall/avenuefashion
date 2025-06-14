import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import City from '@/models/City';

/**
 * A Next.js API route handler for fetching all cities.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the list of cities or an error message.
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
     * Fetches all city documents. It uses `populate` to include the parent county's
     * name and its parent country's name, which is useful for display in the admin UI.
     * The results are sorted alphabetically by city name.
     */
    const cities = await City.find({})
      .populate({ 
        path: 'county', 
        select: 'name country', 
        populate: { path: 'country', select: 'name' } 
      })
      .sort({ name: 'asc' });
      
    return NextResponse.json({ data: cities });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching cities:", error);
    return NextResponse.json({ message: 'Error fetching cities', error: error.message }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for creating a new city.
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
    // TODO: Implement server-side validation (e.g., using Zod) to ensure the request body contains all required fields (`name`, `deliveryFee`, `county`) with the correct data types.
    const { name, deliveryFee, county } = await req.json();

    // Creates a new City document instance with the provided data.
    const newCity = new City({ name, deliveryFee, county });
    
    // Saves the new document to the database. Mongoose will handle schema validations, including the compound index for uniqueness.
    await newCity.save();
    
    // On successful creation, return a 201 Created status, a success message, and the new city data.
    return NextResponse.json({ message: 'City created successfully', data: newCity }, { status: 201 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error creating city:", error);
    
    // Handles potential errors, such as a duplicate key error if the city name already exists in the same county.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A city with this name already exists in the selected county' }, { status: 409 }); // 409 Conflict
    }
    
    return NextResponse.json({ message: 'Error creating city', error: error.message }, { status: 500 });
  }
}