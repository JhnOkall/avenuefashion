import { NextResponse } from 'next/server';
import { fetchRandomPromotionalVoucher } from '@/lib/data';
import { sendNotificationToAllSubscribers } from '@/lib/notification-service';
// --- 1. IMPORT FROM THE NEW SHARED FILE ---
import { marketingMessages, getRandomItem } from '@/config/marketing';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const voucher = await fetchRandomPromotionalVoucher();

    if (!voucher) {
      console.log('Cron Job: No active promotional vouchers found. Skipping notification broadcast.');
      return NextResponse.json({ success: true, message: 'No voucher to promote.' });
    }

    // --- 2. PICK A RANDOM MESSAGE FOR THE NOTIFICATION TITLE ---
    const randomTitle = getRandomItem(marketingMessages);

    // 3. Construct the notification payload using the random title
    const payload = {
      title: randomTitle, // Use the randomly selected message as the title
      body: `Use code ${voucher.code} for an exclusive ${voucher.discountValue}% discount. Tap to shop now!`,
      url: '/', // Direct users to the homepage
    };

    // 4. Broadcast the notification
    await sendNotificationToAllSubscribers(payload);

    console.log(`Cron Job: Successfully broadcasted promotion for voucher ${voucher.code} with title: "${randomTitle}"`);
    return NextResponse.json({ success: true, message: 'Promotional notifications sent.' });

  } catch (error) {
    console.error('Cron Job Error: Failed to send promotional notifications:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}