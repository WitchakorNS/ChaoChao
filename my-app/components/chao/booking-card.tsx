import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { bookingStatusMeta, formatDate, thb } from "@/lib/format";
import { getListing, getCategory, getUser } from "@/lib/mock/data";
import type { Booking } from "@/lib/mock/types";
import { PlaceholderImage, StatusChip } from "./primitives";

export function BookingCard({
  booking,
  href,
  counterpartyRole = "lender",
}: {
  booking: Booking;
  href?: string;
  counterpartyRole?: "lender" | "renter";
}) {
  const listing = getListing(booking.listingId);
  const category = listing ? getCategory(listing.categoryId) : undefined;
  const meta = bookingStatusMeta[booking.status];
  const counterparty = getUser(
    counterpartyRole === "lender" ? booking.lenderId : booking.renterId,
  );
  const link =
    href ??
    (counterpartyRole === "lender"
      ? `/renter/bookings/${booking.id}`
      : `/lender/requests`);

  return (
    <Link
      href={link}
      className="group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition hover:border-accent hover:shadow-md"
    >
      <PlaceholderImage
        seed={listing?.imageSeeds[0] ?? booking.id}
        iconName={category?.icon}
        className="h-16 w-16 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {booking.id}
          </span>
          <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
        </div>
        <h3 className="mt-0.5 line-clamp-1 font-medium">{listing?.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
          </span>
          {counterparty && (
            <span>
              {counterpartyRole === "lender" ? "ผู้ให้เช่า" : "ผู้เช่า"}:{" "}
              {counterparty.name}
            </span>
          )}
          <span className="font-medium text-foreground">
            {thb(booking.total)}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
    </Link>
  );
}
