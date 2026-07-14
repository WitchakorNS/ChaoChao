"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ImagePlus,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { getListing } from "@/lib/mock/data";
import { evidenceTypeLabel } from "@/lib/format";
import { PlaceholderImage } from "@/components/chao/primitives";
import type { EvidenceType } from "@/lib/mock/types";

const TYPES: EvidenceType[] = [
  "before_pickup",
  "after_pickup",
  "before_return",
  "after_return",
];

export default function EvidencePage() {
  const { id } = useParams<{ id: string }>();
  const { bookings } = useDemo();
  const booking = bookings.find((b) => b.id === id);
  const listing = booking ? getListing(booking.listingId) : undefined;

  const [type, setType] = useState<EvidenceType>("before_pickup");
  const [photos, setPhotos] = useState(1);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const now = new Date().toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (done) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h2 className="mt-3 text-xl font-semibold">อัปโหลดหลักฐานสำเร็จ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            บันทึกหลักฐาน “{evidenceTypeLabel[type]}” เรียบร้อยแล้ว
          </p>
          <Link
            href={`/renter/bookings/${id}`}
            className="mt-5 flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            กลับไปรายการเช่า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/renter/bookings/${id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">อัปโหลดหลักฐาน</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {listing?.title} · {booking?.id}
      </p>

      <div className="mt-5 space-y-5 rounded-xl border bg-card p-5 shadow-sm">
        {/* Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">ประเภทหลักฐาน</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                  type === t
                    ? "border-accent bg-accent/10 ring-1 ring-accent"
                    : "hover:bg-muted",
                )}
              >
                {evidenceTypeLabel[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="mb-2 block text-sm font-medium">รูปภาพ</label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: photos }).map((_, i) => (
              <PlaceholderImage
                key={i}
                seed={`ev${id}${type}${i}`}
                iconName="camera"
                className="h-20 w-20"
                rounded="rounded-lg"
              />
            ))}
            <button
              onClick={() => setPhotos((p) => Math.min(p + 1, 6))}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition hover:bg-muted"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px]">เพิ่มรูป</span>
            </button>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">หมายเหตุ</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="อธิบายสภาพสินค้า เช่น ไม่มีรอย ใช้งานได้ปกติ..."
            className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Mock meta */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> เวลา: {now}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> ตำแหน่ง: กรุงเทพฯ (จำลอง)
          </span>
        </div>
      </div>

      <button
        onClick={() => setDone(true)}
        className="mt-4 h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        ยืนยันการอัปโหลด
      </button>
    </div>
  );
}
