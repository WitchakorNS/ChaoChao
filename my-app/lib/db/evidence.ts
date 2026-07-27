import { createClient } from "@/lib/supabase/server";
import type { Evidence } from "@/lib/mock/types";
import { mapEvidence, type EvidenceRow } from "./mappers";
import { orderNum } from "./ids";
import { mockEvidences } from "./fallback";

const EVIDENCE_SELECT =
  "evidence_id, rental_order_id, evidence_type, image_url, uploaded_at";

export async function getAllEvidence(): Promise<Evidence[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rental_evidence")
      .select(EVIDENCE_SELECT)
      .order("uploaded_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as EvidenceRow[]).map(mapEvidence);
  } catch {
    return mockEvidences;
  }
}

export async function getEvidenceForBooking(
  bookingId: string,
): Promise<Evidence[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rental_evidence")
      .select(EVIDENCE_SELECT)
      .eq("rental_order_id", orderNum(bookingId));
    if (error) throw error;
    return (data as unknown as EvidenceRow[]).map(mapEvidence);
  } catch {
    return mockEvidences.filter((e) => e.bookingId === bookingId);
  }
}
