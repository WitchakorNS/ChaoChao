import { createAdminClient } from "@/lib/supabase/admin";
import { itemNum, orderNum, userNum } from "./ids";
import type { EvidenceType, ListingStatus } from "@/lib/mock/types";

const SERVICE_RATE = 0.05;

// ---- workflow helpers -------------------------------------------------------

type Flow = "RentalOrderFlow" | "ItemFlow" | "UserVerificationFlow";

async function stateId(flow: Flow, stateName: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("workflow_state")
    .select("state_id, workflow_definition!inner(workflow_name)")
    .eq("workflow_definition.workflow_name", flow)
    .eq("state_name", stateName)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Unknown state ${flow}/${stateName}`);
  return data.state_id as number;
}

// ---- listings ---------------------------------------------------------------

export interface ListingInput {
  title: string;
  categorySlug: string;
  description?: string;
  pricePerDay: number;
  deposit: number;
  availableFrom?: string;
  pickupLocation?: string;
  returnLocation?: string;
  imageSeeds?: string[];
  publish: boolean; // false => Draft
  ownerId: string;
}

export async function createListing(input: ListingInput): Promise<string> {
  const supabase = createAdminClient();
  const current_state_id = await stateId(
    "ItemFlow",
    input.publish ? "Published" : "Draft",
  );

  const { data, error } = await supabase
    .from("item")
    .insert({
      owner_id: userNum(input.ownerId),
      item_name: input.title,
      item_description: input.description ?? "",
      price: input.pricePerDay,
      deposit: input.deposit,
      current_state_id,
      category: input.categorySlug,
    })
    .select("item_id")
    .single();
  if (error) throw error;
  const itemId = data.item_id as number;

  await writeListingChildren(itemId, input);
  return `p${itemId}`;
}

// Replaces images/locations/availability for an item.
async function writeListingChildren(itemId: number, input: ListingInput) {
  const supabase = createAdminClient();

  const seeds =
    input.imageSeeds && input.imageSeeds.length
      ? input.imageSeeds
      : [`item${itemId}`];
  await supabase.from("item_image").delete().eq("item_id", itemId);
  await supabase
    .from("item_image")
    .insert(seeds.map((s) => ({ item_id: itemId, image_url: s })));

  await supabase.from("item_location").delete().eq("item_id", itemId);
  const locations: { item_id: number; location_name: string; location_type: string }[] = [];
  const pickup = input.pickupLocation?.trim();
  const ret = input.returnLocation?.trim();
  if (pickup && ret && pickup === ret) {
    locations.push({ item_id: itemId, location_name: pickup, location_type: "pickup&return" });
  } else {
    if (pickup)
      locations.push({ item_id: itemId, location_name: pickup, location_type: "pickup" });
    if (ret)
      locations.push({ item_id: itemId, location_name: ret, location_type: "return" });
  }
  if (locations.length) await supabase.from("item_location").insert(locations);

  if (input.availableFrom) {
    await supabase.from("availability").delete().eq("item_id", itemId);
    await supabase.from("availability").insert({
      item_id: itemId,
      availability_date: input.availableFrom,
      start_time: "09:00",
      end_time: "18:00",
    });
  }
}

export async function updateListing(
  listingId: string,
  input: ListingInput,
): Promise<string> {
  const supabase = createAdminClient();
  const itemId = itemNum(listingId);
  const current_state_id = await stateId(
    "ItemFlow",
    input.publish ? "Published" : "Draft",
  );

  const { error } = await supabase
    .from("item")
    .update({
      item_name: input.title,
      item_description: input.description ?? "",
      price: input.pricePerDay,
      deposit: input.deposit,
      category: input.categorySlug,
      current_state_id,
    })
    .eq("item_id", itemId);
  if (error) throw error;

  await writeListingChildren(itemId, input);
  return listingId;
}

const LISTING_STATE: Record<ListingStatus, string> = {
  available: "Published",
  booked: "Rented",
  closed: "Removed",
};

export async function setListingStatus(
  listingId: string,
  status: ListingStatus,
): Promise<void> {
  const supabase = createAdminClient();
  const current_state_id = await stateId("ItemFlow", LISTING_STATE[status]);
  const { error } = await supabase
    .from("item")
    .update({ current_state_id })
    .eq("item_id", itemNum(listingId));
  if (error) throw error;
}

// ---- bookings ---------------------------------------------------------------

export interface BookingInput {
  listingId: string;
  renterId: string;
  startDate: string; // ISO date
  endDate: string;
}

export async function createBooking(input: BookingInput): Promise<string> {
  const supabase = createAdminClient();
  const itemId = itemNum(input.listingId);

  const { data: item, error: itemErr } = await supabase
    .from("item")
    .select("item_id, price, deposit")
    .eq("item_id", itemId)
    .maybeSingle();
  if (itemErr) throw itemErr;
  if (!item) throw new Error("ไม่พบสินค้า");

  const days = Math.max(
    1,
    Math.round(
      (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
        86400000,
    ),
  );
  const price = Number(item.price);
  const deposit = Number(item.deposit);
  const rentalTotal = price * days;
  const serviceFee = Math.round(rentalTotal * SERVICE_RATE);

  const current_state_id = await stateId("RentalOrderFlow", "Pending");
  const { data: order, error } = await supabase
    .from("rental_order")
    .insert({
      renter_id: userNum(input.renterId),
      current_state_id,
      pickup_time: `${input.startDate} 10:00`,
      return_time: `${input.endDate} 10:00`,
      total_price: rentalTotal,
      total_deposit: deposit,
    })
    .select("rental_order_id")
    .single();
  if (error) throw error;
  const orderId = order.rental_order_id as number;

  await supabase.from("rental_order_item").insert({
    rental_order_id: orderId,
    item_id: itemId,
    quantity: 1,
    price_at_order: price,
    deposit_at_order: deposit,
  });

  await supabase.from("payment").insert({
    rental_order_id: orderId,
    total_amount: rentalTotal + deposit + serviceFee,
    status: "Pending",
  });

  return `BK-${orderId}`;
}

async function setOrderState(bookingId: string, stateName: string) {
  const supabase = createAdminClient();
  const current_state_id = await stateId("RentalOrderFlow", stateName);
  const { error } = await supabase
    .from("rental_order")
    .update({ current_state_id })
    .eq("rental_order_id", orderNum(bookingId));
  if (error) throw error;
}

export const approveBooking = (id: string) => setOrderState(id, "Confirmed");
export const rejectBooking = (id: string) => setOrderState(id, "Cancelled");

export async function payBooking(bookingId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("payment")
    .update({ status: "Paid", payment_date: new Date().toISOString() })
    .eq("rental_order_id", orderNum(bookingId));
  if (error) throw error;
  // Keep the order in Confirmed once paid.
  await setOrderState(bookingId, "Confirmed");
}

// Move an order along the rental workflow (PickedUp / Ongoing / Returned /
// Completed / Disputed).
export async function advanceBooking(
  bookingId: string,
  stateName: string,
): Promise<void> {
  await setOrderState(bookingId, stateName);
}

// ---- reviews ----------------------------------------------------------------

export interface ReviewInput {
  bookingId: string;
  authorId: string;
  rating: number;
  comment?: string;
  imageSeeds?: string[];
}

export async function createReview(input: ReviewInput): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("review")
    .insert({
      user_id: userNum(input.authorId),
      rental_order_id: orderNum(input.bookingId),
      rating: input.rating,
      comment: input.comment ?? "",
    })
    .select("review_id")
    .single();
  if (error) throw error;
  const reviewId = data.review_id as number;

  if (input.imageSeeds?.length) {
    await supabase.from("review_image").insert(
      input.imageSeeds.map((s) => ({ review_id: reviewId, image_url: s })),
    );
  }
  return `r${reviewId}`;
}

// ---- evidence ---------------------------------------------------------------

export interface EvidenceInput {
  bookingId: string;
  type: EvidenceType;
  imageSeeds: string[];
}

export async function createEvidence(input: EvidenceInput): Promise<number> {
  const supabase = createAdminClient();
  const rows = (input.imageSeeds.length ? input.imageSeeds : ["evidence"]).map(
    (seed) => ({
      rental_order_id: orderNum(input.bookingId),
      evidence_type: input.type,
      image_url: seed,
    }),
  );
  const { data, error } = await supabase
    .from("rental_evidence")
    .insert(rows)
    .select("evidence_id");
  if (error) throw error;
  return data?.length ?? 0;
}

// ---- users ------------------------------------------------------------------

export interface UserInput {
  name: string;
  email: string;
  role: "renter" | "lender" | "both";
}

/**
 * Demo-only account creation. No real credentials are handled: the password a
 * user types is never sent to the server or stored — password_hash is filled
 * with a fixed placeholder because the column is NOT NULL.
 */
export async function createUser(input: UserInput): Promise<string> {
  const supabase = createAdminClient();
  const current_state_id = await stateId(
    "UserVerificationFlow",
    "NotVerified",
  );

  const { data, error } = await supabase
    .from("user_account")
    .insert({
      name: input.name,
      email: input.email,
      password_hash: "demo-account-no-password-stored",
      current_state_id,
    })
    .select("user_id")
    .single();
  if (error) throw error;
  const userId = data.user_id as number;

  // Single-role accounts drive the role-based navigation:
  //   renter -> User, lender -> Shop, both -> User + Shop.
  const roleNames =
    input.role === "both"
      ? ["User", "Shop"]
      : input.role === "lender"
        ? ["Shop"]
        : ["User"];
  const { data: roles } = await supabase
    .from("role")
    .select("role_id, role_name")
    .in("role_name", roleNames);
  if (roles?.length) {
    await supabase
      .from("user_role")
      .insert(roles.map((r) => ({ user_id: userId, role_id: r.role_id })));
  }
  return `u${userId - 1}`;
}

export type KycState = "unverified" | "pending" | "verified";

const KYC_STATE: Record<KycState, string> = {
  unverified: "NotVerified",
  pending: "PendingReview",
  verified: "Verified",
};

export async function setUserKyc(
  userId: string,
  kyc: KycState,
): Promise<void> {
  const supabase = createAdminClient();
  const current_state_id = await stateId(
    "UserVerificationFlow",
    KYC_STATE[kyc],
  );
  const { error } = await supabase
    .from("user_account")
    .update({ current_state_id })
    .eq("user_id", userNum(userId));
  if (error) throw error;
}
