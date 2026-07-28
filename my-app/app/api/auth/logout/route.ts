import { NextResponse } from "next/server";
import { CURRENT_USER_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(CURRENT_USER_COOKIE);
  return res;
}
