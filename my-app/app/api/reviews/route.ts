import { NextResponse } from "next/server";
import { getReviewsForListing } from "@/lib/db";
import { createReview } from "@/lib/db/mutations";
import { CURRENT_USER_ID } from "@/lib/mock/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  if (!listingId)
    return NextResponse.json(
      { error: "listingId is required" },
      { status: 400 },
    );
  try {
    const reviews = await getReviewsForListing(listingId);
    return NextResponse.json({ reviews });
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
    const rating = Number(body.rating);
    if (!body.bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "bookingId and a rating between 1 and 5 are required" },
        { status: 400 },
      );
    }
    const id = await createReview({
      bookingId: body.bookingId,
      authorId: body.authorId ?? CURRENT_USER_ID,
      rating,
      comment: body.comment,
      imageSeeds: body.imageSeeds,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to create review" },
      { status: 500 },
    );
  }
}
