import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Voucher from '@/models/Voucher';
import { IVoucher } from '@/types';

/**
 * Handles GET requests to validate a voucher by its code.
 *
 * This endpoint is designed to be called from the client-side (e.g., the checkout page)
 * to verify if a voucher code is valid, active, and unexpired before applying it to an order.
 *
 * @param request - The incoming Next.js request object (not used in this handler).
 * @param params - An object containing the dynamic route parameters.
 * @param params.code - The voucher code to validate, extracted from the URL.
 * @returns A NextResponse object with the validation result.
 *  - 200 OK: If the voucher is valid, returns the voucher data.
 *  - 404 Not Found: If no voucher with the given code exists.
 *  - 400 Bad Request: If the voucher is found but is inactive or expired.
 *  - 500 Internal Server Error: If a database or other server error occurs.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {

  // Await the params Promise to access the route parameters
  const resolvedParams = await params;

  try {
    // 1. Connect to the database
    await connectDB();

    const { code } = resolvedParams;

    // The Voucher schema automatically uppercases the code, so we match that for lookup.
    const voucherCode = code.toUpperCase();

    // 2. Find the voucher in the database
    const voucher = await Voucher.findOne({ code: voucherCode }).lean() as IVoucher | null;

    // 3. Handle case where voucher does not exist
    if (!voucher) {
      return NextResponse.json(
        { message: 'Voucher not found.' },
        { status: 404 }
      );
    }

    // 4. Validate the voucher's status
    if (!voucher.isActive) {
      return NextResponse.json(
        { message: 'This voucher is not currently active.' },
        { status: 400 }
      );
    }

    // 5. Validate the voucher's expiration date (if it has one)
    if (voucher.expiresAt && new Date() > new Date(voucher.expiresAt)) {
      return NextResponse.json(
        { message: 'This voucher has expired.' },
        { status: 400 }
      );
    }

    // TODO: Implement additional validation logic if needed, such as:
    // - Checking minimum spend (`if (cartSubtotal < voucher.minimumSpend)`)
    // - Checking usage limits (`if (voucher.timesUsed >= voucher.maxUses)`)

    // 6. If all checks pass, return the valid voucher data
    return NextResponse.json(
      {
        message: 'Voucher is valid.',
        data: voucher,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}