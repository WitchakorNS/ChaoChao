"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { getListing, getUser } from "@/lib/mock/data";
import { bookingStatusMeta, formatDate } from "@/lib/format";
import { StatusChip } from "@/components/chao/primitives";

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

function toYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { bookings, userId } = useDemo();
  const [month, setMonth] = useState(6); // July (0-indexed)
  const year = 2026;

  const myBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.lenderId === userId && b.status !== "cancelled",
      ),
    [bookings, userId],
  );

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const bookingsOnDay = (day: number) => {
    const ymd = toYmd(new Date(year, month, day));
    return myBookings.filter((b) => ymd >= b.startDate && ymd <= b.endDate);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ตารางจอง</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ภาพรวมช่วงเวลาที่อุปกรณ์ถูกจอง
      </p>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <Legend color="bg-warning" label="รออนุมัติ" />
        <Legend color="bg-success" label="ยืนยันแล้ว" />
        <Legend color="bg-info" label="ส่งมอบ/ใกล้คืน" />
        <Legend color="bg-muted-foreground/40" label="ว่าง" />
      </div>

      {/* Month nav */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => Math.max(0, m - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold">
          {MONTHS[month]} {year + 543}
        </h2>
        <button
          onClick={() => setMonth((m) => Math.min(11, m + 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="mt-3 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null)
              return <div key={i} className="min-h-16 border-b border-r bg-muted/10" />;
            const dayBookings = bookingsOnDay(day);
            const top = dayBookings[0];
            const tone = top ? bookingStatusMeta[top.status].tone : undefined;
            return (
              <div
                key={i}
                className="min-h-16 border-b border-r p-1.5 last:border-r-0"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {day}
                </span>
                {dayBookings.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-[9px] font-medium text-white",
                          tone === "warning" && "bg-warning",
                          tone === "success" && "bg-success",
                          tone === "info" && "bg-info",
                          tone === "danger" && "bg-danger",
                          tone === "muted" && "bg-muted-foreground",
                        )}
                      >
                        {getListing(b.listingId)?.title.slice(0, 10)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookings this month */}
      <h2 className="mt-8 mb-3 text-lg font-semibold">รายการจองในเดือนนี้</h2>
      <div className="space-y-2">
        {myBookings
          .filter((b) => b.startDate.startsWith(`${year}-07`) || b.endDate.startsWith(`${year}-07`))
          .map((b) => {
            const listing = getListing(b.listingId);
            const renter = getUser(b.renterId);
            const meta = bookingStatusMeta[b.status];
            return (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{listing?.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {renter?.name} · {formatDate(b.startDate)} – {formatDate(b.endDate)}
                  </p>
                </div>
                <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded", color)} />
      {label}
    </span>
  );
}
