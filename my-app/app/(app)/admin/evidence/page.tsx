import {
  getAllEvidence,
  getDisputes,
  getBookingById,
} from "@/lib/db";
import { AdminEvidenceClient } from "@/components/chao/admin-evidence-client";

export default async function AdminEvidencePage() {
  const [evidence, disputes] = await Promise.all([
    getAllEvidence(),
    getDisputes(),
  ]);
  // Show the timeline for the first open dispute case (if any).
  const caseBooking = disputes[0]
    ? await getBookingById(disputes[0].bookingId)
    : null;

  return (
    <AdminEvidenceClient
      caseId={caseBooking?.id ?? "—"}
      listingTitle={caseBooking?.listingTitle}
      evidence={evidence}
      timeline={caseBooking?.timeline ?? []}
    />
  );
}
