// Mock fallbacks used when the local Supabase instance is unreachable, so the
// app degrades gracefully instead of crashing. The mock catalog already mirrors
// the seeded DB; here we just enrich listings with the same view-model fields
// the DB mappers produce (categorySlug/icon, owner name/verified).

import {
  listings as mockListings,
  bookings as mockBookings,
  users as mockUsers,
  evidences as mockEvidences,
  disputes as mockDisputes,
  getCategory,
  getUser,
  getReviewsForListing as mockReviewsFor,
} from "@/lib/mock/data";
import type { Booking, Listing } from "@/lib/mock/types";

export function fallbackListingView(l: Listing): Listing {
  const cat = getCategory(l.categoryId);
  const owner = getUser(l.ownerId);
  return {
    ...l,
    categorySlug: l.categorySlug ?? cat?.slug,
    categoryIcon: l.categoryIcon ?? cat?.icon,
    ownerName: l.ownerName ?? owner?.name,
    ownerVerified: l.ownerVerified ?? owner?.kyc === "verified",
  };
}

export const fallbackListings = () => mockListings.map(fallbackListingView);

function fallbackBookingView(b: Booking): Booking {
  const listing = mockListings.find((l) => l.id === b.listingId);
  const cat = listing ? getCategory(listing.categoryId) : undefined;
  return {
    ...b,
    listingTitle: b.listingTitle ?? listing?.title,
    listingImageSeed: b.listingImageSeed ?? listing?.imageSeeds[0],
    listingCategoryIcon: b.listingCategoryIcon ?? cat?.icon,
    lenderName: b.lenderName ?? getUser(b.lenderId)?.name,
    renterName: b.renterName ?? getUser(b.renterId)?.name,
  };
}

export const fallbackBookings = () => mockBookings.map(fallbackBookingView);

export {
  mockUsers,
  mockEvidences,
  mockDisputes,
  mockReviewsFor,
};
