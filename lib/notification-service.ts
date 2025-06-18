import webpush from 'web-push';
import PushSubscription from '@/models/PushSubscription';
import connectDB from './db';
import User from '@/models/User';

// Configure web-push with your VAPID keys.
// This should only be done once, so we do it here.
webpush.setVapidDetails(
  'mailto:support@avenuefashion.co.ke', // Your contact email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Sends a push notification to a specific user.
 * It retrieves all active subscriptions for the user and sends the message to each one.
 * It also handles cleaning up expired/invalid subscriptions.
 *
 * @param userId - The ID of the user to send the notification to.
 * @param payload - The content of the notification (title, body, url).
 */
export async function sendNotificationToUser(userId: string, payload: NotificationPayload) {
  await connectDB();

  try {
    const subscriptions = await PushSubscription.find({ user: userId });

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${userId}.`);
      return;
    }

    const notificationPromises = subscriptions.map(sub => {
      const subscriptionObject = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

    interface WebPushError {
      statusCode: number;
      body: string;
    }

    interface SubscriptionDocument {
      _id: string;
      endpoint: string;
    }

    return webpush.sendNotification(subscriptionObject, JSON.stringify(payload))
      .catch(async (error: WebPushError) => {
        // If the subscription is expired or invalid (410 Gone), remove it from the DB.
        if (error.statusCode === 410) {
        console.log(`Subscription for user ${userId} has expired. Deleting.`);
        await PushSubscription.findByIdAndDelete(sub._id as string);
        } else {
        console.error(`Error sending notification to ${sub.endpoint}:`, error.body);
        }
      });
    });

    await Promise.all(notificationPromises);
    console.log(`Successfully sent notifications to user ${userId}.`);
  } catch (error) {
    console.error(`Failed to send notifications for user ${userId}:`, error);
  }
}

/**
 * Sends a push notification to all admin users.
 * It retrieves all users with the 'admin' role and then triggers
 * `sendNotificationToUser` for each of them.
 *
 * @param payload - The content of the notification (title, body, url).
 */
export async function sendNotificationToAdmins(payload: NotificationPayload) {
  await connectDB();
  try {
    // Find all users with the 'admin' role
    const admins = await User.find({ role: 'admin' }).select('_id');

    if (admins.length === 0) {
      console.log('No admin users found to notify.');
      return;
    }

    console.log(`Found ${admins.length} admin(s) to notify.`);

    // Create an array of promises for sending notifications to all admins
    const adminNotificationPromises = admins.map(admin =>
      // Reuse the existing function to send a notification to each admin
      sendNotificationToUser(admin._id.toString(), payload)
    );

    // Wait for all admin notifications to be processed
    await Promise.all(adminNotificationPromises);

    console.log('Successfully sent notifications to all admins.');

  } catch (error) {
    console.error('Failed to send notifications to admins:', error);
    // We throw the error here so the calling function can decide how to handle it
    throw error;
  }
}

/**
 * Sends a push notification to ALL users with an active subscription.
 * This is used for broadcasting general announcements or promotions.
 *
 * @param payload - The content of the notification (title, body, url).
 * @param [batchSize=100] - The number of notifications to send in parallel.
 */
export async function sendNotificationToAllSubscribers(payload: NotificationPayload, batchSize = 100) {
  await connectDB();
  try {
    const subscriptions = await PushSubscription.find({}).lean();

    if (subscriptions.length === 0) {
      console.log('Broadcast: No active push subscriptions found.');
      return;
    }

    console.log(`Broadcast: Preparing to send notifications to ${subscriptions.length} subscribers.`);

    // Process in batches to avoid overwhelming the server or push service
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      
      const notificationPromises = batch.map(sub => {
        const subscriptionObject = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        };

        return webpush.sendNotification(subscriptionObject, JSON.stringify(payload))
          .catch(async (error) => {
            if (error.statusCode === 410) { // 410 Gone = Expired subscription
              console.log(`Broadcast: Subscription ${sub.endpoint} has expired. Deleting.`);
              await PushSubscription.findByIdAndDelete(sub._id);
            } else {
              console.error(`Broadcast Error: Failed to send to ${sub.endpoint}:`, error.body);
            }
          });
      });

      // eslint-disable-next-line no-await-in-loop
      await Promise.all(notificationPromises);
      console.log(`Broadcast: Processed batch ${i / batchSize + 1}.`);
    }

    console.log('Broadcast: All notifications sent successfully.');
  } catch (error) {
    console.error('Broadcast: A critical error occurred while sending notifications to all subscribers:', error);
  }
}