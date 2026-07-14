import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessagesSquare,
  Search,
  ShieldCheck,
  Star,
  Wallet,
  Camera as CameraIcon,
} from "lucide-react";
import { categories, listings } from "@/lib/mock/data";
import { ProductCard } from "@/components/chao/product-card";
import { CategoryIcon, SectionHeading } from "@/components/chao/primitives";
import { HomeSearch } from "@/components/chao/home-search";

const steps = [
  { n: 1, title: "ค้นหาอุปกรณ์", desc: "เลือกอุปกรณ์ที่ต้องการจากผู้ให้เช่าที่ยืนยันตัวตน" },
  { n: 2, title: "ส่งคำขอเช่า", desc: "เลือกวันเช่า–คืน แล้วส่งคำขอไปยังผู้ให้เช่า" },
  { n: 3, title: "ชำระเงิน", desc: "ชำระค่าเช่าและมัดจำอย่างปลอดภัยผ่านระบบ" },
  { n: 4, title: "รับและคืนสินค้า", desc: "ถ่ายรูปหลักฐานก่อน–หลัง และรีวิวเมื่อจบการเช่า" },
];

const trust = [
  { icon: BadgeCheck, title: "ยืนยันตัวตน", desc: "ผู้ใช้ผ่านการยืนยัน KYC" },
  { icon: Wallet, title: "มีเงินมัดจำ", desc: "คุ้มครองทั้งสองฝ่าย" },
  { icon: ShieldCheck, title: "หลักฐานรูปภาพ", desc: "บันทึกสภาพก่อน–หลัง" },
  { icon: Star, title: "มีรีวิว", desc: "ให้คะแนนหลังจบการเช่า" },
  { icon: MessagesSquare, title: "แชทในแอป", desc: "คุยกับคู่สัญญาได้ทันที" },
];

export default function HomePage() {
  const featured = listings.filter((l) => l.featured);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="chao-gradient relative overflow-hidden rounded-3xl border p-6 sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-info" />
            แพลตฟอร์มเช่าอุปกรณ์ที่คุณวางใจได้
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            เช่าอุปกรณ์ที่ต้องการ
            <br />
            <span className="text-primary">ปล่อยเช่าของที่มี</span> ได้ในที่เดียว
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            CHAOCHAO เชื่อมต่อผู้เช่าและผู้ให้เช่าอุปกรณ์อย่างปลอดภัย ยืนยันตัวตน
            มีมัดจำ หลักฐานรูปภาพ และรีวิวครบทุกขั้นตอน
          </p>

          <div className="mt-6">
            <HomeSearch />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              ค้นหาอุปกรณ์
            </Link>
            <Link
              href="/lender/listings/new"
              className="inline-flex h-11 items-center gap-2 rounded-full border bg-background px-5 text-sm font-semibold shadow-sm transition hover:bg-muted"
            >
              <CameraIcon className="h-4 w-4" />
              ปล่อยเช่าอุปกรณ์
            </Link>
          </div>
        </div>
      </section>

      {/* Popular categories */}
      <section>
        <SectionHeading
          title="หมวดหมู่ยอดนิยม"
          action={
            <Link
              href="/explore"
              className="inline-flex items-center gap-1 text-sm font-medium text-info hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/explore?category=${c.slug}`}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-primary transition group-hover:bg-accent/25">
                <CategoryIcon name={c.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {c.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {c.count} รายการ
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <SectionHeading
          title="อุปกรณ์แนะนำ"
          action={
            <Link
              href="/explore"
              className="inline-flex items-center gap-1 text-sm font-medium text-info hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((l) => (
            <ProductCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-2xl border bg-muted/30 p-6 sm:p-8">
        <SectionHeading title="ใช้งานง่ายใน 4 ขั้นตอน" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border bg-card p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust features */}
      <section>
        <SectionHeading title="ทำไมต้อง CHAOCHAO" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {trust.map((t) => (
            <div
              key={t.title}
              className="flex flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-info/10 text-info">
                <t.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
