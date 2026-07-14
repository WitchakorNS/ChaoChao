# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CHAOCHAO Rental Platform (demo)** — a frontend-only, mock-data demo of a peer-to-peer equipment rental marketplace (Thai UI), built on a Next.js App Router base (React 19, TypeScript, Tailwind CSS, shadcn/ui). It was scaffolded from the Next.js + Supabase Starter Kit; the Supabase auth routes (`app/auth/*`, `app/protected`, `lib/supabase/*`, `proxy.ts`) are left in place but are **not** part of the demo, which uses its own mock login. With no `.env.local`, `hasEnvVars` is false so the proxy skips all auth checks and every CHAOCHAO route is publicly reachable.

> Note: a `CLAUDE.md` in a parent directory describes a different, unrelated project ("ShopEasy"). Ignore it — this file governs the `my-app` project.

### CHAOCHAO demo architecture

- **Design system** — CHAOCHAO tokens (navy `#1C3554` primary, action-blue `#7BB9FA` accent) plus status colors (`success`/`warning`/`danger`/`info`) live as HSL CSS vars in `app/globals.css` and are mapped in `tailwind.config.ts`. Use the semantic token classes. `font-sans` is a Thai-capable system stack (Noto Sans Thai → Leelawadee UI → system-ui); `next/font/google` is **not** used because the build environment has no network access to Google Fonts.
- **Mock data** — everything is hardcoded in `lib/mock/data.ts` (typed by `lib/mock/types.ts`): users, categories, listings, reviews, bookings, evidence, notifications, chats, disputes, plus `get*` lookup helpers. The logged-in demo user is `CURRENT_USER_ID = "u_me"` (owns listings `p11`–`p13`).
- **Client store** — `lib/store.tsx` (`DemoStoreProvider` in the root layout, `useDemo()` hook) holds all interactive state in memory: current **persona** (`renter`/`lender`/`admin`), a mutable copy of bookings, notifications, chats, and saved listings, plus actions (`approveBooking`, `payBooking`, `sendMessage`, `toggleSaved`, …). Not persisted across reload.
- **Shell & routing** — CHAOCHAO pages live in the `app/(app)/` route group under `app/(app)/layout.tsx`, which wraps them in `components/chao/app-shell.tsx` (header + search + persona switcher sidebar + mobile bottom nav; nav config in `components/chao/nav-config.ts`). `/login` and `/register` are standalone (no shell). Shared UI is in `components/chao/` (`primitives.tsx`, `product-card`, `booking-card`, `timeline`, `stat-card`, `listing-form`, etc.). Placeholder images are offline CSS gradients (`PlaceholderImage`, `seedGradient`) — no external image hosts.
- Pages that read/mutate live store state are Client Components (`useDemo`); static content pages (product detail, admin tables) are Server Components reading `lib/mock/data` directly.
- `next.config.ts` sets `cacheComponents: false` — the client-store-driven pages are incompatible with Cache Components' (PPR) strict Suspense boundaries.

## Commands

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`)

There is no test suite or typecheck script; type errors surface via `npm run build` or the editor's `tsc`.

## Setup

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the publishable/anon key). Without these, `hasEnvVars` (in `lib/utils.ts`) is false, which makes the app skip the auth proxy check and render an `EnvVarWarning` instead of the auth UI.

## Architecture

### Supabase client — three variants, never share instances

The Supabase client is created fresh per call in three environment-specific factories (Fluid compute requires never storing them in module/global scope):

- `lib/supabase/client.ts` — `createClient()` for **Client Components** (browser).
- `lib/supabase/server.ts` — async `createClient()` for **Server Components, Route Handlers, Server Actions**; reads/writes cookies via `next/headers`. Its `setAll` swallows errors so it's safe to call from a Server Component (the proxy handles the actual cookie refresh).
- `lib/supabase/proxy.ts` — `updateSession()` used only by the proxy.

Pick the factory that matches the execution context; do not reuse a client across requests.

### Session refresh via `proxy.ts` (not `middleware.ts`)

Root `proxy.ts` exports `proxy()` (Next.js proxy convention) delegating to `updateSession()` in `lib/supabase/proxy.ts`. It runs on every request (see the `matcher` config, which excludes static assets/images), refreshes the auth token, and redirects unauthenticated users to `/auth/login` for any path outside `/`, `/login`, and `/auth/*`.

Critical constraint (documented inline): do not insert code between `createServerClient()` and `supabase.auth.getClaims()`, and return the `supabaseResponse` object unmodified (only its cookies may not be tampered with) — violating either can randomly log users out.

### Routing

- `app/` is the App Router root. `app/page.tsx` is the public landing/tutorial page.
- `app/auth/*` — auth flows: login, sign-up, sign-up-success, forgot-password, update-password, error pages, plus `app/auth/confirm/route.ts` (a Route Handler that verifies the email OTP via `token_hash` and redirects).
- `app/protected/` — auth-gated area with its own `layout.tsx` (nav + footer + theme switcher); access is enforced by the proxy, not the layout.
- `app/layout.tsx` — root layout wraps everything in `next-themes` `ThemeProvider` (class-based dark mode, system default) and loads the Geist font.

`next.config.ts` enables `cacheComponents: true`.

### UI conventions (shadcn/ui)

- Components live in `components/`; primitives in `components/ui/` (shadcn "new-york" style, Radix-based). Config in `components.json`.
- Import alias `@/*` maps to the project root (see `tsconfig.json`).
- Compose class names with `cn()` from `lib/utils.ts` (clsx + tailwind-merge).
- Theming is CSS-variable driven: Tailwind color tokens (`background`, `primary`, `card`, etc.) map to `hsl(var(--...))` defined in `app/globals.css`. Use the semantic token classes, not raw colors.
- Icons from `lucide-react`.
- Auth forms (`login-form.tsx`, `sign-up-form.tsx`, etc.) are Client Components that call the browser Supabase client directly and `router.push` on success.
