import {
  BadgeCheck,
  Camera,
  Dumbbell,
  Luggage,
  PartyPopper,
  Speaker,
  Star,
  Tent,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { seedGradient } from "@/lib/format";
import type { KycStatus } from "@/lib/mock/types";

// ---- Category icon ----------------------------------------------------------
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  "party-popper": PartyPopper,
  speaker: Speaker,
  tent: Tent,
  wrench: Wrench,
  dumbbell: Dumbbell,
  video: Video,
  luggage: Luggage,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[name] ?? Camera;
  return <Icon className={className} />;
}

// ---- Placeholder image (offline gradient) -----------------------------------
export function PlaceholderImage({
  seed,
  iconName,
  className,
  rounded = "rounded-xl",
}: {
  seed: string;
  iconName?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        rounded,
        className,
      )}
      style={{ background: seedGradient(seed) }}
    >
      {iconName && (
        <CategoryIcon
          name={iconName}
          className="h-1/4 w-1/4 text-white/80 drop-shadow"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
}

// ---- Avatar -----------------------------------------------------------------
export function Avatar({
  seed,
  initials,
  size = 40,
  className,
}: {
  seed: string;
  initials: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className,
      )}
      style={{
        background: `hsl(${seed})`,
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
}

// ---- Star rating ------------------------------------------------------------
export function Rating({
  value,
  count,
  className,
  size = "sm",
}: {
  value: number;
  count?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        size === "sm" ? "text-sm" : "text-base",
        className,
      )}
    >
      <Star
        className={cn(
          "fill-warning text-warning",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
      />
      {value.toFixed(1)}
      {count !== undefined && (
        <span className="text-muted-foreground font-normal">({count})</span>
      )}
    </span>
  );
}

// ---- Tone chip (status badges) ---------------------------------------------
export type Tone = "success" | "warning" | "info" | "danger" | "muted";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  info: "bg-info/12 text-info border-info/25",
  danger: "bg-danger/12 text-danger border-danger/25",
  muted: "bg-muted text-muted-foreground border-border",
};

const TONE_DOT: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  danger: "bg-danger",
  muted: "bg-muted-foreground",
};

export function StatusChip({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />
      )}
      {children}
    </span>
  );
}

// ---- Verified badge ---------------------------------------------------------
export function VerifiedBadge({
  kyc,
  className,
}: {
  kyc: KycStatus;
  className?: string;
}) {
  if (kyc !== "verified") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-info",
        className,
      )}
    >
      <BadgeCheck className="h-4 w-4" />
      ยืนยันตัวตนแล้ว
    </span>
  );
}

// ---- Section heading --------------------------------------------------------
export function SectionHeading({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      {action}
    </div>
  );
}

// ---- Empty state ------------------------------------------------------------
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
