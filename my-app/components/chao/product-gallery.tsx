"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlaceholderImage } from "./primitives";

export function ProductGallery({
  seeds,
  iconName,
}: {
  seeds: string[];
  iconName?: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <PlaceholderImage
        seed={seeds[active]}
        iconName={iconName}
        className="aspect-[4/3] w-full"
        rounded="rounded-2xl"
      />
      {seeds.length > 1 && (
        <div className="mt-3 flex gap-2">
          {seeds.map((s, i) => (
            <button
              key={s}
              onClick={() => setActive(i)}
              className={cn(
                "overflow-hidden rounded-lg ring-2 transition",
                i === active ? "ring-accent" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <PlaceholderImage
                seed={s}
                iconName={iconName}
                className="h-16 w-16"
                rounded="rounded-lg"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
