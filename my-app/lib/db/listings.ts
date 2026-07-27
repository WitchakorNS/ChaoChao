import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/mock/types";
import { mapListing, type ItemRow } from "./mappers";
import { itemNum, userNum } from "./ids";
import { fallbackListings } from "./fallback";

const ITEM_SELECT = `
  item_id, owner_id, item_name, item_description, price, deposit, category, created_at,
  current_state:workflow_state(state_name),
  item_image(image_url),
  item_location(location_name),
  availability(availability_date),
  owner:user_account(user_id, name, current_state:workflow_state(state_name))
`;

export interface RatingAgg {
  avg: number;
  count: number;
}

// item_id -> { avg, count } from the item_rating view.
export async function getRatingsMap(): Promise<Map<number, RatingAgg>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("item_rating")
    .select("item_id, avg_rating, review_count");
  const map = new Map<number, RatingAgg>();
  for (const r of data ?? []) {
    map.set(Number(r.item_id), {
      avg: Number(r.avg_rating),
      count: Number(r.review_count),
    });
  }
  return map;
}

// Public catalog: hides Draft/Removed/Unavailable items.
export async function getListings(): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const [{ data, error }, ratings] = await Promise.all([
      supabase.from("item").select(ITEM_SELECT).order("item_id"),
      getRatingsMap(),
    ]);
    if (error) throw error;
    return (data as unknown as ItemRow[])
      .map((row) => mapListing(row, ratings.get(row.item_id)))
      .filter((l) => l.status === "available" || l.status === "booked")
      .sort((a, b) => b.rating - a.rating);
  } catch {
    return fallbackListings()
      .filter((l) => l.status === "available" || l.status === "booked")
      .sort((a, b) => b.rating - a.rating);
  }
}

// Owner view: keeps every status (available / booked / closed).
export async function getListingsByOwner(ownerId: string): Promise<Listing[]> {
  try {
    const supabase = await createClient();
    const [{ data, error }, ratings] = await Promise.all([
      supabase
        .from("item")
        .select(ITEM_SELECT)
        .eq("owner_id", userNum(ownerId))
        // Postgres gives no ordering guarantee, and an UPDATE can move a row —
        // without this the owner's list reshuffles after every edit/toggle.
        .order("item_id"),
      getRatingsMap(),
    ]);
    if (error) throw error;
    return (data as unknown as ItemRow[]).map((row) =>
      mapListing(row, ratings.get(row.item_id)),
    );
  } catch {
    return fallbackListings().filter((l) => l.ownerId === ownerId);
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const supabase = await createClient();
    const [{ data, error }, ratings] = await Promise.all([
      supabase.from("item").select(ITEM_SELECT).eq("item_id", itemNum(id)).maybeSingle(),
      getRatingsMap(),
    ]);
    if (error) throw error;
    if (!data) return null;
    const row = data as unknown as ItemRow;
    return mapListing(row, ratings.get(row.item_id));
  } catch {
    return fallbackListings().find((l) => l.id === id) ?? null;
  }
}
