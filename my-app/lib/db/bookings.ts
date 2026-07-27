import { createClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/mock/types";
import { mapBooking, type OrderRow } from "./mappers";
import { fallbackBookings } from "./fallback";

const ORDER_SELECT = `
  rental_order_id, renter_id, pickup_time, return_time, total_price, total_deposit, created_at,
  current_state:workflow_state(state_name),
  payment(status, total_amount),
  renter:user_account(user_id, name),
  rental_order_item(
    item_id, price_at_order, deposit_at_order,
    item(item_id, owner_id, item_name, category,
      item_image(image_url),
      owner:user_account(user_id, name))
  )
`;

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rental_order")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as OrderRow[]).map(mapBooking);
  } catch {
    return fallbackBookings();
  }
}

export interface BookingFilter {
  renterId?: string;
  lenderId?: string;
}

export async function getBookings(filter: BookingFilter = {}): Promise<Booking[]> {
  const all = await getAllBookings();
  return all.filter((b) => {
    if (filter.renterId && b.renterId !== filter.renterId) return false;
    if (filter.lenderId && b.lenderId !== filter.lenderId) return false;
    return true;
  });
}

// Every booking the user is party to (as renter or lender) — used to hydrate
// the client store.
export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  const all = await getAllBookings();
  return all.filter((b) => b.renterId === userId || b.lenderId === userId);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const all = await getAllBookings();
  return all.find((b) => b.id === id) ?? null;
}
