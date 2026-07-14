"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, listings } from "@/lib/mock/data";
import { ProductCard } from "./product-card";
import { CategoryIcon, EmptyState } from "./primitives";
import { PackageSearch } from "lucide-react";

type SortKey = "rating" | "price_asc" | "price_desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "คะแนนสูงสุด" },
  { key: "price_asc", label: "ราคาต่ำสุด" },
  { key: "price_desc", label: "ราคาแพงสุด" },
];

const PRICE_MAX = 1000;

export function ExploreClient() {
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("category") ?? "";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCat);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("rating");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const catObj = categories.find((c) => c.slug === category);

  const results = useMemo(() => {
    let r = listings.filter((l) => {
      if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (catObj && l.categoryId !== catObj.id) return false;
      if (l.pricePerDay > maxPrice) return false;
      if (l.rating < minRating) return false;
      if (availableOnly && l.status !== "available") return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sort === "price_asc") return a.pricePerDay - b.pricePerDay;
      if (sort === "price_desc") return b.pricePerDay - a.pricePerDay;
      return b.rating - a.rating;
    });
    return r;
  }, [q, catObj, maxPrice, minRating, availableOnly, sort]);

  const resetFilters = () => {
    setCategory("");
    setMaxPrice(PRICE_MAX);
    setMinRating(0);
    setAvailableOnly(false);
  };

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold">หมวดหมู่</h3>
        <div className="space-y-1">
          <button
            onClick={() => setCategory("")}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
              !category ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            ทั้งหมด
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition",
                category === c.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <CategoryIcon name={c.icon} className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          ราคาสูงสุด/วัน:{" "}
          <span className="text-info">฿{maxPrice.toLocaleString()}</span>
        </h3>
        <input
          type="range"
          min={100}
          max={PRICE_MAX}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[hsl(var(--brand-action-strong))]"
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">คะแนนรีวิวขั้นต่ำ</h3>
        <div className="flex gap-1.5">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                minRating === r
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {r === 0 ? (
                "ทั้งหมด"
              ) : (
                <>
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {r}+
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">วันที่ว่าง</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="h-4 w-4 rounded accent-[hsl(var(--brand-action-strong))]"
          />
          แสดงเฉพาะที่พร้อมให้เช่า
        </label>
      </div>

      <button
        onClick={resetFilters}
        className="text-sm font-medium text-info hover:underline"
      >
        ล้างตัวกรอง
      </button>
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">ค้นหาอุปกรณ์</h1>
        <div className="mt-3 flex items-center gap-2 rounded-full border bg-background p-1.5 shadow-sm">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า หรือ keyword..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
          />
          <button
            onClick={() => setShowFilters(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            ตัวกรอง
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border bg-card p-4 shadow-sm">
            {FilterPanel}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              พบ <span className="font-semibold text-foreground">{results.length}</span>{" "}
              รายการ
              {catObj && <> ในหมวด “{catObj.name}”</>}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <span className="hidden text-muted-foreground sm:inline">เรียงตาม:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden rounded-lg border p-0.5 sm:flex">
                <button
                  onClick={() => setLayout("grid")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    layout === "grid" ? "bg-muted" : "text-muted-foreground",
                  )}
                  aria-label="แบบกริด"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayout("list")}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    layout === "list" ? "bg-muted" : "text-muted-foreground",
                  )}
                  aria-label="แบบรายการ"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข"
              description="ลองปรับตัวกรองหรือคำค้นหาใหม่อีกครั้ง"
            />
          ) : layout === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {results.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((l) => (
                <ProductCard key={l.id} listing={l} layout="list" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">ตัวกรอง</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              ดู {results.length} รายการ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
