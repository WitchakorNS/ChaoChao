import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import { setUserKyc, type KycState } from "@/lib/db/mutations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserById(id);
    if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}

// Update the user's KYC/verification state.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { kyc } = await request.json();
    if (!["unverified", "pending", "verified"].includes(kyc)) {
      return NextResponse.json(
        { error: "kyc must be unverified | pending | verified" },
        { status: 400 },
      );
    }
    await setUserKyc(id, kyc as KycState);
    const user = await getUserById(id);
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to update user" },
      { status: 500 },
    );
  }
}
