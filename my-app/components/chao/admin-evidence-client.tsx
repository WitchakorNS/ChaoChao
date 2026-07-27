"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { evidenceTypeLabel, formatDateTime } from "@/lib/format";
import { PlaceholderImage, StatusChip } from "@/components/chao/primitives";
import { BookingTimeline } from "@/components/chao/timeline";
import type { Evidence, TimelineEvent } from "@/lib/mock/types";

// Chat isn't part of the SQL schema; this stays illustrative.
const relatedChat = [
  { name: "ผู้เช่า", text: "ผมคืนของตรงเวลาและไม่มีความเสียหายครับ" },
  { name: "ผู้ให้เช่า", text: "แต่พบรอยขีดข่วนที่ตัวเครื่องหลังได้รับคืนครับ" },
];

export function AdminEvidenceClient({
  caseId,
  listingTitle,
  evidence,
  timeline,
}: {
  caseId: string;
  listingTitle?: string;
  evidence: Evidence[];
  timeline: TimelineEvent[];
}) {
  const [closed, setClosed] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ตรวจหลักฐาน</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เคส {caseId}
            {listingTitle ? ` · ${listingTitle}` : ""}
          </p>
        </div>
        {closed ? (
          <StatusChip tone="success">ปิดเคสแล้ว</StatusChip>
        ) : (
          <StatusChip tone="warning">กำลังตรวจสอบ</StatusChip>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">รูปหลักฐาน</h2>
            {evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีหลักฐานในระบบ</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {evidence.map((ev) => (
                  <div key={ev.id} className="rounded-xl border bg-card p-3 shadow-sm">
                    <PlaceholderImage
                      seed={ev.imageSeed}
                      iconName="camera"
                      className="aspect-video w-full"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <StatusChip tone="info" dot={false}>
                        {evidenceTypeLabel[ev.type]}
                      </StatusChip>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(ev.time)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      รายการเช่า {ev.bookingId}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">ข้อความแชทที่เกี่ยวข้อง</h2>
            <div className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
              {relatedChat.map((m, i) => (
                <div key={i} className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
              Timeline รายการเช่า
            </h2>
            {timeline.length > 0 ? (
              <BookingTimeline events={timeline} />
            ) : (
              <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>

          {closed ? (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 p-4 text-sm text-success">
              <CheckCircle2 className="h-5 w-5" /> ปิดเคสเรียบร้อยแล้ว
            </div>
          ) : (
            <button
              onClick={() => setClosed(true)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              <CheckCircle2 className="h-4 w-4" /> ปิดเคส (เดโม)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
