import { Suspense } from "react";
import { ExploreClient } from "@/components/chao/explore-client";
import { getListings } from "@/lib/db";

export default async function ExplorePage() {
  const listings = await getListings();
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <ExploreClient listings={listings} />
    </Suspense>
  );
}
