# Funded HUB frontend

Crypto-only prop trading frontend built with Next.js, React, TypeScript, and a shared UI package.

## Run locally

Use Bun 1.3.5 and Node 24.

```sh
bun install --frozen-lockfile
cp apps/web/.env.example apps/web/.env.local     # then fill in the values
bun run dev
```

Open http://127.0.0.1:3000. Shared component specimens remain at `/design-system`.

The website needs four settings: the Supabase address, the Supabase publishable key, the backend address and the site's own address (email links are built from it). Without them, `next dev`, `next build` and `next start` stop with a message that lists what's missing. Trader sign-up and login are being built order by order: `docs/WEB_BUILD_PLAN.md`.

### Admin app

```sh
cp apps/admin/.env.example apps/admin/.env.local   # then fill in the values
bun run dev:admin                                  # http://127.0.0.1:3101
```

The admin app needs three settings: the Supabase address, the Supabase publishable key and the backend address. Without them, `next dev`, `next build` and `next start` stop with a message that lists what's missing.

For the full local stack, see `docs/ADMIN_BUILD_PLAN.md`, step ADM-67. It covers:
- the backend's `dev` branch
- local Supabase with 2FA on
- the first admin

**Signing in:** open http://127.0.0.1:3101 and sign in with an admin account (ADM-67 creates the first one). The first sign-in sets up 2FA with an authenticator app (scan the QR code); every later sign-in asks for the 6-digit code. Admin sessions end 12 hours after sign-in.

**Backend calls:** every call goes through the API helper in `apps/admin/src/lib/api` (lint blocks direct `fetch` in admin code). Its types come from `apps/admin/contract/openapi.json`, a copy of the backend contract (v1.1.0, backend `dev` at `4b81f8d`). When the backend changes its `openapi.json`, copy the new file there and run `bun run --cwd apps/admin api:types`.

### Checks

These cover both apps. `bun run build` needs the website and admin settings above.

```sh
bun run lint
bun run typecheck
bun run test
bun run build
```

After a build, `bun run start` serves the web app and `bun run start:admin` serves the admin app.

## What's in the web app

The whole client-approved sample (https://prop-sample.vercel.app/), renamed to Funded HUB:
- public site, `/challenges` and `/leaderboard`
- `/login` and `/signup`
- checkout
- the trader dashboard (`/dashboard/...`)
- an admin preview (`/admin`)

The home page is the redesigned landing page with 3D models.

Everything is a frontend demo: data lives in the browser and sign-in, payments and payouts are simulated. Use **Continue as Demo Trader**, or press **Shift + D** for Demo Controls.

- `docs/frontend-guide.md`: pages, demo access, where things are, and what changed from the sample.
- `docs/landing-design.md`: the home page and its 3D.

## Structure

- `apps/web`: the web app (product pages in `src/app/(main)`) and its tests.
- `packages/ui`: shared components and design tokens.
- `docs/frontend-guide.md` and `docs/landing-design.md`: how the web app and home page are built.

Bun links the web app and UI package through the root workspaces. Use `bun install --frozen-lockfile` for reproducible installs. `bun run test` uses Vitest.

The separate local admin preview is independent of this landing. Optional `dev:admin` and `start:admin` commands require that app to be present. This redesign does not change its implementation.
