import type { Category } from "./mock/types";

// Category taxonomy is presentational (name + lucide icon) and is not part of
// the SQL schema — `item.category` stores one of these slugs. `count` is a
// display-only figure; real per-category counts come from the DB when needed.
export const CATEGORY_META: Record<
  string,
  { name: string; icon: string; count: number }
> = {
  camera: { name: "กล้องและอุปกรณ์ถ่ายภาพ", icon: "camera", count: 128 },
  event: { name: "อุปกรณ์อีเวนต์", icon: "party-popper", count: 76 },
  audio: { name: "เครื่องเสียง", icon: "speaker", count: 54 },
  camping: { name: "อุปกรณ์แคมป์ปิ้ง", icon: "tent", count: 93 },
  tools: { name: "เครื่องมือช่าง", icon: "wrench", count: 61 },
  sport: { name: "อุปกรณ์กีฬา", icon: "dumbbell", count: 48 },
  live: { name: "อุปกรณ์ไลฟ์สด", icon: "video", count: 39 },
  travel: { name: "อุปกรณ์เดินทาง", icon: "luggage", count: 42 },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_META);

export const categories: Category[] = CATEGORY_SLUGS.map((slug, i) => ({
  id: `c${i + 1}`,
  slug,
  name: CATEGORY_META[slug].name,
  icon: CATEGORY_META[slug].icon,
  count: CATEGORY_META[slug].count,
}));

export const categoryIcon = (slug: string | null | undefined) =>
  (slug && CATEGORY_META[slug]?.icon) || "camera";

export const categoryName = (slug: string | null | undefined) =>
  (slug && CATEGORY_META[slug]?.name) || "อื่นๆ";
