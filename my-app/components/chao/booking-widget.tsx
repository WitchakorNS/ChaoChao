"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { thb } from "@/lib/format";
import { useDemo } from "@/lib/store";
import type { Listing } from "@/lib/mock/types";

const SERVICE_RATE = 0.05;

export function BookingWidget({ listing }: { listing: Listing }) {
  const { isSaved, toggleSaved } = useDemo();
  const saved = isSaved(listing.id);
  const [start, setStart] = useState("2026-07-16");
  const [end, setEnd] = useState("2026-07-19");
  const [submitted, setSubmitted] = useState(false);

  const days = useMemo(() => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const d = Math.round((e - s) / 86400000);
    return d > 0 ? d : 0;
  }, [start, end]);

  const rental = days * listing.pricePerDay;
  const serviceFee = Math.round(rental * SERVICE_RATE);
  const total = rental + serviceFee + listing.deposit;
  const valid = days > 0;

  if (submitted) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <h3 className="mt-3 text-lg font-semibold">ส่งคำขอเช่าแล้ว</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            รอผู้ให้เช่าอนุมัติคำขอของคุณ เราจะแจ้งเตือนเมื่อมีความคืบหน้า
          </p>
        </div>
        <div className="mt-5 space-y-2">
          <Link
            href="/renter/bookings"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            ดูรายการเช่าของฉัน
          </Link>
          <Link
            href="/renter/chat"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-semibold hover:bg-muted"
          >
            <MessageSquare className="h-4 w-4" /> แชทกับผู้ให้เช่า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-primary">
          {thb(listing.pricePerDay)}
        </span>
        <span className="text-sm text-muted-foreground">/ วัน</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          วันที่รับ
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
          />
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          วันที่คืน
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
          />
        </label>
      </div>

      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
        <Row
          label={`${thb(listing.pricePerDay)} × ${days} วัน`}
          value={thb(rental)}
        />
        <Row label="ค่าธรรมเนียมแพลตฟอร์ม (5%)" value={thb(serviceFee)} />
        <Row
          label="ค่ามัดจำ (คืนเมื่อจบการเช่า)"
          value={thb(listing.deposit)}
          muted
        />
        <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
          <span>ยอดชำระรวม</span>
          <span className="text-primary">{thb(total)}</span>
        </div>
      </div>

      <button
        disabled={!valid}
        onClick={() => setSubmitted(true)}
        className={cn(
          "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-primary-foreground transition",
          valid
            ? "bg-primary hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        <CalendarCheck className="h-5 w-5" />
        ส่งคำขอเช่า
      </button>
      {!valid && (
        <p className="mt-1.5 text-center text-xs text-danger">
          กรุณาเลือกช่วงวันที่ให้ถูกต้อง
        </p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Link
          href="/renter/chat"
          className="flex h-10 items-center justify-center gap-1.5 rounded-full border text-sm font-medium hover:bg-muted"
        >
          <MessageSquare className="h-4 w-4" /> แชท
        </Link>
        <button
          onClick={() => toggleSaved(listing.id)}
          className={cn(
            "flex h-10 items-center justify-center gap-1.5 rounded-full border text-sm font-medium transition hover:bg-muted",
            saved && "border-danger/30 text-danger",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-danger")} />
          {saved ? "บันทึกแล้ว" : "บันทึก"}
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        ยังไม่มีการเรียกเก็บเงินในโหมดเดโม
      </p>
    </div>
  );
}

function Row({
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
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={muted ? "text-muted-foreground" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
