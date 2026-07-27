import { createClient } from "@/lib/supabase/server";
import type { Evidence } from "@/lib/mock/types";
import { mapEvidence, type EvidenceRow } from "./mappers";
import { orderNum } from "./ids";

const EVIDENCE_SELECT =
  "evidence_id, rental_order_id, evidence_type, image_url, uploaded_at";

export async function getAllEvidence(): Promise<Evidence[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_evidence")
    .select(EVIDENCE_SELECT)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as EvidenceRow[]).map(mapEvidence);
}

export async function getEvidenceForBooking(
  bookingId: string,
): Promise<Evidence[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rental_evidence")
    .select(EVIDENCE_SELECT)
    .eq("rental_order_id", orderNum(bookingId));
  if (error) throw error;
  return (data as unknown as EvidenceRow[]).map(mapEvidence);
}
