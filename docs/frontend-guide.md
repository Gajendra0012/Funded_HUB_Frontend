# Funded HUB web app guide

The web app (`apps/web`) contains the whole client-approved sample (https://prop-sample.vercel.app/), renamed to Funded HUB:
- the public site
- sign-up and log-in
- checkout
- the trader dashboard
- an admin preview

The home page is the redesigned landing page with 3D models (see `landing-design.md`).

**Everything is a demo.** There is no backend:
- the data lives in the browser (`localStorage`);
- sign-in, payments and payouts are simulated.

Last updated: 2 November 2026.

## Run it

```sh
bun install --frozen-lockfile
bun run dev            # http://127.0.0.1:3000
```

## Pages

| Area | Pages |
|---|---|
| Public site | `/` (home), `/challenges` (all plans side by side), `/leaderboard` |
| Sign in | `/login`, `/signup` |
| Purchase | `/checkout?model=two-step&size=100000`, then a success screen |
| Trader dashboard | `/dashboard`, `/dashboard/accounts`, `/dashboard/accounts/[id]`, `/dashboard/payouts`, `/dashboard/certificates`, `/dashboard/affiliate`, `/dashboard/leaderboard`, `/dashboard/settings` |
| Back office (preview) | `/admin`: KPIs, revenue, risk console, payout queue, challenge builder |
| Developer page | `/design-system`: the older shared-component specimens |

The dashboard pages send you to `/login` until you sign in.

## Demo access

| What | How |
|---|---|
| Log in | Any email and password, or **Continue as Demo Trader**. On the home page, **View Live Dashboard Demo** signs you in. |
| Coupon | `DEMO50` gives 50% off at checkout. Any other code shows the error state. |
| Card | **Use test card** in checkout (4242 4242 4242 4242, 12/29, 123) |
| Payout wallet | **Use saved** in the payout pop-up fills a valid destination |
| Start fresh | **Demo Controls → Reset Demo** (click twice) |

**Demo Controls**
- **Open it:** the floating button at the bottom right, or **Shift + D**.
- **Trading actions:** winning and losing trades, push to the daily limit, trigger a breach, pass a phase.
- **Theme:** Neon (default), Electric Blue or Gold Luxe.

**Command palette:** inside the dashboard, **Ctrl + K** (⌘K on Mac) opens it.

## Where things are

| What | Where |
|---|---|
| Brand name, colours, promo, coupon | `src/config/brand.ts` |
| Logo | `src/components/ui/Logo.tsx` and `src/app/icon.svg` (browser tab) |
| Plans and prices (used by home, challenges and checkout) | `src/data/plans.ts` |
| Demo accounts, trades, leaderboard, admin numbers | `src/data/` |
| Rules engine (daily and max loss, targets) | `src/lib/rules.ts` |
| Demo state (accounts, trades, payouts), saved in the browser | `src/lib/store.ts` |
| Dark theme, effects, animations | `src/app/theme.css` |
| Pages | `src/app/(main)/`: `(marketing)`, `(auth)`, `checkout`, `dashboard`, `admin` |
| Home page sections and 3D | `src/components/landing/` |
| Other components | `src/components/{marketing,challenges,checkout,auth,dashboard,admin,leaderboard,fx,ui,wallet}/` |

**Two style sets.** `app/(main)/layout.tsx` loads the dark theme for every product page. `app/(site)/` keeps the older light styles for `/design-system`. They are split so the two never clash.

## What changed compared with the sample

| Change | Detail |
|---|---|
| Name and logo | Name is **Funded HUB** (set in `brand.ts`). The logo mark is a rising line instead of the "N". Headquarters is **Dubai**, so globe arcs start there. |
| Placeholders | Support email is `support@fundedhub.example`. Social accounts are placeholders. The legal entity reads "Funded HUB (preview build)". |
| Home page | The redesigned landing page with 3D models. Its buttons go to the same pages as the sample's: Start Challenge, View Live Dashboard Demo, checkout, full leaderboard. Its prices come from `data/plans.ts`, so they match `/challenges` and checkout. |
| Fonts | Fonts are loaded locally (`geist` and `@fontsource/jetbrains-mono`) instead of being downloaded from Google at build time. |

**Everything else is the sample as it is:**
- Its texts, data and features.
- Its Forex/MT5 content (symbols like XAUUSD, MT5 / cTrader platforms, 1:100 leverage).
- It may later be changed to crypto on Bybit to match the home page.
- The unused sample home-page sections are kept in `src/components/marketing/`.

## Third-party assets

- **Flag font:** `apps/web/public/fonts/TwemojiCountryFlags.woff2` contains the country-flag glyphs from Twemoji (© Twitter, Inc. and other contributors, licensed CC-BY 4.0). They are packaged by the `country-flag-emoji-polyfill` project. The font makes flags show on Windows.
- **Chart attribution:** the candlestick charts use TradingView's `lightweight-charts`. The small TradingView logo on those charts is the attribution its licence requires, so keep it.

## Checks (2 November 2026)

**Automated**
- Type check, lint, 15 tests and the production build pass.

**In Microsoft Edge, on both the dev server and the production build**
- Every page loads.
- These flows work with no console errors:
  - demo sign-in from the home page and from `/login`
  - all dashboard pages and the account detail
  - checkout, admin, challenges and leaderboard
- At 390 px wide, no page scrolls sideways.
