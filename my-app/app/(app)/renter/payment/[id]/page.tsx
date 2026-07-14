"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useDemo } from "@/lib/store";
import { getListing, getUser, getCategory } from "@/lib/mock/data";
import { thb } from "@/lib/format";
import { PlaceholderImage, StatusChip } from "@/components/chao/primitives";

type Phase = "idle" | "checking" | "success";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { bookings, payBooking } = useDemo();
  const [phase, setPhase] = useState<Phase>("idle");
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="py-20 text-center text-muted-foreground">ไม่พบรายการชำระเงิน</div>
    );
  }
  const listing = getListing(booking.listingId);
  const category = listing ? getCategory(listing.categoryId) : undefined;
  const lender = getUser(booking.lenderId);

  const pay = () => {
    setPhase("checking");
    setTimeout(() => {
      payBooking(booking.id);
      setPhase("success");
    }, 1600);
  };

  const chip =
    phase === "success" ? (
      <StatusChip tone="success">ชำระเงินสำเร็จ</StatusChip>
    ) : phase === "checking" ? (
      <StatusChip tone="info">กำลังตรวจสอบ</StatusChip>
    ) : (
      <StatusChip tone="warning">รอชำระเงิน</StatusChip>
    );

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/renter/bookings/${booking.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> กลับ
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">ชำระเงิน</h1>
        {chip}
      </div>

      {/* Item */}
      <div className="mt-4 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">
        <PlaceholderImage
          seed={listing?.imageSeeds[0] ?? booking.id}
          iconName={category?.icon}
          className="h-14 w-14"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{listing?.title}</p>
          <p className="text-xs text-muted-foreground">
            ผู้ให้เช่า: {lender?.name} · {booking.days} วัน
          </p>
        </div>
      </div>

      {phase === "success" ? (
        <div className="mt-5 flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h2 className="mt-3 text-xl font-semibold">ชำระเงินสำเร็จ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            การเช่าได้รับการยืนยันแล้ว ยอดชำระ {thb(booking.total)}
          </p>
          <Link
            href={`/renter/bookings/${booking.id}`}
            className="mt-5 flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            ดูรายละเอียดการเช่า
          </Link>
        </div>
      ) : (
        <>
          {/* Breakdown */}
          <div className="mt-5 rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              รายละเอียดการชำระเงิน
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label={`ค่าเช่า ${booking.days} วัน`} value={thb(booking.rentalTotal)} />
              <Row label="ค่ามัดจำ (คืนเมื่อจบการเช่า)" value={thb(booking.deposit)} />
              <Row label="ค่าธรรมเนียมแพลตฟอร์ม" value={thb(booking.serviceFee)} />
              <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                <span>ยอดรวมทั้งสิ้น</span>
                <span className="text-primary">{thb(booking.total)}</span>
              </div>
            </dl>
          </div>

          {/* Mock QR */}
          <div className="mt-4 flex flex-col items-center rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium">สแกน QR เพื่อชำระเงิน</p>
            <div className="mt-3 flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed bg-muted/40">
              <QrCode className="h-24 w-24 text-primary/70" />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> ชำระเงินอย่างปลอดภัย
              (โหมดเดโม)
            </p>
          </div>

          <button
            onClick={pay}
            disabled={phase === "checking"}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
          >
            {phase === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
            {phase === "checking"
              ? "กำลังตรวจสอบการชำระเงิน..."
              : `จำลองการชำระเงินสำเร็จ · ${thb(booking.total)}`}
          </button>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
