"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/mock/data";
import { PlaceholderImage } from "./primitives";
import type { Listing } from "@/lib/mock/types";

export function ListingForm({ existing }: { existing?: Listing }) {
  const router = useRouter();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [price, setPrice] = useState(existing ? String(existing.pricePerDay) : "");
  const [deposit, setDeposit] = useState(existing ? String(existing.deposit) : "");
  const [availableFrom, setAvailableFrom] = useState(
    existing?.availableFrom ?? "2026-07-15",
  );
  const [pickup, setPickup] = useState(existing?.location ?? "");
  const [dropoff, setDropoff] = useState(existing?.location ?? "");
  const [terms, setTerms] = useState(existing?.terms.join("\n") ?? "");
  const [photos, setPhotos] = useState(existing?.imageSeeds.length ?? 0);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState<null | "draft" | "published">(null);

  const errors = {
    title: !title.trim(),
    categoryId: !categoryId,
    price: !price || Number(price) <= 0,
    deposit: deposit === "" || Number(deposit) < 0,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = (kind: "draft" | "published") => {
    setTouched(true);
    if (kind === "published" && hasErrors) return;
    setSaved(kind);
  };

  if (saved) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h2 className="mt-3 text-xl font-semibold">
            {saved === "published" ? "เผยแพร่ประกาศแล้ว" : "บันทึกฉบับร่างแล้ว"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {saved === "published"
              ? "สินค้าของคุณพร้อมให้ผู้เช่าค้นหาแล้ว"
              : "คุณสามารถกลับมาแก้ไขและเผยแพร่ได้ภายหลัง"}
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href="/lender/listings"
              className="flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              ไปที่รายการสินค้า
            </Link>
            <button
              onClick={() => router.push("/lender/dashboard")}
              className="flex h-11 items-center rounded-full border px-5 text-sm font-semibold hover:bg-muted"
            >
              แดชบอร์ด
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {existing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        กรอกรายละเอียดอุปกรณ์ที่ต้องการปล่อยเช่า
      </p>

      <div className="mt-6 space-y-5 rounded-xl border bg-card p-5 shadow-sm">
        <Field label="ชื่ออุปกรณ์" required error={touched && errors.title}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น กล้อง Sony A7 III พร้อมเลนส์"
            className={inputCls(touched && errors.title)}
          />
        </Field>

        <Field label="หมวดหมู่" required error={touched && errors.categoryId}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls(touched && errors.categoryId)}
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="รูปภาพสินค้า">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: photos }).map((_, i) => (
              <div key={i} className="relative">
                <PlaceholderImage
                  seed={`${existing?.id ?? "new"}${i}`}
                  iconName="camera"
                  className="h-20 w-20"
                  rounded="rounded-lg"
                />
                <button
                  onClick={() => setPhotos((p) => p - 1)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-danger-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setPhotos((p) => Math.min(p + 1, 6))}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition hover:bg-muted"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px]">เพิ่มรูป</span>
            </button>
          </div>
        </Field>

        <Field label="รายละเอียด">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="อธิบายสภาพ อุปกรณ์ที่ให้มา และการใช้งาน..."
            className={inputCls(false)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ราคาเช่า/วัน (บาท)" required error={touched && errors.price}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={inputCls(touched && errors.price)}
            />
          </Field>
          <Field label="ค่ามัดจำ (บาท)" required error={touched && errors.deposit}>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              placeholder="0"
              className={inputCls(touched && errors.deposit)}
            />
          </Field>
        </div>

        <Field label="วันที่ว่างให้เช่า">
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className={inputCls(false)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="สถานที่รับสินค้า">
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="เช่น BTS อโศก"
              className={inputCls(false)}
            />
          </Field>
          <Field label="สถานที่คืนสินค้า">
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="เช่น BTS อโศก"
              className={inputCls(false)}
            />
          </Field>
        </div>

        <Field label="เงื่อนไขการเช่า (บรรทัดละ 1 ข้อ)">
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={3}
            placeholder={"คืนตามเวลาที่นัดหมาย\nระวังการกระแทก"}
            className={inputCls(false)}
          />
        </Field>
      </div>

      {touched && hasErrors && (
        <p className="mt-3 text-sm text-danger">
          กรุณากรอกข้อมูลที่จำเป็น (มีเครื่องหมาย *) ให้ครบถ้วน
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          onClick={() => submit("published")}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {existing ? "บันทึกการแก้ไข" : "เผยแพร่ประกาศ"}
        </button>
        <button
          onClick={() => submit("draft")}
          className="flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold transition hover:bg-muted"
        >
          <Save className="h-4 w-4" /> บันทึกฉบับร่าง
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">จำเป็นต้องกรอกข้อมูลนี้</p>}
    </div>
  );
}

function inputCls(error?: boolean) {
  return cn(
    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-ring/30",
    error && "border-danger focus:border-danger focus:ring-danger/20",
  );
}
