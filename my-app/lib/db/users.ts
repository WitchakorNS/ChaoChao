import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/mock/types";
import { mapUser, type UserRow } from "./mappers";
import { userNum } from "./ids";

const USER_SELECT = `
  user_id, name, email, created_at,
  current_state:workflow_state(state_name),
  user_role!user_role_user_id_fkey(role(role_name))
`;

// Average rating a lender has received, computed from reviews on their items.
async function getLenderRating(
  userId: number,
): Promise<{ avg: number; count: number } | undefined> {
  const supabase = await createClient();
  // items owned by user -> orders including those items -> reviews on them
  const { data: items } = await supabase
    .from("item")
    .select("item_id")
    .eq("owner_id", userId);
  const itemIds = (items ?? []).map((i) => i.item_id);
  if (!itemIds.length) return undefined;

  const { data: rows } = await supabase
    .from("item_rating")
    .select("avg_rating, review_count")
    .in("item_id", itemIds);
  if (!rows || !rows.length) return undefined;

  let total = 0;
  let count = 0;
  for (const r of rows) {
    total += Number(r.avg_rating) * Number(r.review_count);
    count += Number(r.review_count);
  }
  return count ? { avg: Math.round((total / count) * 10) / 10, count } : undefined;
}

// A lender's location is not on user_account; borrow it from one of their items.
async function getUserLocation(userId: number): Promise<string | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("item")
    .select("item_location(location_name)")
    .eq("owner_id", userId)
    .limit(1);
  const loc = data?.[0]?.item_location as
    | { location_name: string }[]
    | undefined;
  return loc?.[0]?.location_name;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient();
  const uid = userNum(id);
  const { data, error } = await supabase
    .from("user_account")
    .select(USER_SELECT)
    .eq("user_id", uid)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [agg, location] = await Promise.all([
    getLenderRating(uid),
    getUserLocation(uid),
  ]);
  return mapUser(data as unknown as UserRow, agg, location);
}

export async function getAllUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select(USER_SELECT)
    .order("user_id");
  if (error) throw error;
  return (data as unknown as UserRow[]).map((row) => mapUser(row));
}
