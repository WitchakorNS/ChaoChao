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
- Pages that read/mutate live store state are Client Components (`useDemo`); read surfaces (home, explore, product detail, lender listings, admin) are Server Components that now fetch from the **local database** (below) via `lib/db`. Chat, notifications, saved, and the category taxonomy remain mock (not in the SQL schema).
- `next.config.ts` sets `cacheComponents: false` — the client-store-driven pages are incompatible with Cache Components' (PPR) strict Suspense boundaries.

### Backend: local Supabase (Docker) + DB layer

The read surfaces are backed by a **local Supabase** instance (Postgres in Docker), seeded to mirror the mock catalog. Mock data (`lib/mock/data.ts`) is still the fallback and the source of truth for chat/notifications/saved.

- **Setup**: `supabase/` holds `config.toml`, `migrations/` (`20260715000001_init.sql` = the provided ER `schema.sql`; `_add_item_category` adds `item.category` slug; `_item_rating_view` = per-item rating aggregate; `_grants` = SELECT to anon/authenticated), and `seed.sql` (demo users/items/orders/reviews/evidence). Run: start Docker Desktop → `npx supabase start` → `npx supabase db reset`. Studio at `http://127.0.0.1:54323`.
- **Env**: `.env.local` has `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` + the local anon key. Setting these makes `hasEnvVars` true, so `lib/supabase/proxy.ts` was changed to gate **only** `/protected` (not all routes) — the demo's mock login means no Supabase session exists.
- **DB access layer** (`lib/db/*`, server-only): `listings`, `users`, `bookings`, `reviews`, `evidence`, `admin`, with `mappers.ts` converting rows → the `lib/mock/types.ts` view-model (so UI is unchanged). `getBookingsForUser(CURRENT_USER_ID)` hydrates the client store from the root layout (`app/layout.tsx`), with a try/catch fallback to mock.
- **Writes** (`lib/db/mutations.ts`): every mutation runs server-side through `lib/supabase/admin.ts`, a **service-role** client keyed by `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix, never bundled to the browser) — the anon key only has SELECT grants. Never import `admin.ts` from a Client Component. Covered flows: create/edit listing, open/close listing, create booking, approve/reject/pay/advance, create review, upload evidence, create user, set KYC.
- After a write the UI calls `router.refresh()`; `DemoStoreProvider` re-syncs its bookings from the new server props (a `useEffect` keyed on a JSON snapshot), so the DB stays the source of truth over optimistic state.
- **REST API** (`app/api/*`): `listings` (GET/POST), `listings/[id]` (GET/PATCH — PATCH with only `status` toggles open/close), `categories`, `users` (GET/POST), `users/[id]` (GET/PATCH kyc), `bookings` (GET/POST), `bookings/[id]` (GET/PATCH with `action: approve|reject|pay|advance`), `reviews` (GET/POST), `evidence` (GET/POST), `admin/{summary,rentals,disputes,evidence}`.
- **Registration stores no credentials**: the register form never transmits the typed password; `createUser` writes a fixed placeholder into the NOT NULL `password_hash`. There is no real auth.
- Listing queries use `.order("item_id")` — Postgres has no ordering guarantee and an UPDATE can move a row, which made the owner's list reshuffle after each toggle.
- **Id mapping** (`lib/db/ids.ts`): items align 1:1 (`item_id N ↔ pN`); **users are offset** — DB `user_id 1 → "u_me"`, `7 → "u_admin"`, else `u{n-1}` (so DB user 2 = mock `u1`). Keep DB and mock referring to the same people via `uid()` / `userNum()`.
- **PostgREST embeds**: single-FK relations embed by table name (`workflow_state(state_name)`); `user_account↔user_role` has two FKs so it needs the hint `user_role!user_role_user_id_fkey(...)`. Booking status is derived (`deriveBookingStatus`) from the order's workflow state + payment status; per-listing ratings come from the `item_rating` view.

## Commands

- `npm run dev` — start the dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`)

There is no test suite or typecheck script; type errors surface via `npm run build` or the editor's `tsc`.

## Setup

For the DB-backed demo: start Docker Desktop, then `npx supabase start` and `npx supabase db reset` (applies the migrations + seed). `.env.local` already points at the local instance (`http://127.0.0.1:54321` + local anon key). The app runs without the DB too — `lib/db` calls fall back to `lib/mock/data`. See "Backend: local Supabase" above.

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
