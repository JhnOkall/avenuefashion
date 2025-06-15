import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// =================================================================
// GET - Fetch all Favourites
// =================================================================

/**
 * A Next.js API route handler for fetching all favorite products for the currently authenticated user.
 * This is a protected route that requires a valid user session.
 *
 * @param {Request} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the user's favorite products or an error message.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id)
      .select('favorites')
      .populate({
        path: 'favorites',
        populate: {
          path: 'brand',
          select: 'name'
        }
      });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Favorites fetched successfully.',
      data: user.favorites,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


// =================================================================
// POST - Add a product to Favourites
// =================================================================

/**
 * A Next.js API route handler for adding a product to the user's favorites.
 * This is a protected route.
 *
 * @param {Request} req - The incoming POST request object. Expected body: { "productId": "..." }
 * @returns {Promise<NextResponse>} A JSON response indicating the result of the operation.
 */
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();
        const { productId } = await req.json();

        // --- Validation ---
        if (!productId) {
            return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ message: 'Invalid Product ID format' }, { status: 400 });
        }

        // Check if the product actually exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // --- Update User's Favorites ---
        // Use $addToSet to add the productId to the favorites array.
        // $addToSet automatically prevents duplicates, so we don't add the same product twice.
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $addToSet: { favorites: productId } },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Product added to favorites' }, { status: 200 });

    } catch (error) {
        console.error('Error adding to favorites:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// =================================================================
// DELETE - Remove a product from Favourites
// =================================================================

/**
 * A Next.js API route handler for removing a product from the user's favorites.
 * This is a protected route.
 *
 * @param {Request} req - The incoming DELETE request object. Expected body: { "productId": "..." }
 * @returns {Promise<NextResponse>} A JSON response indicating the result of the operation.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
      await connectDB();
      const { productId } = await req.json();

      if (!productId) {
          return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
          return NextResponse.json({ message: 'Invalid Product ID format' }, { status: 400 });
      }

      // Use $pull to remove the productId from the favorites array.
      const updatedUser = await User.findByIdAndUpdate(
          session.user.id,
          { $pull: { favorites: productId } },
          { new: true }
      );

      if (!updatedUser) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Product removed from favorites' }, { status: 200 });

  } catch (error) {
      console.error('Error removing from favorites:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}