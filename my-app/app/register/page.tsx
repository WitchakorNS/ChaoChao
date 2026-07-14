"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/chao/logo";

type Role = "renter" | "lender" | "both";

const ROLES: { key: Role; title: string; desc: string }[] = [
  { key: "renter", title: "ผู้เช่า", desc: "ค้นหาและเช่าอุปกรณ์" },
  { key: "lender", title: "ผู้ให้เช่า", desc: "นำอุปกรณ์มาปล่อยเช่า" },
  { key: "both", title: "ใช้ทั้งสองแบบ", desc: "เช่าและปล่อยเช่า" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("both");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/kyc"), 700);
  };

  return (
    <div className="chao-gradient flex min-h-screen items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo href="/" />
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">สมัครสมาชิก</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            สร้างบัญชีเพื่อเริ่มเช่าและปล่อยเช่าอุปกรณ์
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input label="ชื่อ-นามสกุล" placeholder="ชื่อ นามสกุล" />
            <Input label="อีเมล" type="email" placeholder="you@email.com" />
            <Input label="เบอร์โทรศัพท์" type="tel" placeholder="08x-xxx-xxxx" />
            <Input label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 8 ตัวอักษร" />

            <div>
              <label className="mb-1.5 block text-sm font-medium">เลือกบทบาท</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRole(r.key)}
                    className={cn(
                      "rounded-xl border p-3 text-center transition",
                      role === r.key
                        ? "border-accent bg-accent/10 ring-1 ring-accent"
                        : "hover:bg-muted",
                    )}
                  >
                    <span className="block text-sm font-semibold">{r.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              สมัครสมาชิก
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="font-semibold text-info hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
