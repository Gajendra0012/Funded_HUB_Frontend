# Funded HUB frontend

Crypto-only prop trading frontend built with Next.js, React, TypeScript, and a shared UI package.

## Run locally

Use Bun 1.3.5 and Node 24.

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://127.0.0.1:3000. Shared component specimens remain at `/design-system`. The web app needs no environment variables.

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

### Checks

These cover both apps. `bun run build` needs the admin settings above.

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
