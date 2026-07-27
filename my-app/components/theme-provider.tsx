
"use client";

// Minimal in-house theme provider — a drop-in replacement for next-themes'
// `ThemeProvider` / `useTheme` for this demo (light default, class-based dark).
//
// Why not next-themes? next-themes@0.4.6 renders its no-flash <script> inside
// the React tree; React 19.2 / Next 16 then warn "Encountered a script tag
// while rendering React component" every time that script re-renders on the
// client. Here the blocking script is emitted once, server-side, in <head>
// (see `THEME_SCRIPT` / app/layout.tsx), so no <script> is ever rendered by a
// client component — the warning is gone.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "light";

interface ThemeContextValue {
  theme: Theme | undefined; // undefined until mounted (avoids hydration mismatch)
  resolvedTheme: ResolvedTheme | undefined;
  // Accepts a plain string (matching next-themes) — unknown values fall back to
  // the default theme.
  setTheme: (theme: string) => void;
  themes: Theme[];
}

const THEMES: Theme[] = ["light", "dark", "system"];

function coerceTheme(value: string | null | undefined): Theme {
  return (THEMES as string[]).includes(value ?? "")
    ? (value as Theme)
    : DEFAULT_THEME;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// The blocking script that runs before first paint to set the initial class.
// Kept in sync with the logic below. Rendered server-side only, in <head>.
export const THEME_SCRIPT = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k)||'${DEFAULT_THEME}';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(r);d.style.colorScheme=r;}catch(e){}})();`;

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(resolved: ResolvedTheme) {
  const el = document.documentElement;
  el.classList.remove("light", "dark");
  el.classList.add(resolved);
  el.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start undefined on both server and first client render so consumers render
  // identically on the server and during hydration; the real value is read
  // from localStorage after mount.
  const [theme, setThemeState] = useState<Theme | undefined>(undefined);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | undefined>(
    undefined,
  );

  // Hydrate from storage on mount.
  useEffect(() => {
    setThemeState(coerceTheme(localStorage.getItem(THEME_STORAGE_KEY)));
  }, []);

  // Apply the class whenever the theme changes, and keep "system" in sync with
  // the OS preference.
  useEffect(() => {
    if (!theme) return;
    if (theme !== "system") {
      apply(theme);
      setResolvedTheme(theme);
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const r = systemTheme();
      apply(r);
      setResolvedTheme(r);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [theme]);

  const setTheme = useCallback((next: string) => {
    // Normalize any incoming string to a valid Theme before storing/setting.
    const t = coerceTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // ignore (e.g. storage disabled)
    }
    setThemeState(t);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, themes: THEMES }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
