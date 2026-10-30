# Cinematic landing refinement — verification

30 October 2026. Branch: feat/quiet-precision-landing. Changes remain local and uncommitted.

## Implemented in the requested order

1. Hero: desktop headline 115 reference units instead of 82 (~1.4x), phone width-constrained sizing, italic line-height 1.10, a 32px authored subline gap, and minimum 18px supporting text. Feathered navy radial scrim; no rectangular text cards.
2. Trading layer: pausable Sample prices strip for BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT; a PriceSource interface with deterministic fixtures; seeded handmade SVG candles; Sample account dashboard with desktop 12-degree-to-flat scroll reveal. Subscription starts only after mount while visible and stops for pause, hidden tabs, reduced motion, Save-Data, and unmount. Both views share one subscription.
3. Hero seam: a 30%-height gradient into #071A33 and a matching fade behind the dashboard bridge.
4. World: retained the fixed globe-to-mid.webp composition, 42-node / 20 fps network, one-video playback manager, lazy final crop, and unboxed closing headline.
5. Cards: glass fill raised to .88; signature Risk Monitor at .94; body 17px minimum and mono labels 12px minimum. Risk calculations are unchanged.
6. Width: 1200px usable content, 1280px usable Risk Monitor on wide screens.
7. Programs: aligned baseline, no per-card parallax or stagger. Unique sparklines retained. Reference figures now $5K to $200K and up to 90%, differentiated by one-step / two-step / direct phases. Clear note gap.
8. Payouts: flat panel and aligned two-column composition; Sample label preserved.
9. Copy: replaced development-note wording in section copy and supporting dialogs. Preserved Sample labels, the footer risk disclosure, and the factual no-live-accounts notice in informational dialogs.

## Checks

Lint, TypeScript, tests, and production build pass. 22 tests across 7 files. Existing tests were preserved; the new sample-feed tests verify deterministic fixtures, candle validity, subscription timing, cleanup, and stable server rendering without timers.

The source audit follows the web-design-guidelines skill and the current Vercel Web Interface Guidelines. Native buttons retain focus states and touch targets. The ticker can be scrolled with keyboard focus. Motion is disabled for static preferences; SVG data colors stay inside the visual instruments. No admin, backend, shared tokens, packages/ui, package manifests, or lockfile changes were introduced by this refinement.

## Contrast: source-pixel estimates, not a rendered confirmation

Decoded actual hero-poster pixels at 192×108, then composited navy (7,26,51) at the stated opacity. Conditional minima:

- White headline within a 78%-opacity scrim region: 9.53:1.
- Subline #EDEDF2 within that region: 8.17:1.
- Muted card text #C4D4E5 over 88%-opacity glass: 8.56:1.

These numbers do NOT verify that every rendered glyph falls inside that opacity region, account for every moving video frame, or replace sampled rendered text pixels. The 7:1 / 4.5:1 rendered targets remain unverified.

## Browser / Lighthouse limits

The browser tool still reports local browser use disabled in Work settings. The earlier user preference was to finish with verification limits documented. No alternate browser-control path was used.

- Playwright screenshots at 1440, 768, 390px: not captured.
- Browser critique / visual polish loop: not performed.
- Rendered-pixel contrast sampling: not performed.
- Lighthouse mobile performance: NOT MEASURED; 85+ target unverified.
- Lighthouse accessibility: NOT MEASURED; 100 target unverified.

Responsive sizing, the authored descender gap, ticker/dashboard overlap, scroll transitions, and final focus behavior still need visual browser confirmation. Source checks are not a substitute for these checks.

## Source critique and fixes

- Removed old per-card stagger rules and scroll offsets rather than relying on an override alone.
- Kept Risk Monitor math and sample arithmetic intact.
- Increased glass opacity and mono label sizes, including nested mobile rules.
- Added a keyboard-focusable horizontally scrollable quote strip.
- Balanced the enlarged hero above the ticker and dashboard; narrow/short screens reserve more hero height.
- Kept disclosure and sample labels rather than presenting seeded values as live quotes or real payouts.

## Performance choices / cuts

No charting library, live market API, WebGL, GSAP, magnetic CTA physics, or smooth-scroll dependency. The feed ticks only every 4 seconds and the 48 SVG candles change only their final close. Below-fold sections and the final video stay lazy. The network remains capped at 42 nodes, 20 fps, and 1.5 pixel density. Mobile gets the small video and no dashboard tilt or program parallax. No large fixed-layer runtime blur filters were added.
