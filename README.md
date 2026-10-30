# Funded HUB frontend

Crypto-only prop trading landing page, built with Next.js, React, TypeScript and a shared UI package.

## Run locally

Use Bun 1.3.5 and Node 24 (for the Next.js toolchain).

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://127.0.0.1:3000. The homepage contains the five-section landing; `/design-system` contains shared component specimens. No environment variables are required. The production build downloads the landing's fonts through `next/font` and serves them locally afterward.

```sh
bun run lint
bun run typecheck
bun run test
bun run build
bun run start
```

## Landing

The quiet-precision design uses alternating navy/white sections, Bodoni Moda, Manrope and IBM Plex Mono. It includes a procedural physical-glass crystal, a scroll-led three-step process, an interactive sample Risk Monitor, reference program cards, and a final CTA with a risk disclosure.

The WebGL hero loads only on desktop without reduced motion. Phones and reduced-motion users receive the static poster. Rendering pauses off-screen, in hidden tabs, or through the crystal's pause button. Context loss restores the poster.

The sample simulator models daily P&L from -6% to +10%. Its opening profit progress is 7.6%, opening drawdown is 4.4%, and its illustrative target/daily-loss/drawdown thresholds are 8%/5%/10%. These are teaching fixtures, not approved program terms or production risk calculations. Program cards label their $100K and 80%/80%/70% values as reference figures.

## Structure

- `apps/web`: public frontend and landing tests.
- `packages/ui`: shared components and design tokens.
- `docs/landing-design.md`: implementation decisions and verification.

Bun links `apps/web` and `packages/ui` through the root `package.json` workspaces. Commit `bun.lock`; use `bun install --frozen-lockfile` for reproducible installs. Tests use Vitest through `bun run test`, rather than the native Bun test runner.

The separate local admin preview is excluded from this feature branch. Optional root `dev:admin` and `start:admin` commands require that app to be added separately.

## Limits

`/programs` is a requested link target and is not implemented yet. No authentication, checkout, Bybit connection, trading execution, payments, KYC or payouts are connected. The landing explains the intended product using simulated account data; it does not provide a working challenge purchase or payout flow.

Ongoing feature work happens on `feat/quiet-precision-landing`, with `main` as the integration branch. Deployment, production program terms and backend integration remain separate work.
