import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

/**
 * A Next.js API route handler for fetching a paginated and searchable list of all products for the admin panel.
 * This is a protected route, accessible only by users with the 'admin' role.
 *
 * @param {Request} req - The incoming GET request object, which may contain URL search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing the list of products and pagination metadata, or an error message.
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
    
    // Parses URL search parameters for pagination and searching.
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchQuery = searchParams.get('searchQuery');
    
    // Builds the filter query for the database lookup.
    const filter: any = {};
    if (searchQuery) {
        // Creates a case-insensitive search across both the 'name' and 'description' fields.
        filter.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            // TODO: Searching within an array like 'description' can be inefficient. Consider creating a separate, indexed text field that concatenates all searchable text.
            { description: { $regex: searchQuery, $options: 'i' } }
        ];
    }

    // Calculates the number of documents to skip for pagination.
    const skip = (page - 1) * limit;
    
    // Fetches the total count of documents that match the filter for calculating total pages.
    const totalProducts = await Product.countDocuments(filter);
    
    /**
     * Fetches the paginated and filtered list of products.
     * It populates the `brand` field to include the brand's name.
     * The results are sorted by creation date in descending order (newest first).
     * The fetched products will include the new `variants` and `variationSchema` fields.
     */
    const products = await Product.find(filter)
      .populate('brand', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Returns the fetched data along with pagination metadata.
    return NextResponse.json({
      data: products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
    }, { status: 200 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ message: 'Error fetching products', error: error.message }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for creating a new product.
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
    
    /**
     * Parses the JSON body from the incoming POST request.
     * This body can now contain `variationSchema` and `variants` arrays for creating
     * a product with variations. Mongoose will validate these nested structures.
     */
    const body = await req.json();
    
    // Creates a new Product document instance with the provided data.
    const newProduct = new Product(body);
    
    // Saves the new document to the database. Mongoose will handle schema validations and the pre-save hook for slug generation.
    await newProduct.save();

    // On successful creation, return a 201 Created status, a success message, and the new product data.
    return NextResponse.json({ message: 'Product created successfully', data: newProduct }, { status: 201 });
  } catch (error: any) {
    // TODO: Implement a more robust logging service for production.
    console.error("Error creating product:", error);
    
    // Specifically handles the MongoDB duplicate key error (code 11000), which will be triggered by the unique 'slug' index.
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A product with this name already exists.' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Error creating product', error: error.message }, { status: 500 });
  }
}