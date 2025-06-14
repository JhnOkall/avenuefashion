import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

/**
 * A Next.js API route handler for fetching a single product by its unique slug.
 * This is a public endpoint, typically used for the product details page.
 *
 * @param {Request} req - The incoming GET request object.
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The parameters from the dynamic route segment.
 * @param {string} context.params.slug - The unique, URL-friendly slug of the product to fetch.
 * @returns {Promise<NextResponse>} A JSON response containing the detailed product data or an error message.
 */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    // Establishes a connection to the MongoDB database.
    await connectDB();

    const { slug } = params;

    // Validates the presence of the required slug parameter.
    if (!slug) {
      return NextResponse.json({ message: 'Product slug is required.' }, { status: 400 });
    }

    /**
     * Finds a single product document where the `slug` field matches the provided parameter.
     * This query also populates related data for a comprehensive response:
     * - `brand`: Replaces the brand's ObjectId with its name.
     * - `reviews`: Replaces the review ObjectIds with their full documents.
     *   - The `user` within each review is also populated to include the reviewer's name and image.
     * The reviews are sorted in descending order by their creation date.
     */
    // TODO: The current implementation populates ALL reviews for a product, which can be inefficient if a product has thousands of reviews.
    // For performance, this should be refactored. The main product details should be fetched here, and the reviews should be fetched separately
    // in a paginated manner by a dedicated endpoint (e.g., `/api/products/[id]/reviews`).
    const product = await Product.findOne({ slug: slug, isActive: true }) // Only find active products.
      .populate('brand', 'name')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'name image'
        },
        options: { sort: { createdAt: -1 } }
      });

    // If no product is found with the provided slug, return a 404 Not Found response.
    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // Returns a successful response with the detailed product data.
    return NextResponse.json({
      message: 'Product fetched successfully.',
      data: product,
    }, { status: 200 });

  } catch (error) {
    // TODO: Implement a more robust logging service for production.
    console.error(`Error fetching product with slug ${params.slug}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}