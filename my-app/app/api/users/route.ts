import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db";
import { createUser } from "@/lib/db/mutations";
import { CURRENT_USER_COOKIE } from "@/lib/auth";

export async function GET() {
  try {
    return NextResponse.json({ users: await getAllUsers() });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}

/**
 * Demo account creation. The registration form never sends a password — this
 * only records name/email/role so the account shows up in the DB.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 },
      );
    }
    const id = await createUser({
      name: body.name,
      email: body.email,
      role: body.role ?? "both",
    });
    // Auto-login the new account (set the identity cookie).
    const res = NextResponse.json({ id }, { status: 201 });
    res.cookies.set(CURRENT_USER_COOKIE, id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    const msg = (e as Error).message ?? "failed to create user";
    // Unique violation on email
    const status = msg.includes("duplicate key") ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "อีเมลนี้ถูกใช้งานแล้ว" : msg },
      { status },
    );
  }
}
