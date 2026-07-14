"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Package, PackagePlus, Pencil, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { listings, getCategory } from "@/lib/mock/data";
import { thb } from "@/lib/format";
import {
  EmptyState,
  PlaceholderImage,
  Rating,
  StatusChip,
} from "@/components/chao/primitives";
import type { ListingStatus } from "@/lib/mock/types";

const STATUS_META: Record<
  ListingStatus,
  { label: string; tone: "success" | "warning" | "muted" }
> = {
  available: { label: "เปิดให้เช่า", tone: "success" },
  booked: { label: "ถูกจองแล้ว", tone: "warning" },
  closed: { label: "ปิดประกาศ", tone: "muted" },
};

export default function LenderListingsPage() {
  const { userId } = useDemo();
  const initial = listings.filter((l) => l.ownerId === userId);
  const [items, setItems] = useState(initial);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === "closed" ? "available" : "closed",
            }
          : l,
      ),
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">รายการสินค้าของฉัน</h1>
        <Link
          href="/lender/listings/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <PackagePlus className="h-4 w-4" /> เพิ่มสินค้าใหม่
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Package}
            title="ยังไม่มีสินค้าให้เช่า"
            description="เริ่มปล่อยเช่าอุปกรณ์ชิ้นแรกของคุณ"
            action={
              <Link href="/lender/listings/new" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                เพิ่มสินค้า
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((l) => {
            const cat = getCategory(l.categoryId);
            const meta = STATUS_META[l.status];
            return (
              <div
                key={l.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center"
              >
                <PlaceholderImage
                  seed={l.imageSeeds[0]}
                  iconName={cat?.icon}
                  className="h-20 w-full sm:h-16 sm:w-16"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium">{l.title}</h3>
                    <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {thb(l.pricePerDay)}/วัน
                    </span>
                    <span>มัดจำ {thb(l.deposit)}</span>
                    <Rating value={l.rating} count={l.reviewCount} />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <IconBtn href={`/product/${l.id}`} icon={Eye} label="ดู" />
                  <IconBtn href={`/lender/listings/${l.id}/edit`} icon={Pencil} label="แก้ไข" />
                  <button
                    onClick={() => toggle(l.id)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition hover:bg-muted",
                      l.status === "closed" ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    <Power className="h-4 w-4" />
                    {l.status === "closed" ? "เปิด" : "ปิด"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IconBtn({
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
      className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition hover:bg-muted"
    >
      <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
