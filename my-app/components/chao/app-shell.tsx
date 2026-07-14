"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Compass,
  Home,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser, useDemo, type Persona } from "@/lib/store";
import {
  personaHome,
  personaLabel,
  personaNav,
} from "./nav-config";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Avatar } from "./primitives";

const PERSONAS: Persona[] = ["renter", "lender", "admin"];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { persona, setPersona, unreadCount } = useDemo();
  const me = currentUser();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const nav = personaNav[persona];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
  };

  const handlePersona = (p: Persona) => {
    setPersona(p);
    setMobileMenu(false);
    router.push(personaHome[p]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileMenu(true)}
            aria-label="เมนู"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo />

          <form
            onSubmit={submitSearch}
            className="relative mx-2 hidden max-w-md flex-1 md:block"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาอุปกรณ์ที่อยากเช่า..."
              className="h-10 w-full rounded-full border bg-muted/40 pl-9 pr-4 text-sm outline-none transition focus:border-accent focus:bg-background focus:ring-2 focus:ring-ring/30"
            />
          </form>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/explore"
              className="hidden h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            >
              ค้นหาอุปกรณ์
            </Link>
            <Link
              href="/lender/listings/new"
              className="mr-1 hidden h-9 items-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-105 sm:inline-flex"
            >
              ปล่อยเช่า
            </Link>
            <ThemeToggle />
            <Link
              href="/notifications"
              aria-label="การแจ้งเตือน"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profile" aria-label="โปรไฟล์" className="ml-1">
              <Avatar seed={me.avatarColor} initials={me.initials} size={34} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r px-3 py-5 lg:flex">
          <PersonaSwitcher persona={persona} onChange={handlePersona} />
          <nav className="mt-5 flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-1 border-t pt-3">
            <SidebarLink href="/kyc" label="ยืนยันตัวตน (KYC)" pathname={pathname} />
            <SidebarLink href="/profile" label="โปรไฟล์" pathname={pathname} />
            <SidebarLink href="/settings" label="ตั้งค่า" pathname={pathname} />
          </div>
        </aside>

        {/* Main content */}
        <main className="w-full min-w-0 flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav pathname={pathname} persona={persona} />

      {/* Mobile drawer */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] overflow-y-auto bg-background p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMobileMenu(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <PersonaSwitcher persona={persona} onChange={handlePersona} />
            <nav className="mt-4 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    isActive(pathname, item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 space-y-1 border-t pt-4">
              {[
                { href: "/kyc", label: "ยืนยันตัวตน (KYC)" },
                { href: "/notifications", label: "การแจ้งเตือน" },
                { href: "/profile", label: "โปรไฟล์" },
                { href: "/settings", label: "ตั้งค่า" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenu(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm font-medium transition",
        isActive(pathname, href)
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function PersonaSwitcher({
  persona,
  onChange,
}: {
  persona: Persona;
  onChange: (p: Persona) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
        มุมมองการใช้งาน
      </p>
      <div className="flex rounded-lg bg-muted p-1">
        {PERSONAS.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition",
              persona === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {personaLabel[p]}
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileBottomNav({
  pathname,
  persona,
}: {
  pathname: string;
  persona: Persona;
}) {
  const items = [
    { href: "/", label: "หน้าแรก", icon: Home },
    { href: "/explore", label: "ค้นหา", icon: Compass },
    { href: personaHome[persona], label: "แดชบอร์ด", icon: User, dashboard: true },
    { href: "/notifications", label: "แจ้งเตือน", icon: Bell },
    { href: "/profile", label: "ฉัน", icon: User },
  ];
  const { unreadCount } = useDemo();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item, i) => {
          const active = item.dashboard
            ? pathname.startsWith(`/${persona}`)
            : isActive(pathname, item.href);
          return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.href === "/notifications" && unreadCount > 0 && (
                <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-danger px-1 text-[9px] font-bold text-danger-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
