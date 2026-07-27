import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/mock/types";
import { mapReview, type ReviewRow } from "./mappers";
import { itemNum } from "./ids";

const REVIEW_SELECT = `
  review_id, user_id, rating, comment, created_at, rental_order_id,
  review_image(image_url)
`;

export async function getReviewsForListing(
  listingId: string,
): Promise<Review[]> {
  const supabase = await createClient();
  const iid = itemNum(listingId);

  // Orders that include this item -> reviews attached to those orders.
  const { data: orderItems } = await supabase
    .from("rental_order_item")
    .select("rental_order_id")
    .eq("item_id", iid);
  const orderIds = (orderItems ?? []).map((o) => o.rental_order_id);
  if (!orderIds.length) return [];

  const { data, error } = await supabase
    .from("review")
    .select(REVIEW_SELECT)
    .in("rental_order_id", orderIds)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data as unknown as ReviewRow[]).map((row) =>
    mapReview(row, listingId),
  );
}
