import { NextResponse } from "next/server";
import { getBookings, getBookingById } from "@/lib/db";
import { createBooking } from "@/lib/db/mutations";
import { CURRENT_USER_ID } from "@/lib/mock/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const renterId = searchParams.get("renterId") ?? undefined;
  const lenderId = searchParams.get("lenderId") ?? undefined;
  try {
    const bookings = await getBookings({ renterId, lenderId });
    return NextResponse.json({ bookings });
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
    if (!body.listingId || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: "listingId, startDate and endDate are required" },
        { status: 400 },
      );
    }
    if (new Date(body.endDate) <= new Date(body.startDate)) {
      return NextResponse.json(
        { error: "endDate must be after startDate" },
        { status: 400 },
      );
    }
    const id = await createBooking({
      listingId: body.listingId,
      renterId: body.renterId ?? CURRENT_USER_ID,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    const booking = await getBookingById(id);
    return NextResponse.json({ id, booking }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to create booking" },
      { status: 500 },
    );
  }
}
