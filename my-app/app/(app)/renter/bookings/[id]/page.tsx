"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  Wallet,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { getListing, getUser, getCategory } from "@/lib/mock/data";
import type { BookingStatus, User } from "@/lib/mock/types";
import { bookingStatusMeta, formatDate, thb } from "@/lib/format";
import {
  Avatar,
  PlaceholderImage,
  StatusChip,
  VerifiedBadge,
} from "@/components/chao/primitives";
import { BookingTimeline } from "@/components/chao/timeline";

// Build a display user for parties that aren't in the mock catalog (e.g. newly
// registered DB accounts) so their name + avatar still render.
function synthUser(id: string, name?: string): User {
  const n = name ?? "ผู้ใช้";
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  const parts = n.trim().split(/\s+/);
  const initials =
    parts.length >= 2 ? (parts[0][0] ?? "") + (parts[1][0] ?? "") : n.slice(0, 2);
  return {
    id,
    name: n,
    avatarColor: `${h} 55% 55%`,
    initials,
    role: "renter",
    kyc: "verified",
    rating: 5,
    reviewCount: 0,
    location: "",
    joinedYear: 2024,
    responseRate: 95,
  };
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { bookings, advanceBooking } = useDemo();
  const [reported, setReported] = useState(false);
  const [busy, setBusy] = useState(false);
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        ไม่พบรายการเช่านี้
      </div>
    );
  }

  const listing = getListing(booking.listingId);
  const category = listing ? getCategory(listing.categoryId) : undefined;
  // Prefer the DB enrichment carried on the booking; fall back to the mock
  // catalog. This is why user-created (DB-only) items now show correctly.
  const title = booking.listingTitle ?? listing?.title ?? "สินค้า";
  const imageSeed =
    booking.listingImageSeed ?? listing?.imageSeeds[0] ?? booking.id;
  const catIcon = booking.listingCategoryIcon ?? category?.icon;
  const location = listing?.location;
  const lender =
    getUser(booking.lenderId) ?? synthUser(booking.lenderId, booking.lenderName);
  const renter =
    getUser(booking.renterId) ?? synthUser(booking.renterId, booking.renterName);
  const meta = bookingStatusMeta[booking.status];

  // The next workflow step this booking can advance to (issue 1).
  const nextStep: { label: string; state: string; ui: BookingStatus } | null =
    booking.status === "confirmed"
      ? { label: "ยืนยันรับสินค้า", state: "PickedUp", ui: "delivered" }
      : booking.status === "delivered" || booking.status === "due_soon"
        ? { label: "ยืนยันคืนสินค้า", state: "Returned", ui: "returned" }
        : booking.status === "returned"
          ? { label: "ปิดรายการ (เสร็จสมบูรณ์)", state: "Completed", ui: "completed" }
          : null;

  const advance = async () => {
    if (!nextStep) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "advance", state: nextStep.state }),
      });
      if (!res.ok) throw new Error();
      advanceBooking(booking.id, nextStep.ui);
      router.refresh();
    } catch {
      // keep current state on failure
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> กลับ
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{booking.id}</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
        </div>
        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
      </div>

      {/* Product summary */}
      <div className="mt-5 flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <PlaceholderImage
          seed={imageSeed}
          iconName={catIcon}
          className="h-20 w-20 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/product/${booking.listingId}`}
            className="font-medium hover:underline"
          >
            {title}
          </Link>
          {location && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {location}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="text-muted-foreground">รับ:</span>{" "}
              {formatDate(booking.startDate)}
            </span>
            <span>
              <span className="text-muted-foreground">คืน:</span>{" "}
              {formatDate(booking.endDate)}
            </span>
            <span>
              <span className="text-muted-foreground">ระยะเวลา:</span>{" "}
              {booking.days} วัน
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {/* Parties */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              คู่สัญญา
            </h2>
            {lender && (
              <PartyRow label="ผู้ให้เช่า" user={lender} />
            )}
            <div className="my-3 border-t" />
            {renter && <PartyRow label="ผู้เช่า" user={renter} />}
          </div>

          {/* Cost summary */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              สรุปค่าใช้จ่าย
            </h2>
            <dl className="space-y-2 text-sm">
              <CostRow label={`ค่าเช่า ${booking.days} วัน`} value={thb(booking.rentalTotal)} />
              <CostRow label="ค่าธรรมเนียม" value={thb(booking.serviceFee)} />
              <CostRow label="ค่ามัดจำ" value={thb(booking.deposit)} muted />
              <div className="flex items-center justify-between border-t pt-2 font-semibold">
                <span>ยอดรวม</span>
                <span className="text-primary">{thb(booking.total)}</span>
              </div>
            </dl>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
            สถานะรายการเช่า
          </h2>
          <BookingTimeline events={booking.timeline} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {booking.status === "awaiting_payment" && (
          <Link
            href={`/renter/payment/${booking.id}`}
            className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground sm:col-span-4"
          >
            <Wallet className="h-4 w-4" /> ชำระเงิน
          </Link>
        )}
        {nextStep && (
          <button
            onClick={advance}
            disabled={busy}
            className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70 sm:col-span-4"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {nextStep.label}
          </button>
        )}
        <ActionBtn href="/renter/chat" icon={MessageSquare} label="แชท" />
        <ActionBtn href={`/evidence/${booking.id}`} icon={Camera} label="อัปโหลดหลักฐาน" />
        <button
          onClick={() => setReported(true)}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border text-sm font-medium text-danger transition hover:bg-danger/5"
        >
          <AlertTriangle className="h-4 w-4" /> แจ้งปัญหา
        </button>
        {booking.status === "completed" && !booking.reviewed ? (
          <ActionBtn href={`/renter/review/${booking.id}`} icon={Star} label="รีวิว" primary />
        ) : (
          <ActionBtn href={`/renter/review/${booking.id}`} icon={Star} label="รีวิว" />
        )}
      </div>

      {reported && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <div>
            <p className="font-medium">ส่งเรื่องแจ้งปัญหาแล้ว (เดโม)</p>
            <p className="text-muted-foreground">
              ทีมงานจะติดต่อกลับและเปิดเคสข้อพิพาทให้หากจำเป็น
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PartyRow({
  label,
  user,
}: {
  label: string;
  user: ReturnType<typeof getUser>;
}) {
  if (!user) return null;
  return (
    <div className="flex items-center gap-3">
      <Avatar seed={user.avatarColor} initials={user.initials} size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{user.name}</p>
          <VerifiedBadge kyc={user.kyc} className="shrink-0" />
        </div>
      </div>
    </div>
  );
}

function CostRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-muted-foreground" : ""}>{label}</dt>
      <dd className={muted ? "text-muted-foreground" : "font-medium"}>{value}</dd>
    </div>
  );
}

function ActionBtn({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cnBtn(primary)}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function cnBtn(primary?: boolean) {
  return [
    "inline-flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition",
    primary
      ? "bg-accent text-accent-foreground hover:brightness-105"
      : "border hover:bg-muted",
  ].join(" ");
}
