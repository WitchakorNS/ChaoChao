import { getListingsByOwner } from "@/lib/db";
import { CURRENT_USER_ID } from "@/lib/mock/data";
import { LenderListingsClient } from "@/components/chao/lender-listings-client";

export default async function LenderListingsPage() {
  const listings = await getListingsByOwner(CURRENT_USER_ID);
  return <LenderListingsClient initial={listings} />;
}
