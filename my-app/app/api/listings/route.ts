import { NextResponse } from "next/server";
import { getListings } from "@/lib/db";
import { createListing } from "@/lib/db/mutations";
import { CURRENT_USER_ID } from "@/lib/mock/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "rating";
  const availableOnly = searchParams.get("availableOnly") === "true";

  try {
    let listings = await getListings();
    if (q) listings = listings.filter((l) => l.title.toLowerCase().includes(q));
    if (category)
      listings = listings.filter((l) => l.categorySlug === category);
    if (availableOnly)
      listings = listings.filter((l) => l.status === "available");
    listings = [...listings].sort((a, b) => {
      if (sort === "price_asc") return a.pricePerDay - b.pricePerDay;
      if (sort === "price_desc") return b.pricePerDay - a.pricePerDay;
      return b.rating - a.rating;
    });
    return NextResponse.json({ listings });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to load listings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.categorySlug) {
      return NextResponse.json(
        { error: "title and categorySlug are required" },
        { status: 400 },
      );
    }
    const id = await createListing({
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
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "failed to create listing" },
      { status: 500 },
    );
  }
}
