"use client";

import Link from "next/link";
import {
  CalendarDays,
  Inbox,
  Package,
  PackageCheck,
  PackagePlus,
  TrendingUp,
  Truck,
} from "lucide-react";
import { currentUser, useDemo } from "@/lib/store";
import { listings } from "@/lib/mock/data";
import { getUser } from "@/lib/mock/data";
import { formatDate, thb } from "@/lib/format";
import { StatCard } from "@/components/chao/stat-card";
import { EmptyState, SectionHeading, StatusChip } from "@/components/chao/primitives";

export default function LenderDashboard() {
  const { bookings, userId } = useDemo();
  const me = currentUser();
  const myListings = listings.filter((l) => l.ownerId === userId);
  const asLender = bookings.filter((b) => b.lenderId === userId);

  const newRequests = asLender.filter((b) => b.status === "pending");
  const toDeliver = asLender.filter((b) => b.status === "confirmed");
  const toReceive = asLender.filter((b) =>
    ["delivered", "due_soon"].includes(b.status),
  );
  const income = 18450; // mock cumulative income

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">แดชบอร์ดผู้ให้เช่า</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการอุปกรณ์และคำขอเช่าของ {me.name}
          </p>
        </div>
        <Link
          href="/lender/listings/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <PackagePlus className="h-4 w-4" /> เพิ่มสินค้า
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="สินค้าที่ปล่อยเช่า" value={myListings.length} icon={Package} tone="info" href="/lender/listings" />
        <StatCard label="คำขอเช่าใหม่" value={newRequests.length} icon={Inbox} tone="warning" href="/lender/requests" />
        <StatCard label="รอส่งมอบ" value={toDeliver.length} icon={Truck} tone="info" />
        <StatCard label="รอรับคืน" value={toReceive.length} icon={PackageCheck} tone="success" />
      </div>

      {/* Income */}
      <div className="flex items-center justify-between rounded-xl border bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-sm">
        <div>
          <p className="text-sm text-primary-foreground/80">รายได้สะสม (เดโม)</p>
          <p className="mt-1 text-3xl font-bold">{thb(income)}</p>
        </div>
        <TrendingUp className="h-10 w-10 text-primary-foreground/60" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction href="/lender/listings/new" icon={PackagePlus} label="เพิ่มสินค้า" />
        <QuickAction href="/lender/requests" icon={Inbox} label="คำขอเช่า" />
        <QuickAction href="/lender/calendar" icon={CalendarDays} label="ตารางจอง" />
        <QuickAction href="/lender/listings" icon={Package} label="รายการสินค้า" />
      </div>

      {/* New requests */}
      <section>
        <SectionHeading
          title="คำขอเช่าใหม่"
          action={
            <Link href="/lender/requests" className="text-sm font-medium text-info hover:underline">
              ดูทั้งหมด
            </Link>
          }
        />
        {newRequests.length === 0 ? (
          <EmptyState icon={Inbox} title="ยังไม่มีคำขอเช่าใหม่" />
        ) : (
          <div className="space-y-3">
            {newRequests.map((b) => {
              const renter = getUser(b.renterId);
              const listing = listings.find((l) => l.id === b.listingId);
              return (
                <Link
                  key={b.id}
                  href="/lender/requests"
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm transition hover:border-accent hover:shadow-md"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{listing?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {renter?.name} · {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold">{thb(b.total)}</span>
                    <StatusChip tone="warning">รออนุมัติ</StatusChip>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
