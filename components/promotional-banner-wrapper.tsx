import { fetchRandomPromotionalVoucher } from "@/lib/data";
import { DiscountBanner } from "./discount";

/**
 * This is a Server Component that acts as a wrapper.
 * Its only job is to fetch server-side data and then pass it
 * as props to the actual client-side banner component.
 */
export async function PromotionalBannerWrapper() {
  const voucher = await fetchRandomPromotionalVoucher();

  // We pass the fetched data (or null) to the client component.
  // The client component will then handle all the logic about
  // whether to display itself or not.
  return <DiscountBanner voucher={voucher} />;
}
