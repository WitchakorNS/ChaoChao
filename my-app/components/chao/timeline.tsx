import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { TimelineEvent } from "@/lib/mock/types";

export function BookingTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-5">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={i} className="relative flex gap-3">
            {!last && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-full w-0.5",
                  e.done ? "bg-success" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                e.done
                  ? "border-success bg-success text-success-foreground"
                  : "border-border bg-background",
              )}
            >
              {e.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <div className="pb-1">
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  !e.done && "text-muted-foreground",
                )}
              >
                {e.label}
              </p>
              {e.date && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.date)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
