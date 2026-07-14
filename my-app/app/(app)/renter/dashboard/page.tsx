"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Receipt,
  Search,
  Wallet,
} from "lucide-react";
import { currentUser, useDemo } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { StatCard } from "@/components/chao/stat-card";
import { BookingCard } from "@/components/chao/booking-card";
import { EmptyState, SectionHeading, VerifiedBadge } from "@/components/chao/primitives";

export default function RenterDashboard() {
  const { bookings, notifications, userId } = useDemo();
  const me = currentUser();
  const mine = bookings.filter((b) => b.renterId === userId);

  const active = mine.filter((b) =>
    ["confirmed", "delivered", "due_soon"].includes(b.status),
  );
  const awaitingPayment = mine.filter((b) => b.status === "awaiting_payment");
  const dueSoon = mine.filter((b) => b.status === "due_soon");
  const completed = mine.filter((b) => b.status === "completed");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            สวัสดี, {me.name} 👋
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            ภาพรวมการเช่าของคุณ <VerifiedBadge kyc={me.kyc} />
          </div>
        </div>
        <Link
          href="/explore"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <Search className="h-4 w-4" /> ค้นหาอุปกรณ์
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="กำลังเช่าอยู่" value={active.length} icon={Receipt} tone="info" href="/renter/bookings" />
        <StatCard label="รอชำระเงิน" value={awaitingPayment.length} icon={Wallet} tone="warning" href="/renter/bookings" />
        <StatCard label="ใกล้กำหนดคืน" value={dueSoon.length} icon={CalendarClock} tone="warning" href="/renter/bookings" />
        <StatCard label="เสร็จสมบูรณ์" value={completed.length} icon={CheckCircle2} tone="success" href="/renter/bookings" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction href="/explore" icon={Search} label="ค้นหาอุปกรณ์" />
        <QuickAction href="/renter/bookings" icon={Receipt} label="รายการเช่า" />
        <QuickAction href="/renter/chat" icon={MessageSquare} label="แชท" />
      </div>

      {/* Payment reminder */}
      {awaitingPayment.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-5 w-5 text-warning" />
              <span className="font-medium">
                คุณมี {awaitingPayment.length} รายการที่รอชำระเงิน
              </span>
            </div>
            <Link
              href={`/renter/payment/${awaitingPayment[0].id}`}
              className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              ชำระเงินตอนนี้
            </Link>
          </div>
        </div>
      )}

      {/* Current rentals */}
      <section>
        <SectionHeading
          title="รายการเช่าปัจจุบัน"
          action={
            <Link href="/renter/bookings" className="text-sm font-medium text-info hover:underline">
              ดูทั้งหมด
            </Link>
          }
        />
        {active.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="ยังไม่มีรายการเช่าที่กำลังดำเนินอยู่"
            description="เริ่มค้นหาอุปกรณ์ที่คุณอยากเช่าได้เลย"
            action={
              <Link href="/explore" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                ค้นหาอุปกรณ์
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {active.map((b) => (
              <BookingCard key={b.id} booking={b} counterpartyRole="lender" />
            ))}
          </div>
        )}
      </section>

      {/* Notifications preview */}
      <section>
        <SectionHeading
          title="การแจ้งเตือนล่าสุด"
          action={
            <Link href="/notifications" className="text-sm font-medium text-info hover:underline">
              ดูทั้งหมด
            </Link>
          }
        />
        <div className="divide-y rounded-xl border bg-card shadow-sm">
          {notifications.slice(0, 4).map((n) => (
            <Link
              key={n.id}
              href={n.href ?? "/notifications"}
              className="flex items-start gap-3 p-4 transition hover:bg-muted/40"
            >
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info" />}
              <div className={n.read ? "ml-5" : ""}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(n.date)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-medium sm:text-sm">{label}</span>
    </Link>
  );
}
