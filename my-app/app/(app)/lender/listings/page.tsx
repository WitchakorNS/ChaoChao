import { getListingsByOwner } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { LenderListingsClient } from "@/components/chao/lender-listings-client";

export default async function LenderListingsPage() {
  const listings = await getListingsByOwner(await getCurrentUserId());
  return <LenderListingsClient initial={listings} />;
}
