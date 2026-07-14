import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  PackagePlus,
  Package,
  Inbox,
  ShieldAlert,
  Images,
  Receipt,
  Heart,
} from "lucide-react";
import type { Persona } from "@/lib/store";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const personaNav: Record<Persona, NavItem[]> = {
  renter: [
    { href: "/renter/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/renter/bookings", label: "รายการเช่าของฉัน", icon: Receipt },
    { href: "/renter/chat", label: "แชท", icon: MessageSquare },
    { href: "/saved", label: "สินค้าที่บันทึก", icon: Heart },
  ],
  lender: [
    { href: "/lender/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/lender/listings", label: "รายการสินค้า", icon: Package },
    { href: "/lender/listings/new", label: "เพิ่มสินค้า", icon: PackagePlus },
    { href: "/lender/requests", label: "คำขอเช่า", icon: Inbox },
    { href: "/lender/calendar", label: "ตารางจอง", icon: CalendarDays },
  ],
  admin: [
    { href: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/admin/rentals", label: "รายการเช่า", icon: ListChecks },
    { href: "/admin/disputes", label: "ข้อพิพาท", icon: ShieldAlert },
    { href: "/admin/evidence", label: "ตรวจหลักฐาน", icon: Images },
  ],
};

export const personaLabel: Record<Persona, string> = {
  renter: "ผู้เช่า",
  lender: "ผู้ให้เช่า",
  admin: "แอดมิน",
};

export const personaHome: Record<Persona, string> = {
  renter: "/renter/dashboard",
  lender: "/lender/dashboard",
  admin: "/admin/dashboard",
};
