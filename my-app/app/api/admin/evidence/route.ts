import { NextResponse } from "next/server";
import { getAllEvidence } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ evidence: await getAllEvidence() });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}
