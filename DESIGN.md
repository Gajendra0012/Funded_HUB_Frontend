# Cinematic dark — Funded HUB landing

## Direction and scope
Dark navy only, a continuous blue globe world with restrained glass product instruments. Keep the globe/video system, hero structure, Risk Monitor calculations, Sample labels, shared tokens and existing tests. Landing files only; no admin, backend or packages/ui edits.

## Typography
Geist 400/500/600 for headings, body and UI. Geist Mono only for numbers, prices and Sample tags. Instrument Serif italic is a signature only on the second hero line and second final CTA line. Never use weights below 400. Four levels: hero signature, H2 500 clamp(40px,5vw,64px)/1.05 with -.03em tracking, lead 20px/1.55 #C9D6E6, body 17–18px/1.6 #A9BACF. White headings. Labels 12–13px in sans unless numeric or Sample. At most one small marker per section. Target headline contrast 7:1 and body 4.5:1 against real composited pixels.

## Cards and layout
Boxes belong to product UI only. Dashboard, Risk Monitor, journey product instrument, payout and program cards use 12px corners, rgba(10,30,58,.72) fill, a 1px rgba(255,255,255,.10) border, 16px backdrop blur and faint inner top-edge highlight. Padding 28–32px. Plain copy has no background box. How it works steps use large numerals, titles, body and hairline separators. Remove redundant labels, internal decorative dividers and excess blank card space. Hover effects only on controls and links. Programs share one baseline, unique sparklines and different phase tracks, identical reference ranges. Content 1200px, Risk Monitor up to 1280px, section rhythm 120–160px. Alternate left-led journey, wide Risk Monitor, centered programs, split payouts and centered closing.

## Hero and content
Keep Your edge. / Amplified. with the serif signature; flag this headline for client review because it may imply a profit promise. Use the supplied product-brief copy, simulated-capital language and reviewed real rewards; invent no metrics. MacBook-framed trading dashboard, proportional 16:10 screen on mobile, maximum 8-degree perspective flattening on scroll, soft blue glow, neutral window chrome, real UI labels, seeded sample candles and pausable Sample prices ticker. Preserve the footer risk disclosure exactly. No preview/planned copy.

## Resilient rendering and motion
Every section is server-rendered in the DOM and visible before JS or IntersectionObserver. Never gate content behind intersection state or dynamic placeholders. Reveals are optional once-only transform enhancements from a visible baseline, with one easing cubic-bezier(.16,1,.3,1), .4/.7/1.05s durations and 75ms headline stagger. Reduced-motion and Save-Data use static charts/stills, no entry movement or parallax. Missing observers leave complete static content.

## World and performance
Fixed world behind all sections. Hero video crossfades to pre-blurred/pre-darkened /video/mid.webp and pauses. Fewer than 60 canvas nodes, sparse stars, capped DPR/low frame rate, pause hidden work, no network for static preferences. Final CTA lazily loads a different globe crop. At most one video plays. Mobile uses small video and no perspective. Never blur large fixed layers at runtime. No GSAP, smooth-scroll or chart library. Content must render eagerly; decorative canvas and final video remain lazy.

## Verification
Run lint, types, existing tests and production build. Regression-check complete SSR content and missing-observer rendering. When browser control is available, scroll to the bottom and capture full pages/sections at 1440,768,390px; critique hierarchy, contrast, spacing, repetitive patterns and overflow. Audit web-design-guidelines and report measured Lighthouse mobile, never invented scores. Browser screenshots, pixel contrast and Lighthouse remain unverified while local browser use is disabled.


## Admin

The admin is the landing product at operational density: dark, calm, no video, 3D, parallax or entry animation. Only 150–200ms control transitions (180ms default); respect reduced motion. Keep Geist UI, Geist Mono numbers/IDs/timestamps and Instrument Serif italic only for the login signature. Every timestamp is explicitly labelled UTC. Existing landing tokens, glass values, control/card radii and tests remain intact.

### Admin palette (updated 2 November 2026, for readability)

**Why it changed.** The first admin palette put the background, sidebar, panels, table headers and drawers all in one navy. It looked readable on paper (white text 15:1), but areas blended together. Table row lines were navy on navy, and blue links measured only 3.5:1.

**The new palette.**
- Dark neutral layers with clear steps.
- The web app's dark theme accents (from the client-approved sample), so the admin and the website feel like one product.
- The raw values exist only in packages/ui (`:root`, `--admin-*` palette). apps/admin still uses no raw colours.

| Layer or role | Token (value) | Used for |
| --- | --- | --- |
| Canvas | --admin-canvas (#05070C) | Page background, top bar |
| Layer 1 | --admin-layer-1 (#0E131D) | Panels, tables, inputs, dialogs, drawers |
| Layer 2 | --admin-layer-2 (#141B29) | Sidebar, table headers, menus |
| Layer 3 | --admin-layer-3 (#1C2537) | Hover, selected rows, progress tracks |
| Lines | --admin-line (white 9%), --admin-line-strong (white 16%) | Borders, table row separators |
| Text | --admin-ink (#E9EEF6), --admin-ink-muted (#9BA7BA) | Main and secondary text |
| Accent | --admin-blue (#38B6FF) with --admin-on-blue (#04121C) text | Links, focus rings, active navigation, primary buttons |
| States | --admin-green (#2FD89A), --admin-red (#FF6B78), --admin-amber (#F5B942), --admin-sky (#5CC8FF) | Profit, loss, caution, info |

**Contrast (WCAG), worst case across all four background layers:**
- main text: 13.2:1
- muted text: 6.3:1
- blue accent: 6.8:1
- red: 5.6:1
- the other status colours: 8:1 or more
- dark text on the blue button: 8.4:1

**How the admin uses it.** `.admin-theme` maps the semantic tokens to the palette, without changing any layout:
- `--admin-background`, `-surface-1/2`, `-fill`, `-text`, `-muted` and the state colours;
- inside the admin scope, the shared names point at the palette too: `--accent-1` = row lines, `--accent-2` = blue, `--accent-3` = canvas, and the glass panel and light values.

Panels are solid layer-1 surfaces with a hairline border and a soft shadow, no blur. Dialog and drawer backdrops darken to near-black instead of navy. Usage bars keep their states: blue when safe, amber near the limit, red when breached. `--admin-row` and `--admin-row-compact` (44px / 36px) and `--admin-transition` (180ms) are unchanged.

The only brand moment is /login: the exact landing /video/mid.webp still, blurred and darkened using existing glass filters and navy, with the existing logo, centered glass card and an italic Instrument Serif accent. It never plays video. Login and reauthentication are visual previews only. All new operational fixtures live in apps/admin/src/mocks with one types.ts and enter components through props. Legacy preview reducers and tests are retained as isolated fixtures; rendered action buttons only open dialogs or report a Sample toast and do not mutate records. /dev/components returns 404 in production. Existing user, role, audit and settings screens are restyled rather than rebuilt; new routes start with a titled empty state.

Admin readability refinements: body and table cells are 14px, IDs/numeric values 13px, and all secondary labels are at least 12px. Muted copy uses --admin-ink-muted and is at least 6.3:1 on every admin surface (minimum required 4.5:1). --font-display in the shared admin scope aliases the existing Instrument Serif variable; no new font is introduced. Funded HUB uses the landing’s text wordmark with Admin as its subline. The mock header clock and Snapshot label share SAMPLE_NOW; event and check timestamps derive from that fixture anchor. KPI sparklines stay brand blue; only delta text uses profit/loss colors.
