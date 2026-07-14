import { Suspense } from "react";
import { ExploreClient } from "@/components/chao/explore-client";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <ExploreClient />
    </Suspense>
  );
}
