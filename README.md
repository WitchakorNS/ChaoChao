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

### 1. Configure environment variables

Create a `.env.local` file in `my-app/` (copy from the sample):

```bash
cp .env.sample .env.local
```

Then fill in your Supabase project values (found in **Project Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

`.env.local` holds secrets and is git-ignored — never commit it.

### 2. Set up the database

The schema and seed data live in `my-app/supabase/`.

**Using the Supabase CLI (local database):**

```bash
npx supabase start      # starts local Supabase (Docker required)
npx supabase db reset   # applies migrations + seed.sql
```

**Using a cloud Supabase project instead:**

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push    # applies migrations to your cloud database
```

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

- **Missing Supabase env vars** — make sure `my-app/.env.local` exists and both
  `NEXT_PUBLIC_SUPABASE_*` values are set.
- **`supabase start` fails** — Docker must be installed and running.
- **Port 3000 in use** — run `npm run dev -- -p 3001` to use another port.
