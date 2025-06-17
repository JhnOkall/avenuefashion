import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { ICartItem } from '@/types';

async function getOrCreateCart(userId: string | null, sessionToken: string | null): Promise<{ cart: any; newSessionToken?: string }> {
  let userCart = null;
  let sessionCart = null;
  let newSessionToken: string | undefined = undefined;

  if (userId) {
    userCart = await Cart.findOne({ user: userId });
  }
  if (sessionToken) {
    sessionCart = await Cart.findOne({ sessionToken });
  }

  if (userCart && sessionCart) {
    // Merge session cart into user cart
    for (const sessionItem of sessionCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        (userItem: ICartItem) => 
          userItem.product.toString() === sessionItem.product.toString() &&
          userItem.variantId?.toString() === sessionItem.variantId?.toString()
      );
      if (existingItemIndex > -1) {
        userCart.items[existingItemIndex].quantity += sessionItem.quantity;
      } else {
        userCart.items.push(sessionItem);
      }
    }
    await userCart.save();
    await Cart.findByIdAndDelete(sessionCart._id);
    return { cart: userCart };
  }

  if (userCart) return { cart: userCart };
  if (sessionCart) return { cart: sessionCart };
  
  if (userId) {
    const newCart = new Cart({ user: userId, items: [] });
    await newCart.save();
    return { cart: newCart };
  }
  
  newSessionToken = crypto.randomUUID();
  const newCart = new Cart({ sessionToken: newSessionToken, items: [] });
  await newCart.save();
  return { cart: newCart, newSessionToken };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');

    const { cart } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    const populatedCart = await cart.populate({
      path: 'items.product',
      select: 'name slug',
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');
    const { productId, quantity, variantId } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ message: 'Product ID and a valid quantity are required.' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ message: 'Product not found or is unavailable.' }, { status: 404 });
    }

    const { cart, newSessionToken } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    let itemToAdd: ICartItem;
    
    // Find a unique identifier for the cart item
    const findItem = (item: ICartItem) => 
      item.product.toString() === productId && 
      item.variantId?.toString() === variantId;
      
    const existingItemIndex = cart.items.findIndex(findItem);

    if (variantId) {
      // Logic for product with variants
      const variant = product.variants?.find((v: any) => v._id.toString() === variantId);
      if (!variant) {
        return NextResponse.json({ message: 'Selected variant not found.' }, { status: 404 });
      }
      if (variant.stock < quantity + (cart.items[existingItemIndex]?.quantity || 0)) {
        return NextResponse.json({ message: 'Insufficient stock for this variant.' }, { status: 400 });
      }
      itemToAdd = {
        product: productId,
        quantity,
        variantId,
        price: variant.price,
        name: product.name,
        imageUrl: variant.images?.[0] || product.images[0],
        variantOptions: variant.options,
      };
    } else {
      // Logic for simple product without variants
      if (product.variants && product.variants.length > 0) {
        return NextResponse.json({ message: 'This product requires a variant selection.' }, { status: 400 });
      }
      if (!product.stock || product.stock < quantity + (cart.items[existingItemIndex]?.quantity || 0)) {
        return NextResponse.json({ message: 'Insufficient stock for this product.' }, { status: 400 });
      }
      itemToAdd = {
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        imageUrl: product.images[0],
      };
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push(itemToAdd);
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name slug');
    
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

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');
    const { productId, quantity, variantId } = await req.json();
    
    if (!productId || typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json({ message: 'Product ID and a valid quantity (0 or more) are required.' }, { status: 400 });
    }

    const { cart } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    const findItem = (item: ICartItem) => 
      item.product.toString() === productId && 
      item.variantId?.toString() === variantId;

    const itemIndex = cart.items.findIndex(findItem);
    if (itemIndex === -1) {
        return NextResponse.json({ message: 'Item not found in cart.' }, { status: 404 });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name slug');

    return NextResponse.json({
      message: 'Cart updated successfully.',
      data: populatedCart,
    }, { status: 200 });
  } catch (error) {
    console.error('PATCH /api/cart Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await auth();
    const sessionToken = (await headers()).get('X-Session-Token');
    const { productId, variantId } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required.' }, { status: 400 });
    }

    const { cart } = await getOrCreateCart(session?.user?.id || null, sessionToken);

    const initialLength = cart.items.length;
    
    cart.items = cart.items.filter((item: ICartItem) => 
      !(item.product.toString() === productId && item.variantId?.toString() === variantId)
    );
    
    if (cart.items.length === initialLength) {
        return NextResponse.json({ message: 'Item not found in cart.' }, { status: 404 });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product', 'name slug');

    return NextResponse.json({
      message: 'Item removed from cart.',
      data: populatedCart,
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/cart Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}