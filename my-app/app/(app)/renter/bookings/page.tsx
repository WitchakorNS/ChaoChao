"use client";

import { useState } from "react";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { BookingCard } from "@/components/chao/booking-card";
import { EmptyState } from "@/components/chao/primitives";
import type { BookingStatus } from "@/lib/mock/types";

const TABS: { key: string; label: string; match: BookingStatus[] }[] = [
  { key: "all", label: "ทั้งหมด", match: [] },
  { key: "active", label: "กำลังเช่า", match: ["confirmed", "delivered", "due_soon"] },
  { key: "pay", label: "รอชำระเงิน", match: ["awaiting_payment", "pending"] },
  { key: "done", label: "เสร็จสมบูรณ์", match: ["completed", "returned"] },
];

export default function RenterBookingsPage() {
  const { bookings, userId } = useDemo();
  const [tab, setTab] = useState("all");
  const mine = bookings.filter((b) => b.renterId === userId);
  const active = TABS.find((t) => t.key === tab)!;
  const list =
    active.match.length === 0
      ? mine
      : mine.filter((b) => active.match.includes(b.status));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">รายการเช่าของฉัน</h1>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto border-b pb-px">
        {TABS.map((t) => {
          const count =
            t.match.length === 0
              ? mine.length
              : mine.filter((b) => t.match.includes(b.status)).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition",
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {list.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="ไม่มีรายการในหมวดนี้"
            action={
              <Link href="/explore" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                ค้นหาอุปกรณ์
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {list.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                counterpartyRole="lender"
                href={
                  b.status === "awaiting_payment"
                    ? `/renter/payment/${b.id}`
                    : `/renter/bookings/${b.id}`
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
