"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Inbox,
  MessageSquare,
  ShieldAlert,
  Wallet,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/chao/primitives";
import type { NotificationType } from "@/lib/mock/types";

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  request: Inbox,
  approved: CheckCircle2,
  awaiting_payment: Wallet,
  paid: CheckCircle2,
  due_soon: CalendarClock,
  message: MessageSquare,
  dispute: ShieldAlert,
};

const TONE: Record<NotificationType, string> = {
  request: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  awaiting_payment: "bg-warning/15 text-warning-foreground",
  paid: "bg-success/10 text-success",
  due_soon: "bg-warning/15 text-warning-foreground",
  message: "bg-info/10 text-info",
  dispute: "bg-danger/10 text-danger",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAllRead, markRead, unreadCount } = useDemo();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">การแจ้งเตือน</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `ยังไม่ได้อ่าน ${unreadCount} รายการ` : "อ่านครบทุกรายการแล้ว"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium hover:bg-muted"
          >
            <CheckCheck className="h-4 w-4" /> อ่านทั้งหมด
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Bell} title="ยังไม่มีการแจ้งเตือน" />
        </div>
      ) : (
        <div className="mt-5 divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <button
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.href) router.push(n.href);
                }}
                className={cn(
                  "flex w-full items-start gap-3 p-4 text-left transition hover:bg-muted/40",
                  !n.read && "bg-info/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    TONE[n.type],
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-info" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(n.date)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
