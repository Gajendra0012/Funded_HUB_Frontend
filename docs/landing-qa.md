# Landing QA — 31 October 2026

## Corrected brief
Reverted the untracked AGENTS.md created from the mistaken Railwise prompt. Work remains on feat/quiet-precision-landing. Only landing components, landing metadata/fonts, DESIGN.md, this report and a new landing regression test changed. Existing tests, shared tokens, packages/ui, admin and backend are untouched.

## Completed
Every section renders in server HTML with real content, not observer-gated placeholders. Reveals start visible and only add optional transforms. Missing IntersectionObserver leaves static content; number and price observers are guarded. Reduced-motion and Save-Data behavior, world/video playback manager, Risk Monitor arithmetic, sample labels and footer risk disclosure are retained.

Geist 400/500/600 and Geist Mono replace the old sans/mono system. Italic serif remains on the second hero and final CTA lines only. Plain text steps and supporting copy replace redundant glass boxes. Glass product UI uses 12px corners and the requested fill/hairline/blur. Laptop hardware removed; floating dashboard flattens from 8 degrees, retains seeded data, pause controls and sample ticker. Supplied brief copy applied. Hero headline flagged in DESIGN.md for client review.

## Visual polish loop
Browser access is now available. Used browser Playwright controls to scroll to the bottom and save full-page screenshots at 1440x1000, 768x1024 and 390x844. All five content sections contain headings and body content, with computed visibility visible and opacity 1. No horizontal overflow at any tested width. The source-render regression verifies the same content before JavaScript. Phone dashboard reflows as a product window, not a stretched laptop. Checked the hero separately to verify the globe remains visible. Full-page captures show the fixed world in its current viewport position; they do not stitch a different background scroll state behind each section.

Critique and fixes: reduced excess program-card interior space, shortened the journey visual, normalized the last legacy payout H2 override, tightened section rhythm, retained aligned desktop program baselines and used a tablet single-column layout to avoid cramped cards. Removed footer background box to keep boxes exclusive to product UI. Only hero and closing use italic accents. Browser console returned no warnings/errors. Keyboard slider Home reached -6%, output updated and status became Rule breached. Pause prices control responds.

Screenshots (outside repository):
- C:/Users/dhruv/.codex/visualizations/2026/10/30/01a18bf0-d1b1-7c60-9847-b513216a0292/landing-1440.jpg
- C:/Users/dhruv/.codex/visualizations/2026/10/30/01a18bf0-d1b1-7c60-9847-b513216a0292/landing-768.jpg
- C:/Users/dhruv/.codex/visualizations/2026/10/30/01a18bf0-d1b1-7c60-9847-b513216a0292/landing-390.jpg

## Web Interface Guidelines audit
Fetched https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md fresh for this audit.
Resolved findings:
- apps/web/src/components/landing/landing-experience.tsx:11 — observer-gated sections replaced with eagerly rendered content.
- apps/web/src/components/landing/cinematic-motion.tsx:10 — visible reveal baseline, no blur/opacity hiding and missing-observer fallback.
- apps/web/src/components/landing/hero-trading.tsx:15 — guarded sample-feed observer and cleanup.
- apps/web/src/components/landing/hero-trading.module.css:49 — removed JS screen measurement and hardware scaling; CSS responsive grid.
- apps/web/src/app/page.tsx:5 — critical next/font assets use display swap.
Existing skip link, focus-visible outlines, named buttons, slider label, live status, tabular numbers, safe areas, reduced motion and hidden-tab cleanup retained. No remaining source-level findings identified within changed landing scope. Lighthouse color contrast audit passed; this does not establish 7:1 against every moving video frame. Pixel-by-pixel video contrast sampling was not performed.

## Checks and Lighthouse
Lint, TypeScript, all 24 tests (22 existing unchanged + 2 new rendering regressions), and production build pass.
Final local production Lighthouse mobile: performance 98, accessibility 100. LCP 0.9 s, CLS 0.089, TBT 10 ms. This is one local simulated-mobile run, not a deployed-device measurement.
Reports: C:/Users/dhruv/.codex/visualizations/2026/10/30/01a18bf0-d1b1-7c60-9847-b513216a0292/landing-lighthouse.report.html and .json.

## Performance decisions
Removed laptop shell and ResizeObserver scaling, broad blur entrance work, and content-loading gates. Preserved single-playing-video budget, mobile video, static preference fallbacks, lazy final media/canvas and off-screen/hidden work cleanup. No GSAP, smooth-scroll library or chart package added. Meaningful section content is eager to guarantee resilient rendering. Lighthouse still reports unused framework/Motion JavaScript; no speculative bundle rewrite was needed to meet the performance target.

Skills: frontend-design for hierarchy and surfaces; gsap-framer-scroll-animation for Motion-only enhancements; vercel-react-best-practices for rendering and cleanup; web-design-guidelines for audit; takksh-trading-frontend for project boundaries and factual sample context; ponytail for a focused change.

## Latest user override — laptop restored
The user requested the MacBook frame back after reviewing the floating window. Restored bezel, camera, chin and base around the existing dashboard, with a 16:10 mobile screen scaled uniformly in both axes. Desktop width remains contained. Current typography, dashboard labels, ticker and sample logic are retained. Updated DESIGN.md and the new rendering assertion accordingly. Lint, types, all 24 tests and production build pass; server refreshed. Browser reconnection failed during this follow-up, so the restored frame has not received a fresh screenshot. Earlier Lighthouse scores and screenshots describe the preceding floating-window version.
