# Funded HUB frontend

Crypto-only prop trading frontend built with Next.js, React, TypeScript, and a shared UI package.

## Run locally

Use Bun 1.3.5 and Node 24.

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://127.0.0.1:3000. The homepage is the Sellix-inspired globe landing. Shared component specimens remain at `/design-system`. No environment variables are required. The landing pairs Instrument Sans with italic Instrument Serif, downloaded at build time through next/font and served locally; background video and its matching first-frame poster are served locally from public/video.

```sh
bun run lint
bun run typecheck
bun run test
bun run build
bun run start
```

## Landing

A single full-viewport hero replaces the previous multi-section design. It includes responsive navigation, a two-line entrance reveal, a crossfading globe video, reduced-motion and Save-Data poster fallback, a background pause control, and native information dialogs. The old trading mockups, ticker, risk simulator, program cards, payout strip, and crystal are removed.

All challenge accounts described here use simulated capital on Bybit Demo. Authentication, enrollment, trading execution, purchases, support submissions, and payouts are not connected. Navigation and CTAs explain the intended product without collecting credentials or presenting unapproved fees.

## Structure

- `apps/web`: public frontend and landing tests.
- `packages/ui`: shared components and design tokens.
- `docs/landing-design.md`: current design and behavior.

Bun links the web app and UI package through the root workspaces. Use `bun install --frozen-lockfile` for reproducible installs. `bun run test` uses Vitest.

The separate local admin preview is independent of this landing. Optional `dev:admin` and `start:admin` commands require that app to be present. This redesign does not change its implementation.
