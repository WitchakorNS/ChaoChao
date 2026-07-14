// Shared domain types for the CHAOCHAO demo. All data is mock.

export type Role = "renter" | "lender" | "both" | "admin";

export type KycStatus = "unverified" | "pending" | "verified";

export interface User {
  id: string;
  name: string;
  avatarColor: string; // gradient seed
  initials: string;
  role: Role;
  kyc: KycStatus;
  rating: number;
  reviewCount: number;
  location: string;
  joinedYear: number;
  responseRate: number; // %
  bio?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string; // lucide icon name
  count: number;
}

export type ListingStatus = "available" | "booked" | "closed";

export interface Listing {
  id: string;
  title: string;
  categoryId: string;
  imageSeeds: string[]; // used to generate gradient placeholders
  description: string;
  pricePerDay: number;
  deposit: number;
  rating: number;
  reviewCount: number;
  location: string;
  ownerId: string;
  status: ListingStatus;
  availableFrom: string; // ISO date
  condition: string;
  terms: string[];
  featured?: boolean;
}

export interface Review {
  id: string;
  listingId: string;
  authorId: string;
  productRating: number;
  lenderRating: number;
  comment: string;
  date: string; // ISO
  imageSeeds?: string[];
}

export type BookingStatus =
  | "pending" // รออนุมัติ
  | "awaiting_payment" // รอชำระเงิน
  | "confirmed" // ยืนยันการเช่า
  | "delivered" // ส่งมอบแล้ว
  | "due_soon" // ใกล้กำหนดคืน
  | "returned" // คืนเรียบร้อย
  | "completed" // เสร็จสมบูรณ์
  | "cancelled" // ยกเลิก
  | "disputed"; // มีข้อพิพาท

export interface TimelineEvent {
  status: BookingStatus | "created" | "paid" | "evidence";
  label: string;
  date: string; // ISO
  done: boolean;
}

export type EvidenceType =
  | "before_pickup"
  | "after_pickup"
  | "before_return"
  | "after_return";

export interface Evidence {
  id: string;
  bookingId: string;
  type: EvidenceType;
  imageSeed: string;
  note: string;
  time: string; // ISO
  location: string;
  uploadedBy: string;
}

export interface Booking {
  id: string;
  listingId: string;
  renterId: string;
  lenderId: string;
  startDate: string; // ISO
  endDate: string; // ISO
  days: number;
  rentalTotal: number;
  deposit: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  createdAt: string; // ISO
  timeline: TimelineEvent[];
  reviewed?: boolean;
}

export type NotificationType =
  | "request"
  | "approved"
  | "awaiting_payment"
  | "paid"
  | "due_soon"
  | "message"
  | "dispute";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  date: string; // ISO
  read: boolean;
  href?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  imageSeed?: string;
  time: string; // ISO
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  participantId: string; // the other party
  listingId: string;
  messages: ChatMessage[];
}

export type DisputeStatus = "open" | "reviewing" | "resolved";

export interface Dispute {
  id: string;
  bookingId: string;
  reason: string;
  detail: string;
  openedById: string;
  status: DisputeStatus;
  date: string; // ISO
}
