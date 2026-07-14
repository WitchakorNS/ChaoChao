"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ImagePlus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { getListing, getUser, getCategory } from "@/lib/mock/data";
import { PlaceholderImage } from "@/components/chao/primitives";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { bookings } = useDemo();
  const booking = bookings.find((b) => b.id === id);
  const [productRating, setProductRating] = useState(5);
  const [lenderRating, setLenderRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState(0);
  const [done, setDone] = useState(false);

  if (!booking) {
    return <div className="py-20 text-center text-muted-foreground">ไม่พบรายการเช่า</div>;
  }
  const listing = getListing(booking.listingId);
  const category = listing ? getCategory(listing.categoryId) : undefined;
  const lender = getUser(booking.lenderId);

  if (done) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h2 className="mt-3 text-xl font-semibold">ขอบคุณสำหรับรีวิว</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            รีวิวของคุณช่วยให้ผู้ใช้คนอื่นตัดสินใจได้ดีขึ้น
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href={`/product/${listing?.id}`}
              className="flex h-11 items-center rounded-full border px-5 text-sm font-semibold hover:bg-muted"
            >
              ดูสินค้า
            </Link>
            <Link
              href="/renter/bookings"
              className="flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              กลับไปรายการเช่า
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/renter/bookings/${booking.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">รีวิวการเช่า</h1>

      <div className="mt-4 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <PlaceholderImage
          seed={listing?.imageSeeds[0] ?? booking.id}
          iconName={category?.icon}
          className="h-14 w-14"
        />
        <div>
          <p className="font-medium">{listing?.title}</p>
          <p className="text-xs text-muted-foreground">ผู้ให้เช่า: {lender?.name}</p>
        </div>
      </div>

      <div className="mt-5 space-y-5 rounded-xl border bg-card p-5 shadow-sm">
        <StarInput label="ให้คะแนนสินค้า" value={productRating} onChange={setProductRating} />
        <StarInput label="ให้คะแนนผู้ให้เช่า" value={lenderRating} onChange={setLenderRating} />

        <div>
          <label className="mb-1.5 block text-sm font-medium">ความคิดเห็น</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="เล่าประสบการณ์การเช่าของคุณ..."
            className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">แนบรูปภาพ (ไม่บังคับ)</label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: photos }).map((_, i) => (
              <PlaceholderImage key={i} seed={`rvp${id}${i}`} className="h-16 w-16" rounded="rounded-lg" />
            ))}
            <button
              onClick={() => setPhotos((p) => Math.min(p + 1, 4))}
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition hover:bg-muted"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[10px]">เพิ่มรูป</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setDone(true)}
        className="mt-4 h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        ส่งรีวิว
      </button>
    </div>
  );
}

function StarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} ดาว`}
          >
            <Star
              className={cn(
                "h-8 w-8 transition",
                n <= value
                  ? "fill-warning text-warning"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
