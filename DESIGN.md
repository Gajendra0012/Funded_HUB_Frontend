# Cinematic dark — Funded HUB landing

## Direction
A continuous night-side world: blue Earth, deep navy atmosphere, restrained glass instruments. Dark only. The existing hero, Instrument Sans / italic Instrument Serif pairing, navigation, and product copy remain the anchor. No changes to shared tokens, packages/ui, admin, backend, or existing tests.

## Palette and surfaces
Navy ground #071A33; brand blue #3E7CB1; ice blue #9DC3E6; white headlines. Body #E2EBF5. Green and red belong only to sample data visuals; amber signals a nearing risk limit. Glass fill rgba(7,26,51,0.88) for stronger separation, backdrop blur 16px, hairline rgba(255,255,255,0.10), faint inner top-edge glow. Below-hero paragraphs sit on glass. Per the latest user direction, the hero headline and paragraph sit directly over the video with no background cards. Headlines aim for 7:1 contrast; body at least 4.5:1 and 17px. Verify against composited pixels, not only CSS colors.

## World
Fixed background behind the entire page. The supplied blue Earth video is retained in the hero. As the hero leaves, its scale and opacity fall and a pre-darkened, pre-blurred /video/mid.webp fades in. No runtime blur filters on fixed layers. A sparse 2D canvas network has fewer than 60 nodes, capped pixel density, and a low frame rate. It runs only while middle sections are visible and stops for reduced motion, Save-Data, and hidden tabs. A separately cropped and slightly rotated video returns at the final CTA, loaded near that section. At most one video plays, including during transitions. Mobile uses a small video and no parallax. Motion and Save-Data preferences receive stills and static charts.

## Composition
1. How it works: sticky visual on the left, three scroll steps on the right. Program sizes, illustrative Bybit Demo permissions (read, trade data, wallet; no withdrawals), then equity / target with Phase 1, Phase 2, Funded. Active step bright, others subdued but readable.
2. Risk Monitor: the signature wide glass instrument, Sample account label, reactive equity curve, daily P&L slider, three accessible gauges, mono readouts, blue / amber / red states. Grain is a tiny static texture. Limit glow stays inside the panel. Values and targets are disclosed samples.
3. Programs: three glass cards on one aligned baseline, distinct sparklines and one-step / two-step / direct phase tracks. Reference figures are prominently labelled, with mono account values. Fine-pointer spotlight; no card parallax or entry stagger. Reference sizes $5K to $200K and up to 90% reward share, with one-step / two-step / direct phase structures.
4. Payouts: asymmetric composition with a Sample payout card, amount, split, USDT / USDC / BTC, and Requested / Reviewed / Paid stages. No transaction UI.
5. Final CTA: returning planet, huge sans / italic serif headline, one action, glass footer and short risk disclosure.

## Motion
One easing cubic-bezier(.16,1,.3,1), durations .4s / .7s / 1.05s, stagger 75ms. Entry animations play once: masked headline rise; body 8px blur to sharp; numbers count once on visibility. Scroll-linked work updates transform and opacity only. No magnetic CTA motion is necessary. Keyboard focus never moves with the pointer. Reduced motion disables entry transforms, looping work, parallax, and video.

## Performance and verification
Lazy import below-fold sections and canvas with an intersection boundary. Charts use SVG, not a charting library. Single video playback, no WebGL, no large runtime blur. Pause invisible work. Keep shared packages and existing tests intact, add landing-specific checks only where needed. Run lint, types, tests, and production build. Capture each section at 1440, 768, 390px with Playwright when browser control is available; critique alignment, spacing, contrast, overflow, and motion consistency. Report measured Lighthouse mobile performance (target 85+) and accessibility (target 100), never invent results when tooling is unavailable.

The final CTA headline also sits directly over the returning planet, without a glass background card, per the user's visual adjustment. The footer retains its glass surface.

Hero refinement: approximately 1.4× desktop headline size, responsive width-limited phone sizing, generous italic line box, and at least 32px authored gap before an 18px subline. A soft radial navy scrim replaces cards. A 30%-height bottom gradient blends into solid navy. A seeded, pausable Sample prices strip and Sample account SVG dashboard bridge the hero to the process section; the dashboard rises and rotates from 12° to flat on desktop. No motion for reduced-motion / Save-Data. Content width is 1200px; Risk Monitor may reach 1280px. Body copy is at least 17px and mono labels at least 12px. Confident product wording retains Sample labels and the footer risk disclaimer.

Latest adjustment: remove the standalone sample-price ticker above the laptop. The MacBook dashboard retains its sample price feed, Sample account label, and pause-prices control.

Hero cleanup: remove the hero-only Pause background button and small floating risk caption. Retain the below-hero world pause control and footer risk disclosure.

Latest hero adjustment: remove the broad radial scrim. Use localized text shadows on the headline and paragraph so no circular blue overlay obscures the globe. Headline sizing is reduced from the earlier 1.4x version.

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
