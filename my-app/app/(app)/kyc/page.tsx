"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  IdCard,
  Loader2,
  ScanFace,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusChip } from "@/components/chao/primitives";

type Status = "unverified" | "pending" | "verified";

export default function KycPage() {
  const [idCard, setIdCard] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [status, setStatus] = useState<Status>("unverified");

  const submit = () => {
    setStatus("pending");
    setTimeout(() => setStatus("verified"), 1800);
  };

  const statusChip =
    status === "verified" ? (
      <StatusChip tone="success">ยืนยันแล้ว</StatusChip>
    ) : status === "pending" ? (
      <StatusChip tone="warning">รอตรวจสอบ</StatusChip>
    ) : (
      <StatusChip tone="muted">ยังไม่ยืนยัน</StatusChip>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">ยืนยันตัวตน (KYC)</h1>
        {statusChip}
      </div>
      <p className="mt-2 flex items-start gap-2 rounded-xl border bg-info/5 p-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        การยืนยันตัวตนช่วยเพิ่มความน่าเชื่อถือ ทำให้เช่าและปล่อยเช่าได้ปลอดภัยยิ่งขึ้น
        (โหมดเดโม ไม่มีการส่งข้อมูลจริง)
      </p>

      {status === "verified" ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
          <BadgeCheck className="h-14 w-14 text-success" />
          <h2 className="mt-3 text-xl font-semibold">ยืนยันตัวตนสำเร็จ</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            บัญชีของคุณได้รับสัญลักษณ์ “ยืนยันตัวตนแล้ว” เรียบร้อย
          </p>
          <Link
            href="/renter/dashboard"
            className="mt-5 flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            ไปที่แดชบอร์ด
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <UploadBox
            icon={IdCard}
            title="อัปโหลดบัตรประชาชน"
            desc="ถ่ายรูปบัตรให้ชัดเจน เห็นข้อมูลครบถ้วน"
            done={idCard}
            disabled={status === "pending"}
            onUpload={() => setIdCard(true)}
          />
          <UploadBox
            icon={ScanFace}
            title="อัปโหลดรูปตัวเอง (Selfie)"
            desc="ถ่ายรูปหน้าตรงเพื่อเปรียบเทียบกับบัตร"
            done={selfie}
            disabled={status === "pending"}
            onUpload={() => setSelfie(true)}
          />

          <button
            onClick={submit}
            disabled={!idCard || !selfie || status === "pending"}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition",
              idCard && selfie && status !== "pending"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {status === "pending" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "pending" ? "กำลังตรวจสอบ..." : "ส่งข้อมูลเพื่อยืนยันตัวตน"}
          </button>
        </div>
      )}
    </div>
  );
}

function UploadBox({
  icon: Icon,
  title,
  desc,
  done,
  disabled,
  onUpload,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  done: boolean;
  disabled: boolean;
  onUpload: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 transition",
        done ? "border-success/40 bg-success/5" : "bg-card",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {done ? <BadgeCheck className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{done ? "อัปโหลดแล้ว" : desc}</p>
      </div>
      <button
        onClick={onUpload}
        disabled={disabled || done}
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition",
          done ? "text-success" : "hover:bg-muted",
          disabled && "opacity-50",
        )}
      >
        <UploadCloud className="h-4 w-4" />
        {done ? "สำเร็จ" : "อัปโหลด"}
      </button>
    </div>
  );
}
