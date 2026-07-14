import Link from "next/link";
import { bookings, getListing, getUser } from "@/lib/mock/data";
import { bookingStatusMeta, formatDate, thb } from "@/lib/format";
import { StatusChip } from "@/components/chao/primitives";

export default function AdminRentalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">รายการเช่าทั้งหมด</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        รายการเช่าทั้งหมดในระบบ ({bookings.length} รายการ)
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Booking ID</th>
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">ผู้เช่า</th>
                <th className="px-4 py-3 font-medium">ผู้ให้เช่า</th>
                <th className="px-4 py-3 font-medium">ช่วงเวลา</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 text-right font-medium">ยอดรวม</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => {
                const listing = getListing(b.listingId);
                const renter = getUser(b.renterId);
                const lender = getUser(b.lenderId);
                const meta = bookingStatusMeta[b.status];
                return (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                    <td className="max-w-40 truncate px-4 py-3">{listing?.title}</td>
                    <td className="px-4 py-3">{renter?.name}</td>
                    <td className="px-4 py-3">{lender?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {thb(b.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/renter/bookings/${b.id}`}
                        className="text-xs font-medium text-info hover:underline"
                      >
                        ดู
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
