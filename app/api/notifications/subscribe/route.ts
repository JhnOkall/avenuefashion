import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PushSubscription from '@/models/PushSubscription';
import { auth } from '@/auth';

/**
 * API route to handle storing a new push notification subscription
 * and associating it with the currently authenticated user.
 */
export async function POST(request: Request) {
  await connectDB();
  
  // 1. Authenticate the user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  try {
    const subscriptionData = await request.json();

    // 2. Use findOneAndUpdate with upsert to avoid duplicate subscriptions for the same endpoint
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscriptionData.endpoint }, // Find a subscription with this endpoint
      { // Data to insert or update
        user: session.user.id,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        },
      },
      { upsert: true } // Create a new document if one doesn't exist
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: "An unknown error occurred." }, { status: 500 });
  }
}