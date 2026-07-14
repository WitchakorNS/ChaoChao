"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/chao/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@chaochao.app");
  const [password, setPassword] = useState("demo1234");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/renter/dashboard"), 700);
  };

  return (
    <div className="chao-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo href="/" />
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ยินดีต้อนรับกลับสู่ CHAOCHAO
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field
              icon={Mail}
              label="อีเมล"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border bg-background pl-9 pr-10 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Link
                href="/auth/forgot-password"
                className="mt-1.5 inline-block text-xs text-info hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="mt-5 rounded-lg bg-muted/60 p-3 text-center text-xs text-muted-foreground">
            โหมดเดโม — กด “เข้าสู่ระบบ” เพื่อเข้าใช้งานได้ทันที
          </p>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-semibold text-info hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  );
}
