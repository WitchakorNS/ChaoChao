import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "./primitives";

const TONE_BG: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  info: "bg-info/10 text-info",
  danger: "bg-danger/10 text-danger",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "info",
  hint,
  href,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          TONE_BG[tone],
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="group relative block">
        {inner}
        <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </Link>
    );
  }
  return inner;
}
