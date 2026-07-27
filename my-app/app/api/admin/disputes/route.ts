import { NextResponse } from "next/server";
import { getDisputes } from "@/lib/db";

export async function GET() {
  try {
    return NextResponse.json({ disputes: await getDisputes() });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}
