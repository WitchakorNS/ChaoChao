import { NextResponse } from "next/server";
import { getAdminRentals } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ rentals: await getAdminRentals() });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}
