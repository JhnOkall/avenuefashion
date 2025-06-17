// app\api\admin\products\[id]\route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

/**
 * A Next.js API route handler for updating a specific product by its ID.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming PATCH request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.id - The unique identifier of the product to be updated.
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
      return NextResponse.json({ message: 'Invalid Product ID' }, { status: 400 });
    }

    /**
     * Parses the JSON body from the incoming PATCH request.
     * This can now include updates to the `variationSchema` and `variants` arrays.
     * For example, an admin could add a new color option or change a variant's price.
     */
    const body = await req.json();
    
    /**
     * Finds a product document by its ID and applies the updates from the request body.
     * The `{ new: true, runValidators: true }` options ensure that the updated document is returned and schema validations are run.
     */
    const updatedProduct = await Product.findByIdAndUpdate(resolvedParams.id, body, { new: true, runValidators: true });

    // If no document is found with the provided ID, return a 404 Not Found response.
    if (!updatedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    
    // On successful update, return a success message and the updated product data.
    return NextResponse.json({ message: 'Product updated successfully', data: updatedProduct }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error updating product ${resolvedParams.id}:`, error);
    
    // Specifically handles the MongoDB duplicate key error (code 11000), which can occur if the `slug` is changed to one that already exists.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A product with this name or slug already exists.' }, { status: 409 });
    }
    
    return NextResponse.json({ message: 'Error updating product', error: error.message }, { status: 500 });
  }
}