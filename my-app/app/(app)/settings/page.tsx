"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Globe, Moon, ShieldCheck, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/store";

export default function SettingsPage() {
  const me = currentUser();
  const { theme, setTheme } = useTheme();
  const [notif, setNotif] = useState({ push: true, email: true, chat: true });
  const [lang, setLang] = useState("th");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">ตั้งค่า</h1>

      {/* Account */}
      <Section title="บัญชี">
        <ReadField label="ชื่อ-นามสกุล" value={me.name} />
        <ReadField label="อีเมล" value="demo@chaochao.app" />
        <ReadField label="เบอร์โทรศัพท์" value="08x-xxx-xxxx" />
      </Section>

      {/* Appearance */}
      <Section title="การแสดงผล">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">ธีม</span>
          </div>
          <div className="flex rounded-lg bg-muted p-1">
            {[
              { key: "light", label: "สว่าง" },
              { key: "dark", label: "มืด" },
              { key: "system", label: "ระบบ" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                  theme === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">ภาษา</span>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none"
          >
            <option value="th">ไทย</option>
            <option value="en">English</option>
          </select>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="การแจ้งเตือน">
        <Toggle
          icon={Bell}
          label="การแจ้งเตือนแบบ Push"
          checked={notif.push}
          onChange={(v) => setNotif((n) => ({ ...n, push: v }))}
        />
        <Toggle
          icon={Bell}
          label="อีเมลแจ้งเตือน"
          checked={notif.email}
          onChange={(v) => setNotif((n) => ({ ...n, email: v }))}
        />
        <Toggle
          icon={Bell}
          label="แจ้งเตือนข้อความแชท"
          checked={notif.chat}
          onChange={(v) => setNotif((n) => ({ ...n, chat: v }))}
        />
      </Section>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> โหมดเดโม — การตั้งค่าจะไม่ถูกบันทึกจริง
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 px-1 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
