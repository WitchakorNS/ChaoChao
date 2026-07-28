# ChaoChao (เช่าเช่า)

Project ISE — เว็บไซต์สำหรับการเช่ายืมของ
A rental marketplace web app built with **Next.js** and **Supabase**.

The application lives in the [`my-app/`](./my-app) folder. This README explains how to
run the whole project locally; see [`my-app/README.md`](./my-app/README.md) for the
Next.js/Supabase starter details.

## Requirements

- [Node.js](https://nodejs.org/) 18.18+ (LTS recommended)
- npm (ships with Node)
- A [Supabase](https://supabase.com/) project (cloud), **or** the
  [Supabase CLI](https://supabase.com/docs/guides/cli) for running the database locally

## Project layout

```
ChaoChao/
├─ my-app/            # the Next.js + Supabase application (run everything from here)
│  ├─ app/            # pages & API routes
│  ├─ components/     # UI components
│  ├─ lib/            # data, store, supabase clients
│  └─ supabase/       # database config, migrations, seed.sql
└─ README.md          # you are here
```

> Note: the top-level `supabase/` and `supabase-project/` folders are local-only
> (they are git-ignored) and are not required to run the app.

## Setup & run

All commands are run from inside the `my-app` folder.

```bash
cd my-app
npm install
```

### 1. Start the local database (Supabase on Docker)

The schema, migrations, and seed data live in `my-app/supabase/`. The demo runs
against a **local Supabase** instance (Postgres in Docker).

```bash
# Docker Desktop must be installed AND running first.
npx supabase start      # boots local Supabase; prints the API URL + keys
npx supabase db reset   # applies migrations + seed.sql (demo data)
```

`supabase start` prints an **API URL**, an **anon/publishable key**, and a
**service_role key** — you'll use these in step 2. Supabase Studio is at
<http://127.0.0.1:54323>.

> The app also runs **without** the database — if Supabase isn't up, every page
> falls back to the built-in mock data instead of crashing. You just won't see
> live DB reads/writes.

### 2. Configure environment variables

Copy the sample to `.env.local` (git-ignored — never commit it):

```bash
cp .env.sample .env.local
```

`.env.sample` ships with **placeholders**, not real keys. Open `.env.local` and
paste in the values that `npx supabase start` printed in step 1 (the **anon
key** and the **service_role key**). The local URL is already filled in.

| Variable | Where to get it | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `supabase start` → `API URL` | Supabase API URL (`http://127.0.0.1:54321` locally) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `supabase start` → `anon key` | reads (SELECT only) |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase start` → `service_role key` | **server-only** key for writes (create/edit/booking/review…). No `NEXT_PUBLIC_` prefix, so it's never sent to the browser |

> Lost the output? Re-print it any time with `npx supabase status`.

> Already have a working `.env.local`? You can skip the copy — it would overwrite
> your file. **Writes require `SUPABASE_SERVICE_ROLE_KEY`**, so make sure that
> line is present.

**Using a cloud Supabase project instead of local:** replace the URL + keys with
the values from your project's **Settings → API**, then run
`npx supabase link --project-ref <ref>` and `npx supabase db push`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Other commands

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Run the production build             |
| `npm run lint`  | Run ESLint                           |

## Troubleshooting

- **`cp: .env.sample: No such file`** — run the command from inside `my-app/`
  (`cd my-app` first). On Windows PowerShell, `cp` works too; or use
  `Copy-Item .env.sample .env.local`.
- **Pages show mock data / writes don't save** — the local DB isn't running.
  Start Docker Desktop, then `npx supabase start` (containers also auto-restart a
  few seconds after Docker boots). Writes also need `SUPABASE_SERVICE_ROLE_KEY`
  in `.env.local`.
- **`supabase start` fails** — Docker must be installed and running.
- **Port 3000 in use** — run `npm run dev -- -p 3001` to use another port.
