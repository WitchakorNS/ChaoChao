"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
      }}
      className="flex items-center gap-2 rounded-full border bg-background p-1.5 shadow-sm"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหา เช่น กล้อง, เต็นท์, ลำโพง..."
        className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
      />
      <button
        type="submit"
        className="h-9 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        ค้นหา
      </button>
    </form>
  );
}
