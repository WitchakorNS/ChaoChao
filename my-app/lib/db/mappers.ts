import { categories, categoryIcon, categoryName } from "@/lib/categories";
import { uid } from "./ids";
import type {
  Booking,
  BookingStatus,
  Evidence,
  KycStatus,
  Listing,
  ListingStatus,
  Review,
  Role,
  TimelineEvent,
  User,
} from "@/lib/mock/types";

// ---- helpers ----------------------------------------------------------------

// Supabase embeds a to-one relation as an object, but sometimes as a 1-element
// array. Normalize either into a single value.
export function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

const num = (v: unknown): number => (v == null ? 0 : Number(v));

function hue(id: number) {
  return (id * 47 + 200) % 360;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] ?? "") + (parts[1][0] ?? "");
  return name.trim().slice(0, 2);
}

const slugToCatId = (slug: string): string =>
  categories.find((c) => c.slug === slug)?.id ?? "c1";

function daysBetween(a: string, b: string): number {
  const d = Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86400000,
  );
  return d > 0 ? d : 1;
}

const DEFAULT_TERMS = [
  "คืนอุปกรณ์ตามเวลาที่นัดหมาย",
  "ระวังการกระแทกและความเสียหาย",
  "กรณีเสียหายคิดตามจริงจากค่ามัดจำ",
];

// ---- state maps -------------------------------------------------------------

const KYC_MAP: Record<string, KycStatus> = {
  NotVerified: "unverified",
  PendingReview: "pending",
  Verified: "verified",
  Rejected: "unverified",
};

const ITEM_STATUS_MAP: Record<string, ListingStatus> = {
  Draft: "closed",
  Published: "available",
  Rented: "booked",
  Unavailable: "closed",
  Removed: "closed",
};

const ROLE_MAP: Record<string, Role> = {
  Admin: "admin",
  User: "renter",
  Shop: "lender",
};

// ---- users ------------------------------------------------------------------

export interface UserRow {
  user_id: number;
  name: string;
  email?: string;
  created_at?: string;
  current_state?: { state_name: string } | { state_name: string }[] | null;
  user_role?: { role: { role_name: string } | { role_name: string }[] }[];
}

export function mapUser(
  row: UserRow,
  agg?: { avg: number; count: number },
  location?: string,
): User {
  const stateName = one(row.current_state)?.state_name ?? "NotVerified";
  const roleNames = (row.user_role ?? [])
    .map((ur) => one(ur.role)?.role_name)
    .filter(Boolean) as string[];
  let role: Role = "renter";
  if (roleNames.includes("Admin")) role = "admin";
  else if (roleNames.includes("Shop") && roleNames.includes("User"))
    role = "both";
  else if (roleNames.includes("Shop")) role = "lender";
  else if (roleNames.length) role = ROLE_MAP[roleNames[0]] ?? "renter";

  return {
    id: uid(row.user_id),
    name: row.name,
    avatarColor: `${hue(row.user_id)} 60% 55%`,
    initials: initials(row.name),
    role,
    kyc: KYC_MAP[stateName] ?? "unverified",
    rating: agg && agg.count ? agg.avg : 5,
    reviewCount: agg?.count ?? 0,
    location: location ?? "ประเทศไทย",
    joinedYear: row.created_at ? new Date(row.created_at).getFullYear() : 2024,
    responseRate: 90 + (row.user_id % 10),
  };
}

// ---- listings ---------------------------------------------------------------

export interface ItemRow {
  item_id: number;
  owner_id: number;
  item_name: string;
  item_description: string | null;
  price: number | string;
  deposit: number | string;
  category: string;
  created_at?: string;
  current_state?: { state_name: string } | { state_name: string }[] | null;
  item_image?: { image_url: string }[];
  item_location?: { location_name: string }[];
  availability?: { availability_date: string }[];
  owner?: UserRow | UserRow[] | null;
}

export function mapListing(
  row: ItemRow,
  rating?: { avg: number; count: number },
): Listing {
  const stateName = one(row.current_state)?.state_name ?? "Published";
  const owner = one(row.owner);
  const ownerState = owner ? one(owner.current_state)?.state_name : undefined;
  const seeds =
    row.item_image && row.item_image.length
      ? row.item_image.map((i) => i.image_url)
      : [`item${row.item_id}`];
  const availDates = (row.availability ?? [])
    .map((a) => a.availability_date)
    .sort();

  return {
    id: `p${row.item_id}`,
    title: row.item_name,
    categoryId: slugToCatId(row.category),
    categorySlug: row.category,
    categoryIcon: categoryIcon(row.category),
    imageSeeds: seeds,
    description: row.item_description ?? "",
    pricePerDay: num(row.price),
    deposit: num(row.deposit),
    rating: rating && rating.count ? rating.avg : 0,
    reviewCount: rating?.count ?? 0,
    location: one(row.item_location)?.location_name ?? "ประเทศไทย",
    ownerId: uid(row.owner_id),
    ownerName: owner?.name,
    ownerVerified: ownerState === "Verified",
    status: ITEM_STATUS_MAP[stateName] ?? "available",
    availableFrom: availDates[0] ?? row.created_at?.slice(0, 10) ?? "",
    condition: "สภาพดี",
    terms: DEFAULT_TERMS,
  };
}

export const listingCategoryName = (slug: string) => categoryName(slug);

// ---- bookings ---------------------------------------------------------------

export function deriveBookingStatus(
  orderState: string,
  paymentStatus: string | null,
  returnTime: string,
): BookingStatus {
  switch (orderState) {
    case "Pending":
      return "pending";
    case "Confirmed":
      return paymentStatus === "Paid" ? "confirmed" : "awaiting_payment";
    case "PickedUp":
      return "delivered";
    case "Ongoing": {
      const due = new Date(returnTime).getTime();
      const soon = Date.now() + 2 * 86400000;
      return due <= soon ? "due_soon" : "delivered";
    }
    case "Returned":
      return "returned";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    case "Disputed":
      return "disputed";
    default:
      return "pending";
  }
}

const STATUS_LEVEL: Record<BookingStatus, number> = {
  pending: 2,
  awaiting_payment: 3,
  confirmed: 4,
  delivered: 5,
  due_soon: 5,
  returned: 6,
  completed: 7,
  cancelled: 99,
  disputed: 99,
};

function buildTimeline(
  status: BookingStatus,
  createdAt: string,
  startDate: string,
  endDate: string,
): TimelineEvent[] {
  const c = createdAt.slice(0, 10);
  if (status === "cancelled") {
    return [
      { status: "created", label: "ส่งคำขอเช่า", date: c, done: true },
      { status: "pending", label: "รอผู้ให้เช่าอนุมัติ", date: c, done: true },
      { status: "cancelled", label: "ยกเลิก / ปฏิเสธคำขอ", date: c, done: true },
    ];
  }
  const level = STATUS_LEVEL[status];
  const disputed = status === "disputed";
  const steps: [BookingStatus | "created" | "paid", string, string, number][] = [
    ["created", "ส่งคำขอเช่า", c, 1],
    ["pending", "รอผู้ให้เช่าอนุมัติ", c, 2],
    ["awaiting_payment", "อนุมัติแล้ว รอชำระเงิน", c, 3],
    ["paid", "ชำระเงินสำเร็จ ยืนยันการเช่า", c, 4],
    ["delivered", "รับสินค้า", startDate.slice(0, 10), 5],
    ["returned", "คืนสินค้า", endDate.slice(0, 10), 6],
    ["completed", "เสร็จสมบูรณ์", endDate.slice(0, 10), 7],
  ];
  const events: TimelineEvent[] = steps.map(([s, label, date, lvl]) => ({
    status: s as TimelineEvent["status"],
    label,
    date,
    done: disputed ? lvl <= 6 : lvl <= level,
  }));
  if (disputed) {
    events.push({
      status: "disputed",
      label: "เปิดข้อพิพาท",
      date: endDate.slice(0, 10),
      done: true,
    });
  }
  return events;
}

export interface OrderItemRow {
  item_id: number;
  price_at_order: number | string;
  deposit_at_order: number | string;
  item?: ItemRow | ItemRow[] | null;
}

export interface OrderRow {
  rental_order_id: number;
  renter_id: number;
  pickup_time: string;
  return_time: string;
  total_price: number | string;
  total_deposit: number | string;
  created_at: string;
  current_state?: { state_name: string } | { state_name: string }[] | null;
  payment?: { status: string; total_amount: number | string } | { status: string; total_amount: number | string }[] | null;
  renter?: UserRow | UserRow[] | null;
  rental_order_item?: OrderItemRow[];
}

export function mapBooking(row: OrderRow): Booking {
  const orderState = one(row.current_state)?.state_name ?? "Pending";
  const payment = one(row.payment);
  const status = deriveBookingStatus(
    orderState,
    payment?.status ?? null,
    row.return_time,
  );
  const firstItem = row.rental_order_item?.[0];
  const item = firstItem ? one(firstItem.item) : null;
  const owner = item ? one(item.owner) : null;
  const renter = one(row.renter);

  const rentalTotal = num(row.total_price);
  const deposit = num(row.total_deposit);
  const serviceFee = Math.round(rentalTotal * 0.05);
  const total = payment ? num(payment.total_amount) : rentalTotal + deposit + serviceFee;
  const days = daysBetween(row.pickup_time, row.return_time);

  return {
    id: `BK-${row.rental_order_id}`,
    listingId: item ? `p${item.item_id}` : "",
    renterId: uid(row.renter_id),
    lenderId: item ? uid(item.owner_id) : "",
    startDate: row.pickup_time.slice(0, 10),
    endDate: row.return_time.slice(0, 10),
    days,
    rentalTotal,
    deposit,
    serviceFee,
    total,
    status,
    createdAt: row.created_at.slice(0, 10),
    timeline: buildTimeline(status, row.created_at, row.pickup_time, row.return_time),
    listingTitle: item?.item_name,
    listingImageSeed: item?.item_image?.[0]?.image_url ?? (item ? `item${item.item_id}` : undefined),
    listingCategoryIcon: item ? categoryIcon(item.category) : undefined,
    lenderName: owner?.name,
    renterName: renter?.name,
  };
}

// ---- reviews ----------------------------------------------------------------

export interface ReviewRow {
  review_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  rental_order_id: number | null;
  review_image?: { image_url: string }[];
}

export function mapReview(row: ReviewRow, listingId: string): Review {
  return {
    id: `r${row.review_id}`,
    listingId,
    authorId: uid(row.user_id),
    productRating: row.rating,
    lenderRating: row.rating,
    comment: row.comment ?? "",
    date: row.created_at.slice(0, 10),
    imageSeeds: row.review_image?.map((i) => i.image_url),
  };
}

// ---- evidence ---------------------------------------------------------------

export interface EvidenceRow {
  evidence_id: number;
  rental_order_id: number;
  evidence_type: string;
  image_url: string;
  uploaded_at: string;
}

export function mapEvidence(row: EvidenceRow): Evidence {
  return {
    id: `ev${row.evidence_id}`,
    bookingId: `BK-${row.rental_order_id}`,
    type: row.evidence_type as Evidence["type"],
    imageSeed: row.image_url,
    note: "",
    time: row.uploaded_at,
    location: "—",
    uploadedBy: "",
  };
}
