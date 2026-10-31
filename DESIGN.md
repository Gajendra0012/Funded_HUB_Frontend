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

Admin additions are scoped to .admin-theme in packages/ui; nothing changes the landing palette:

| Token | Source and reason |
| --- | --- |
| --admin-background | Existing --accent-3 (#0B2545), alias for workspace background. |
| --admin-surface-1 | 94% accent-3 / 6% existing white, for sidebar and sticky headers. |
| --admin-surface-2 | 92% accent-1 / 8% existing white, for hover, selection and raised controls. |
| --admin-border | Existing glass-light-border, shared hairline. |
| --admin-text / --admin-muted | Existing white / landing-tint, readable operational text. |
| --admin-fill | Existing accent-3 at 96% opacity: tables, forms and dialogs raise panel fill opacity so content stays legible. No new glass recipe. |
| --admin-profit / loss / caution / info / neutral | Aliases of data-profit / data-loss / signal-warning / landing-tint / landing-tint. Only data states receive semantic color; navigation, roles and environments stay neutral. Labels distinguish states without relying on color. |
| --admin-row / --admin-row-compact | 44px / 36px, consistent table density. |
| --admin-transition | 180ms, restrained control transitions. |

Panels use glass-panel-background, glass-panel-border, glass-panel-shadow and glass-panel-still-filter; light controls use glass-light values. Safe usage bars use brand blue, near-limit amber at 80%, breached red at 100%; profit target progress stays blue. Blue accent-2 provides focus rings and active navigation. No new colors, fonts, radii or glass values.

The only brand moment is /login: the exact landing /video/mid.webp still, blurred and darkened using existing glass filters and navy, with the existing logo, centered glass card and an italic Instrument Serif accent. It never plays video. Login and reauthentication are visual previews only. All new operational fixtures live in apps/admin/src/mocks with one types.ts and enter components through props. Legacy preview reducers and tests are retained as isolated fixtures; rendered action buttons only open dialogs or report a Sample toast and do not mutate records. /dev/components returns 404 in production. Existing user, role, audit and settings screens are restyled rather than rebuilt; new routes start with a titled empty state.

Admin readability refinements: body and table cells are 14px, IDs/numeric values 13px, and all secondary labels are at least 12px. Muted copy retains the existing landing-tint token and is checked against each navy surface at a minimum 4.5:1 ratio. --font-display in the shared admin scope aliases the existing Instrument Serif variable; no new font is introduced. Funded HUB uses the landing’s text wordmark with Admin as its subline. The mock header clock and Snapshot label share SAMPLE_NOW; event and check timestamps derive from that fixture anchor. KPI sparklines stay brand blue; only delta text uses profit/loss colors.
