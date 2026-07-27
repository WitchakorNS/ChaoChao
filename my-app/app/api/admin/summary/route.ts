import { NextResponse } from "next/server";
import { getAdminSummary } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ summary: await getAdminSummary() });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}
