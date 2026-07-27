import { NextResponse } from "next/server";
import { getListingById } from "@/lib/db";
import { setListingStatus, updateListing } from "@/lib/db/mutations";
import { CURRENT_USER_ID } from "@/lib/mock/data";
import type { ListingStatus } from "@/lib/mock/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const listing = await getListingById(id);
    if (!listing)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ listing });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Status-only toggle (open / close a listing).
    if (body.status && !body.title) {
      await setListingStatus(id, body.status as ListingStatus);
      return NextResponse.json({ id, status: body.status });
    }

    await updateListing(id, {
      title: body.title,
      categorySlug: body.categorySlug,
      description: body.description,
      pricePerDay: Number(body.pricePerDay) || 0,
      deposit: Number(body.deposit) || 0,
      availableFrom: body.availableFrom,
      pickupLocation: body.pickupLocation,
      returnLocation: body.returnLocation,
      imageSeeds: body.imageSeeds,
      publish: body.publish !== false,
      ownerId: CURRENT_USER_ID,
    });
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to update listing" },
      { status: 500 },
    );
  }
}
