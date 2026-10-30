# Funded HUB — cinematic dark landing

The current landing follows DESIGN.md. It keeps the existing blue Earth hero, Instrument Sans / italic Instrument Serif headline, and product copy. The page now continues through How it works, Risk Monitor, Programs, Payouts, and a final CTA with a glass footer. Below-hero paragraphs have a glass surface. The hero headline and paragraph are card-free, directly over the video, per the latest user direction. The public route is dark only; shared design tokens, packages/ui, admin, and backend are unchanged.

## World and performance

The background is fixed. Motion values map the hero exit to planet scale and opacity, exposing the pre-darkened, pre-blurred /video/mid.webp. There is no CSS blur filter on a large fixed layer. The final CTA loads another cropped, slightly rotated video instance near its section. The playback manager always pauses both instances before playing the selected one. In the middle, neither video plays.

The 42-node, 20 fps 2D network is a dynamic import. It exists only in the middle world, respects the page visibility state, caps pixel density at 1.5, and is omitted for reduced motion and Save-Data. A persistent pause button remains available beyond the hero. Mobile receives /video/hero-mobile.mp4 and no card parallax. The mobile video is about 536 KB; the middle still is about 6 KB. The original 4K source is unchanged.

Sections are dynamically imported near the viewport with reserved placeholders. Data visuals use SVG; no charting library, GSAP, WebGL, smooth scrolling dependency, magnetic CTA physics, or continuously scrolling ticker was added. The hero uses a four-second sample quote feed, not a live market connection. Section entry uses Motion and the same easing and duration vocabulary as the hero. Body focus pulls are local entry effects, never large fixed-layer filters.

## Sample instruments and actions

The process panel has keyboard-operable step previews and a scroll-active step. Its Bybit connection is explicitly illustrative and does not connect an account. The risk slider clamps daily P&L to -6% through +10%, models profit progress from 7.6% and drawdown from 4.4%, and treats profit target completion separately from loss breaches. Gauges expose their actual values and capped meter ranges. Program figures and payout stages are samples, not approved offers or payment evidence. Existing informational dialogs remain available; Programs and How it works navigation also reach the new sections.

## Verification

See landing-qa.md for checks, audit fixes, source-pixel contrast calculations, and explicitly unmeasured browser results. Existing test files are preserved; new tests cover the cinematic sample instruments and single-video playback budget.

## Latest refinement

The hero is approximately 1.4x larger on desktop, with a width-limited phone size, generous italic line box, 32px subline gap, 18px supporting text, and a feathered radial scrim. A 30%-height bottom gradient blends into navy. The bottom Sample prices strip and peeking Sample account dashboard use one injected PriceSource adapter with seeded quotes and candles; they tick only after mount while visible and can be paused independently of the world. No live-market connection is implied.

Usable content width is 1200px, with Risk Monitor up to 1280px. Glass opacity is .88, with a denser .94 Risk Monitor. Mono labels are at least 12px and body copy at least 17px. Programs sit on a common baseline with no stagger or parallax, show $5K to $200K / up to 90% Reference figures, and retain unique phase structures and sparklines. The payout panel is flat. Marketing copy is confident while Sample labels and the footer risk disclosure remain.

See landing-qa.md for current validation and the explicitly unmeasured screenshot, rendered contrast, and Lighthouse results.
