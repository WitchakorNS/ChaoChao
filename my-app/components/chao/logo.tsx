import Link from "next/link";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  showText = true,
  className,
  invert = false,
}: {
  href?: string;
  showText?: boolean;
  className?: string;
  invert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm ring-1 ring-inset ring-white/10">
        <Repeat className="h-5 w-5" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent ring-2 ring-background" />
      </span>
      {showText && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            invert ? "text-white" : "text-foreground",
          )}
        >
          CHAO<span className="text-accent">CHAO</span>
        </span>
      )}
    </Link>
  );
}
