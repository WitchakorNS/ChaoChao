import { NextResponse } from "next/server";
import { getAllEvidence, getEvidenceForBooking } from "@/lib/db";
import { createEvidence } from "@/lib/db/mutations";
import type { EvidenceType } from "@/lib/mock/types";

const TYPES: EvidenceType[] = [
  "before_pickup",
  "after_pickup",
  "before_return",
  "after_return",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  try {
    const evidence = bookingId
      ? await getEvidenceForBooking(bookingId)
      : await getAllEvidence();
    return NextResponse.json({ evidence });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.bookingId || !TYPES.includes(body.type)) {
      return NextResponse.json(
        { error: "bookingId and a valid evidence type are required" },
        { status: 400 },
      );
    }
    const count = await createEvidence({
      bookingId: body.bookingId,
      type: body.type,
      imageSeeds: body.imageSeeds ?? [],
    });
    return NextResponse.json({ count }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to save evidence" },
      { status: 500 },
    );
  }
}
