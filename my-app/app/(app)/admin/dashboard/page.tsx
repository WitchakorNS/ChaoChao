import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  ShieldAlert,
  Users,
  ImageIcon,
} from "lucide-react";
import {
  getAdminSummary,
  getAdminRentals,
  getDisputes,
} from "@/lib/db";
import { bookingStatusMeta, formatDate, thb } from "@/lib/format";
import { StatCard } from "@/components/chao/stat-card";
import { SectionHeading, StatusChip } from "@/components/chao/primitives";

export default async function AdminDashboard() {
  const [summary, bookings, disputes] = await Promise.all([
    getAdminSummary(),
    getAdminRentals(),
    getDisputes(),
  ]);
  const openDisputes = disputes.filter((d) => d.status !== "resolved");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">แดชบอร์ดแอดมิน</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ภาพรวมระบบและรายการที่ต้องตรวจสอบ
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ผู้ใช้ทั้งหมด" value={summary.users} icon={Users} tone="info" />
        <StatCard label="รายการเช่า" value={summary.rentals} icon={ClipboardList} tone="success" href="/admin/rentals" />
        <StatCard label="ข้อพิพาท" value={summary.disputes} icon={ShieldAlert} tone="danger" href="/admin/disputes" />
        <StatCard label="รอตรวจหลักฐาน" value={summary.pendingEvidence} icon={ImageIcon} tone="warning" href="/admin/evidence" />
      </div>

      {/* Recent rentals */}
      <section>
        <SectionHeading
          title="รายการเช่าล่าสุด"
          action={
            <Link href="/admin/rentals" className="inline-flex items-center gap-1 text-sm font-medium text-info hover:underline">
              ดูทั้งหมด <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <Th>Booking ID</Th>
                  <Th>สินค้า</Th>
                  <Th>ผู้เช่า</Th>
                  <Th>สถานะ</Th>
                  <Th className="text-right">ยอดรวม</Th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.slice(0, 5).map((b) => {
                  const meta = bookingStatusMeta[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <Td className="font-mono text-xs">{b.id}</Td>
                      <Td className="max-w-40 truncate">{b.listingTitle}</Td>
                      <Td>{b.renterName}</Td>
                      <Td>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                      </Td>
                      <Td className="text-right font-medium">{thb(b.total)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Open disputes */}
      <section>
        <SectionHeading
          title="ข้อพิพาทที่ต้องดำเนินการ"
          action={
            <Link href="/admin/disputes" className="inline-flex items-center gap-1 text-sm font-medium text-info hover:underline">
              จัดการ <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-2">
          {openDisputes.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">{d.reason}</p>
                <p className="text-sm text-muted-foreground">
                  {d.bookingId} · {formatDate(d.date)}
                </p>
              </div>
              <StatusChip tone={d.status === "open" ? "danger" : "warning"}>
                {d.status === "open" ? "เปิดเคส" : "กำลังตรวจสอบ"}
              </StatusChip>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-medium ${className ?? ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
