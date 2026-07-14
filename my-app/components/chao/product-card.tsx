"use client";

import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { thb } from "@/lib/format";
import { getCategory, getUser } from "@/lib/mock/data";
import { useDemo } from "@/lib/store";
import type { Listing } from "@/lib/mock/types";
import { PlaceholderImage, Rating, StatusChip } from "./primitives";

export function ProductCard({
  listing,
  layout = "grid",
}: {
  listing: Listing;
  layout?: "grid" | "list";
}) {
  const { isSaved, toggleSaved } = useDemo();
  const category = getCategory(listing.categoryId);
  const owner = getUser(listing.ownerId);
  const saved = isSaved(listing.id);

  const statusChip =
    listing.status === "available" ? (
      <StatusChip tone="success">พร้อมให้เช่า</StatusChip>
    ) : listing.status === "booked" ? (
      <StatusChip tone="warning">จองแล้ว</StatusChip>
    ) : (
      <StatusChip tone="muted">ปิดประกาศ</StatusChip>
    );

  const SaveButton = (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleSaved(listing.id);
      }}
      aria-label="บันทึกสินค้า"
      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
    >
      <Heart
        className={cn("h-4 w-4", saved && "fill-danger text-danger")}
      />
    </button>
  );

  if (layout === "list") {
    return (
      <Link
        href={`/product/${listing.id}`}
        className="group flex gap-3 rounded-xl border bg-card p-3 shadow-sm transition hover:border-accent hover:shadow-md"
      >
        <div className="relative">
          <PlaceholderImage
            seed={listing.imageSeeds[0]}
            iconName={category?.icon}
            className="h-24 w-24 shrink-0"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-medium leading-snug">
              {listing.title}
            </h3>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Rating value={listing.rating} count={listing.reviewCount} />
            {statusChip}
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {thb(listing.pricePerDay)}
            </span>
            <span className="text-xs text-muted-foreground">/ วัน</span>
            <span className="ml-auto text-xs text-muted-foreground">
              มัดจำ {thb(listing.deposit)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/product/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
    >
      <div className="relative">
        <PlaceholderImage
          seed={listing.imageSeeds[0]}
          iconName={category?.icon}
          className="aspect-[4/3] w-full"
          rounded="rounded-none"
        />
        {SaveButton}
        <div className="absolute bottom-2 left-2">{statusChip}</div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-medium leading-snug">
          {listing.title}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Rating value={listing.rating} count={listing.reviewCount} />
          {owner?.kyc === "verified" && (
            <StatusChip tone="info" dot={false} className="px-2">
              ยืนยันตัวตน
            </StatusChip>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-1 border-t pt-2">
          <span className="text-lg font-bold text-primary">
            {thb(listing.pricePerDay)}
          </span>
          <span className="text-xs text-muted-foreground">/ วัน</span>
          <span className="ml-auto text-[11px] text-muted-foreground">
            มัดจำ {thb(listing.deposit)}
          </span>
        </div>
      </div>
    </Link>
  );
}
