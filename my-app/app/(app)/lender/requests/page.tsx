"use client";

import Link from "next/link";
import { Check, Inbox, MessageSquare, X } from "lucide-react";
import { useDemo } from "@/lib/store";
import { getListing, getUser, getCategory } from "@/lib/mock/data";
import { bookingStatusMeta, formatDate, thb } from "@/lib/format";
import {
  Avatar,
  EmptyState,
  PlaceholderImage,
  StatusChip,
  VerifiedBadge,
} from "@/components/chao/primitives";

export default function RequestsPage() {
  const { bookings, userId, approveBooking, rejectBooking } = useDemo();
  const requests = bookings
    .filter((b) => b.lenderId === userId)
    .sort((a) => (a.status === "pending" ? -1 : 1));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">คำขอเช่า</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        อนุมัติหรือปฏิเสธคำขอเช่าอุปกรณ์ของคุณ
      </p>

      {requests.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Inbox} title="ยังไม่มีคำขอเช่า" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {requests.map((b) => {
            const renter = getUser(b.renterId);
            const listing = getListing(b.listingId);
            const cat = listing ? getCategory(listing.categoryId) : undefined;
            const meta = bookingStatusMeta[b.status];
            const pending = b.status === "pending";
            return (
              <div key={b.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <PlaceholderImage
                    seed={listing?.imageSeeds[0] ?? b.id}
                    iconName={cat?.icon}
                    className="h-16 w-16 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {b.id}
                      </span>
                      <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                    </div>
                    <h3 className="mt-0.5 line-clamp-1 font-medium">
                      {listing?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(b.startDate)} – {formatDate(b.endDate)} · {b.days} วัน
                    </p>
                  </div>
                </div>

                {/* Renter + total */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 p-2.5">
                  <div className="flex items-center gap-2">
                    {renter && (
                      <Avatar
                        seed={renter.avatarColor}
                        initials={renter.initials}
                        size={32}
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{renter?.name}</span>
                        <VerifiedBadge kyc={renter?.kyc ?? "unverified"} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ผู้เช่า · {renter?.rating.toFixed(1)} ★
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">ยอดรวม</p>
                    <p className="font-semibold">{thb(b.total)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {pending ? (
                    <>
                      <button
                        onClick={() => approveBooking(b.id)}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-success text-sm font-semibold text-success-foreground transition hover:brightness-105"
                      >
                        <Check className="h-4 w-4" /> อนุมัติ
                      </button>
                      <button
                        onClick={() => rejectBooking(b.id)}
                        className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-danger/40 text-sm font-semibold text-danger transition hover:bg-danger/5"
                      >
                        <X className="h-4 w-4" /> ปฏิเสธ
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {b.status === "cancelled" ? "ปฏิเสธแล้ว" : "อนุมัติแล้ว"}
                    </span>
                  )}
                  <Link
                    href="/renter/chat"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition hover:bg-muted"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">แชท</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
