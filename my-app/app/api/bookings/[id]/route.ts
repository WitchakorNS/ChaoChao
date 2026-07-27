import { NextResponse } from "next/server";
import { getBookingById } from "@/lib/db";
import {
  advanceBooking,
  approveBooking,
  payBooking,
  rejectBooking,
} from "@/lib/db/mutations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const booking = await getBookingById(id);
    if (!booking)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}

// Drive the rental workflow: approve / reject / pay, or move to an explicit
// state (PickedUp, Ongoing, Returned, Completed, Disputed).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { action, state } = await request.json();
    switch (action) {
      case "approve":
        await approveBooking(id);
        break;
      case "reject":
        await rejectBooking(id);
        break;
      case "pay":
        await payBooking(id);
        break;
      case "advance":
        if (!state)
          return NextResponse.json(
            { error: "state is required for advance" },
            { status: 400 },
          );
        await advanceBooking(id, state);
        break;
      default:
        return NextResponse.json(
          { error: `unknown action: ${action}` },
          { status: 400 },
        );
    }
    const booking = await getBookingById(id);
    return NextResponse.json({ booking });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to update booking" },
      { status: 500 },
    );
  }
}
