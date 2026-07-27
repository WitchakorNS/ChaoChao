import { createClient } from "@/lib/supabase/server";
import type { Booking, Dispute } from "@/lib/mock/types";
import { getAllBookings } from "./bookings";

export interface AdminSummary {
  users: number;
  rentals: number;
  disputes: number;
  pendingEvidence: number;
}

async function count(table: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const [users, rentals, evidence, bookings] = await Promise.all([
    count("user_account"),
    count("rental_order"),
    count("rental_evidence"),
    getAllBookings(),
  ]);
  return {
    users,
    rentals,
    disputes: bookings.filter((b) => b.status === "disputed").length,
    pendingEvidence: evidence,
  };
}

// Disputes are derived from rental orders in the "Disputed" state (the schema
// has no dedicated dispute table).
export async function getDisputes(): Promise<Dispute[]> {
  const bookings = await getAllBookings();
  return bookings
    .filter((b) => b.status === "disputed")
    .map((b) => ({
      id: `d${b.id.replace("BK-", "")}`,
      bookingId: b.id,
      reason: "ข้อพิพาทรายการเช่า",
      detail: `รายการเช่า “${b.listingTitle ?? b.listingId}” ถูกเปิดข้อพิพาท อยู่ระหว่างการตรวจสอบหลักฐานและการตัดสิน`,
      openedById: b.lenderId,
      status: "reviewing" as const,
      date: b.createdAt,
    }));
}

export async function getAdminRentals(): Promise<Booking[]> {
  return getAllBookings();
}
