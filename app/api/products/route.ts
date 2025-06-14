import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Brand from '@/models/Brand';

/**
 * A Next.js API route handler for fetching a list of products.
 * This is a public endpoint that supports complex filtering, sorting, and pagination,
 * making it the primary data source for the main product listing/shop page.
 *
 * @param {Request} req - The incoming GET request object, which may contain URL search parameters.
 * @returns {Promise<NextResponse>} A JSON response containing a paginated list of products and metadata.
 */
export async function GET(req: Request) {
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    // Parses URL search parameters for dynamic querying.
    const { searchParams } = new URL(req.url);

    // --- Pagination ---
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // --- Filtering ---
    const brandName = searchParams.get('brand');
    const condition = searchParams.get('condition');
    const searchQuery = searchParams.get('searchQuery');

    // --- Sorting ---
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    /**
     * Builds the filter object for the Mongoose query based on the provided search parameters.
     */
    // TODO: For more complex filtering (e.g., price range), extend this filter object accordingly.
    const filter: any = { isActive: true }; // Always filter for active products on the public API.

    if (condition) {
      filter.condition = condition;
    }

    if (brandName) {
      // To filter by brand name, we first need to find the brand's ObjectId.
      // A case-insensitive regex is used for a more flexible match.
      const brand = await Brand.findOne({ name: { $regex: new RegExp(`^${brandName}$`, 'i') } });
      if (brand) {
        filter.brand = brand._id;
      } else {
        // If the specified brand doesn't exist, no products can match, so we can return early.
        return NextResponse.json({
          message: 'No products found for the specified brand.',
          data: [],
          totalPages: 0,
          currentPage: 1,
          totalProducts: 0,
        }, { status: 200 });
      }
    }

    if (searchQuery) {
        // Creates a case-insensitive search across multiple text fields.
        filter.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } },
            { features: { $regex: searchQuery, $options: 'i' } }
        ];
    }

    /**
     * Builds the sort object for the Mongoose query.
     */
    const sort: { [key: string]: 'asc' | 'desc' } = {};
    // A whitelist of sortable fields could be added here for security.
    if (['price', 'createdAt', 'rating'].includes(sortBy)) {
      sort[sortBy] = order === 'asc' ? 'asc' : 'desc';
    } else {
      sort['createdAt'] = 'desc'; // Default sort
    }
    
    // Calculates the number of documents to skip for pagination.
    const skip = (page - 1) * limit;

    // Fetches the total count of products matching the filter to calculate total pages.
    const totalProducts = await Product.countDocuments(filter);

    /**
     * Fetches the final list of products from the database, applying all filters,
     * sorting, and pagination.
     */
    const products = await Product.find(filter)
      .populate('brand', 'name') // Populates the brand name for display.
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Returns a successful response with the product data and pagination metadata.
    return NextResponse.json({
      message: 'Products fetched successfully.',
      data: products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}