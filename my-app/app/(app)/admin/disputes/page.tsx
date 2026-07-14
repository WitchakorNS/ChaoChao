"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { disputes as seed, getBooking, getListing, getUser } from "@/lib/mock/data";
import { formatDate } from "@/lib/format";
import { StatusChip } from "@/components/chao/primitives";
import type { DisputeStatus } from "@/lib/mock/types";

const STATUS_TONE: Record<DisputeStatus, "danger" | "warning" | "success"> = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
};
const STATUS_LABEL: Record<DisputeStatus, string> = {
  open: "เปิดเคส",
  reviewing: "กำลังตรวจสอบ",
  resolved: "ปิดเคสแล้ว",
};

export default function AdminDisputesPage() {
  const [items, setItems] = useState(seed.map((d) => ({ ...d })));

  const resolve = (id: string) =>
    setItems((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "resolved" } : d)),
    );

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ข้อพิพาท</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        จัดการข้อพิพาทระหว่างผู้เช่าและผู้ให้เช่า
      </p>

      <div className="mt-6 space-y-3">
        {items.map((d) => {
          const booking = getBooking(d.bookingId);
          const listing = booking ? getListing(booking.listingId) : undefined;
          const opener = getUser(d.openedById);
          return (
            <div key={d.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium">{d.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.bookingId} · {listing?.title}
                    </p>
                  </div>
                </div>
                <StatusChip tone={STATUS_TONE[d.status]}>
                  {STATUS_LABEL[d.status]}
                </StatusChip>
              </div>

              <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                {d.detail}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  เปิดโดย {opener?.name} · {formatDate(d.date)}
                </span>
                <div className="flex gap-2">
                  <Link
                    href="/admin/evidence"
                    className="inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium hover:bg-muted"
                  >
                    ดูหลักฐาน
                  </Link>
                  {d.status !== "resolved" ? (
                    <button
                      onClick={() => resolve(d.id)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4" /> ปิดเคส
                    </button>
                  ) : (
                    <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-success/10 px-4 text-sm font-medium text-success">
                      <CheckCircle2 className="h-4 w-4" /> ปิดเคสแล้ว
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
