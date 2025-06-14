import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { ICartItem } from '@/types';

/**
 * A helper function to retrieve an existing cart or create a new one.
 * This function encapsulates the core logic for managing both authenticated user carts
 * and anonymous session-based carts, including the critical merge operation upon user login.
 *
 * @param {string | null} userId - The ID of the authenticated user, or null for a guest.
 * @param {string | null} sessionToken - The token for the anonymous guest session, or null.
 * @returns {Promise<{ cart: any; newSessionToken?: string }>} An object containing the user's cart and a potential new session token.
 */
// TODO: Refactor the `any` types for cart items to the specific `ICartItem` type for better type safety.
async function getOrCreateCart(userId: string | null, sessionToken: string | null): Promise<{ cart: any; newSessionToken?: string }> {
  let userCart = null;
  let sessionCart = null;
  let newSessionToken: string | undefined = undefined;

  // 1. Attempt to find carts for both the authenticated user and the session.
  if (userId) {
    userCart = await Cart.findOne({ user: userId });
  }
  if (sessionToken) {
    sessionCart = await Cart.findOne({ sessionToken });
  }

  // 2. Merge Logic: This is a crucial step when a user logs in. If they have an existing
  // session cart (from browsing as a guest) and a user cart (from a previous session),
  // the items from the session cart are merged into their permanent user cart.
  if (userCart && sessionCart) {
    for (const sessionItem of sessionCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        (userItem: ICartItem) => userItem.product.toString() === sessionItem.product.toString()
      );
      if (existingItemIndex > -1) {
        // If the item already exists in the user's cart, combine the quantities.
        userCart.items[existingItemIndex].quantity += sessionItem.quantity;
      } else {
        // If the item is new, add it to the user's cart.
        userCart.items.push(sessionItem);
      }
    }
    await userCart.save();
    // After a successful merge, the temporary session cart is deleted.
    await Cart.findByIdAndDelete(sessionCart._id);
    return { cart: userCart };
  }

  // 3. Return existing carts if no merge is needed.
  if (userCart) return { cart: userCart };
  if (sessionCart) return { cart: sessionCart };
  
  // 4. Create New Cart: If no cart exists for either the user or the session.
  if (userId) {
    // Create a new, empty cart for a newly registered or returning user with no active cart.
    const newCart = new Cart({ user: userId, items: [] });
    await newCart.save();
    return { cart: newCart };
  }
  
  // For a completely new guest user, generate a unique session token and create a new cart.
  // This token must be sent back to the client to be stored (e.g., in a cookie) for subsequent requests.
  newSessionToken = crypto.randomUUID();
  const newCart = new Cart({ sessionToken: newSessionToken, items: [] });
  await newCart.save();
  return { cart: newCart, newSessionToken };
}

/**
 * A Next.js API route handler for retrieving the current user's shopping cart.
 *
 * @param {NextRequest} req - The incoming GET request object.
 * @returns {Promise<NextResponse>} A JSON response containing the cart data.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    // The session token is passed from the client via a custom request header.
    const sessionToken = (await headers()).get('X-Session-Token');

    const { cart } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    // Populate the product details for each item in the cart before sending the response.
    const populatedCart = await cart.populate({
      path: 'items.product',
      select: 'name price imageUrl slug',
    });

    return NextResponse.json({
      message: 'Cart fetched successfully.',
      data: populatedCart,
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/cart Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for adding a product to the cart.
 *
 * @param {NextRequest} req - The incoming POST request object.
 * @returns {Promise<NextResponse>} A JSON response with the updated cart data.
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');
    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Product ID and a valid quantity are required.' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    const { cart, newSessionToken } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    const existingItemIndex = cart.items.findIndex((item: ICartItem) => item.product.toString() === productId);

    if (existingItemIndex > -1) {
      // If item exists, increment its quantity.
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If item is new, add it with snapshotted details.
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.imageUrl,
      });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name price imageUrl slug');
    
    // If a new session was created for a guest, send the token back to the client in a header.
    const responseHeaders = new Headers();
    if (newSessionToken) {
        responseHeaders.set('X-Session-Token', newSessionToken);
    }

    return NextResponse.json({
      message: 'Item added to cart.',
      data: populatedCart,
    }, { status: 200, headers: responseHeaders });
  } catch (error) {
    console.error('POST /api/cart Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for updating the quantity of an item in the cart.
 *
 * @param {NextRequest} req - The incoming PATCH request object.
 * @returns {Promise<NextResponse>} A JSON response with the updated cart data.
 */
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');
    const { productId, quantity } = await req.json();
    
    if (!productId || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ message: 'Product ID and a valid quantity (0 or more) are required.' }, { status: 400 });
    }

    const { cart } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    const itemIndex = cart.items.findIndex((item: ICartItem) => item.product.toString() === productId);
    if (itemIndex === -1) {
        return NextResponse.json({ message: 'Item not found in cart.' }, { status: 404 });
    }

    if (quantity === 0) {
      // A quantity of 0 removes the item from the cart.
      cart.items.splice(itemIndex, 1);
    } else {
      // Otherwise, update the quantity to the new value.
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name price imageUrl slug');

    return NextResponse.json({
      message: 'Cart updated successfully.',
      data: populatedCart,
    }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/cart Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * A Next.js API route handler for removing an item entirely from the cart.
 *
 * @param {NextRequest} req - The incoming DELETE request object.
 * @returns {Promise<NextResponse>} A JSON response with the updated cart data.
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    const { cart } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    const initialLength = cart.items.length;
    // Filter out the item to be removed.
    cart.items = cart.items.filter((item: ICartItem) => item.product.toString() !== productId);
    
    // If the cart length is unchanged, the item was not found.
    if (cart.items.length === initialLength) {
        return NextResponse.json({ message: 'Item not found in cart.' }, { status: 404 });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name price imageUrl slug');

    return NextResponse.json({
      message: 'Item removed from cart.',
      data: populatedCart,
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/cart Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}