import type { BookingStatus, EvidenceType, KycStatus } from "./mock/types";

export const thb = (n: number) =>
  `฿${n.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`;

export const formatDate = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Booking status -> Thai label + semantic tone
export const bookingStatusMeta: Record<
  BookingStatus,
  { label: string; tone: "success" | "warning" | "info" | "danger" | "muted" }
> = {
  pending: { label: "รออนุมัติ", tone: "warning" },
  awaiting_payment: { label: "รอชำระเงิน", tone: "warning" },
  confirmed: { label: "ยืนยันการเช่า", tone: "success" },
  delivered: { label: "ส่งมอบแล้ว", tone: "info" },
  due_soon: { label: "ใกล้กำหนดคืน", tone: "warning" },
  returned: { label: "คืนเรียบร้อย", tone: "info" },
  completed: { label: "เสร็จสมบูรณ์", tone: "success" },
  cancelled: { label: "ยกเลิก", tone: "danger" },
  disputed: { label: "มีข้อพิพาท", tone: "danger" },
};

export const kycMeta: Record<
  KycStatus,
  { label: string; tone: "success" | "warning" | "muted" }
> = {
  unverified: { label: "ยังไม่ยืนยันตัวตน", tone: "muted" },
  pending: { label: "รอตรวจสอบ", tone: "warning" },
  verified: { label: "ยืนยันตัวตนแล้ว", tone: "success" },
};

export const evidenceTypeLabel: Record<EvidenceType, string> = {
  before_pickup: "ก่อนรับสินค้า",
  after_pickup: "หลังรับสินค้า",
  before_return: "ก่อนคืนสินค้า",
  after_return: "หลังคืนสินค้า",
};

// Deterministic gradient from a seed string (for placeholder images/avatars)
export function seedGradient(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const hue = Math.abs(h) % 360;
  const hue2 = (hue + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue} 55% 62%), hsl(${hue2} 60% 45%))`;
}
