import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { CURRENT_USER_COOKIE } from "@/lib/auth";

// DB-backed "identity" login: look up the account by email and remember it in a
// cookie. NOTE: no password verification — this is a demo, not secure auth.
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
    }
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบบัญชีที่ใช้อีเมลนี้" },
        { status: 401 },
      );
    }
    const res = NextResponse.json({ user });
    res.cookies.set(CURRENT_USER_COOKIE, user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "เข้าสู่ระบบไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
