"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Heart,
  LogOut,
  MapPin,
  Settings,
  Star,
  Receipt,
} from "lucide-react";
import { currentUser, useDemo } from "@/lib/store";
import { listings } from "@/lib/mock/data";
import { kycMeta } from "@/lib/format";
import { Avatar, StatusChip, VerifiedBadge } from "@/components/chao/primitives";

export default function ProfilePage() {
  const router = useRouter();
  const me = currentUser();
  const { bookings, userId, savedCount } = useDemo();
  const myRentals = bookings.filter((b) => b.renterId === userId).length;
  const myListings = listings.filter((l) => l.ownerId === userId).length;
  const kyc = kycMeta[me.kyc];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">โปรไฟล์</h1>

      {/* Header card */}
      <div className="mt-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar seed={me.avatarColor} initials={me.initials} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold">{me.name}</h2>
              <VerifiedBadge kyc={me.kyc} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {me.rating.toFixed(1)} ({me.reviewCount})
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {me.location}
              </span>
              <span>เข้าร่วมปี {me.joinedYear}</span>
            </div>
          </div>
        </div>
        {me.bio && <p className="mt-4 text-sm text-muted-foreground">{me.bio}</p>}
      </div>

      {/* KYC status */}
      <Link
        href="/kyc"
        className="mt-4 flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition hover:border-accent"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium">การยืนยันตัวตน</p>
            <p className="text-sm text-muted-foreground">จัดการข้อมูล KYC ของคุณ</p>
          </div>
        </div>
        <StatusChip tone={kyc.tone === "muted" ? "muted" : kyc.tone}>
          {kyc.label}
        </StatusChip>
      </Link>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatBox icon={Receipt} label="รายการเช่า" value={myRentals} href="/renter/bookings" />
        <StatBox icon={Heart} label="ที่บันทึกไว้" value={savedCount} href="/saved" />
        <StatBox icon={BadgeCheck} label="สินค้าปล่อยเช่า" value={myListings} href="/lender/listings" />
      </div>

      {/* Menu */}
      <div className="mt-4 divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
        <MenuLink href="/settings" icon={Settings} label="ตั้งค่า" />
        <MenuLink href="/kyc" icon={BadgeCheck} label="ยืนยันตัวตน" />
        <MenuLink href="/saved" icon={Heart} label="สินค้าที่บันทึก" />
      </div>

      <button
        onClick={() => router.push("/login")}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-danger/40 text-sm font-semibold text-danger transition hover:bg-danger/5"
      >
        <LogOut className="h-4 w-4" /> ออกจากระบบ
      </button>
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center rounded-xl border bg-card p-4 text-center shadow-sm transition hover:border-accent"
    >
      <Icon className="h-5 w-5 text-info" />
      <span className="mt-1.5 text-xl font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </Link>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 transition hover:bg-muted/40">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
