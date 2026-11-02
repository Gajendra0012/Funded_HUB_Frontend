# Landing page guide

The landing page at `/` follows the client-approved sample (https://prop-sample.vercel.app/): dark navy background, teal → blue → violet accents, glass cards. It adds 3D models and uses Funded HUB's real product facts: crypto only, Bybit Demo, payouts in USDT, USDC or BTC.

Last updated: 2 November 2026.

## Where things are

| What | File |
|---|---|
| The page itself (list of sections, top to bottom) | `apps/web/src/app/(main)/(marketing)/page.tsx` |
| **All text, numbers and lists** | `apps/web/src/data/landing.ts` |
| Colours, fonts, effects and animations | `apps/web/src/app/theme.css` (shared with the rest of the app) |
| One file per section | `apps/web/src/components/landing/sections/` |
| Small reusable pieces (button, logo, FAQ list, …) | `apps/web/src/components/landing/ui/` |
| 3D models and scenes | `apps/web/src/components/landing/three/` |
| Number formatting for the home page | `apps/web/src/components/landing/lib/format.ts` |
| Navbar, price ticker and footer (shared with /challenges and /leaderboard) | `apps/web/src/components/marketing/` via `app/(main)/(marketing)/layout.tsx` |
| Tests | `apps/web/tests/landing-*.test.tsx` |

## How to change things

- **Text, prices, rules, FAQ:** edit `src/data/landing.ts`. The components read everything from there.
- **Colours:** change the palettes in `src/config/brand.ts`; they apply to the whole app. Demo Controls can switch between them.
  - The 3D scenes can't read CSS. Change the same colours in `COLORS` in `three/scene-canvas.tsx`.
  - The globe has its own copy at the top of `three/globe.tsx`.
- **Add, remove or reorder a section:** edit the list in `(main)/(marketing)/page.tsx`.
- **Move the 3D coins:** edit `HERO_PLACEMENTS` or `CTA_PLACEMENTS` in `three/coins-scene.tsx`.
  - Positions are fractions of the visible area: `x: -1` is the left edge, `1` the right edge.

## Sections

| # | Section | File | Notes |
|---|---|---|---|
| 1 | Navbar | `components/marketing/Navbar.tsx` | Shared with the other public pages |
| 2 | Price ticker | `components/marketing/TickerTape.tsx` | Sample prices that move every 1.5 s |
| 3 | Hero | `hero.tsx`, `hero-dashboard.tsx` | Headline, live sample account card, **3D coins** behind it |
| 4 | Key facts | `key-facts.tsx` | Product facts, not past results |
| 5 | How it works | `how-it-works.tsx` | The line fills as you scroll |
| 6 | Challenge selector | `challenge-selector.tsx` | Program, size, rules in % or $, price |
| 7 | Global reach | `global-reach.tsx` | **3D globe** with reward arcs from Dubai |
| 8 | Payouts | `payout-wall.tsx` | Two rows of sample payout cards |
| 9 | Platform | `platform.tsx`, `platform-chart.tsx` | **3D candlestick chart** and Bybit Demo features |
| 10 | Leaderboard | `leaderboard.tsx` | Sample top 5 |
| 11 | Built for traders | `trader-promises.tsx` | Scrolling cards |
| 12 | FAQ | `faq.tsx` | One answer open at a time |
| 13 | Final call to action | `final-cta.tsx` | **3D coins** on wide screens |
| 14 | Footer | `components/marketing/Footer.tsx` | Shared; legal pop-ups and risk disclaimer |

## 3D

Every model is built in code. There are no model files to download.

**Models**
- **Coin** (`three/coin.tsx`): a dark metal disc with a chrome rim. The glowing Funded HUB logo is on both faces, built from the same points as the SVG logo.
- **Crystal** (`three/coin.tsx`): a glass gem.
- **Candles** (`three/candles-scene.tsx`): a fixed, made-up price series. The candles grow out of a grid floor, with a glowing average line.
- **Globe** (`three/globe.tsx`): uses the small `cobe` library instead of three.js.

**How they load** (`three/lazy.tsx`)
- They never render on the server.
- They download only when their section comes near the screen.
- `Safe3D` hides them if the browser has no WebGL, so the rest of the page still works.

**Performance and accessibility** (`three/scene-canvas.tsx`)
- Scenes stop drawing while off screen.
- Screen sharpness (pixel density) is capped at 1.75.
- Scenes are hidden from screen readers, because they are decoration.
- With "reduce motion" on, scenes draw one still frame.

**Libraries:** `three`, `@react-three/fiber`, `@react-three/drei`, `cobe`.

## What is sample data

Anything marked **SAMPLE** in `src/data/landing.ts` is illustrative:
- ticker prices
- the hero account
- payout cards and the 24-hour total
- the reward feed
- the leaderboard

Prices and rules are the defaults used to show the design. On the page, these are labelled "Preview · sample data", "Example values", "Simulated" or "Sample".

**Before launch:** replace the sample data with real data, and take prices and rules from the admin configuration.

## Buttons and links

The home page buttons work like the sample's:
- **Start Challenge** opens `/challenges`.
- **View Live Dashboard Demo** signs in a demo trader and opens `/dashboard`.
- **The price card** opens checkout for the chosen program and size.
- **"View full leaderboard"** opens `/leaderboard`.

Prices come from `src/data/plans.ts`, so the home page, `/challenges` and checkout always agree. A test checks that the rules shown on the home page match that file.

## Checks (2 November 2026)

**Automated**
- Type check, lint, tests (17) and production build all pass.
- The landing page is generated as a static page.

**In Microsoft Edge**
- Tested at 1440 px and 390 px wide.
- No console errors and no sideways scrolling.
- The 3D scenes render: hero coins, globe, candle chart, closing coins.
- These work: the pop-up (closes with Escape), program and size switching, % / $ rules, FAQ, mobile menu.
- In reduced-motion mode, no content stays hidden.

**Download size**
- About 251 KB of JavaScript (gzipped) loads up front.
- three.js is in a separate file that loads only near the 3D sections.
