"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useDemo } from "@/lib/store";
import { listings } from "@/lib/mock/data";
import { ProductCard } from "@/components/chao/product-card";
import { EmptyState } from "@/components/chao/primitives";

export default function SavedPage() {
  const { saved } = useDemo();
  const items = listings.filter((l) => saved.includes(l.id));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">สินค้าที่บันทึก</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        อุปกรณ์ที่คุณสนใจ ({items.length} รายการ)
      </p>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title="ยังไม่มีสินค้าที่บันทึก"
            description="กดรูปหัวใจบนสินค้าที่คุณสนใจเพื่อบันทึกไว้ดูภายหลัง"
            action={
              <Link href="/explore" className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
                ค้นหาอุปกรณ์
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((l) => (
            <ProductCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
