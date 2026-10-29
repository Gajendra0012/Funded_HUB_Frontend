# Landing implementation

## Design

Five sections: dark hero, light process, dark Risk Monitor, light programs, dark CTA/footer. The headline remains “Less noise. More nerve.” Bodoni Moda provides display typography, Manrope supplies lead/body text, and IBM Plex Mono supplies labels and numerical data. Body text is at least 18px with 1.6 line-height; labels are at least 12px.

## Decisions

- Shared navy/blue/white tokens provide the base palette. Separate warning/danger tokens retain at least 7:1 text contrast on the monitor's navy surface without changing the admin/form semantic colors.
- Inactive process steps use softer colors instead of reduced opacity so their text remains readable. A single sticky numeral follows scroll position; steps stay in normal document order.
- The Risk Monitor uses a native range input for keyboard and touch operation. A polite status region announces threshold changes. Accessible meter values cap at their valid maxima, while their descriptive text preserves the actual exceeded value. A reached profit target stays blue; only loss limits cause warnings or breaches.
- The sample opening drawdown allows both loss bars to demonstrate warning/breach states within the slider range. These fixtures are not production risk calculations.
- The crystal uses MeshPhysicalMaterial, physical transmission, a blue Fresnel rim and a procedural RoomEnvironment/PMREM environment map. No downloaded model, HDR, drei or postprocessing dependency is used.
- Mobile and reduced-motion views use a static dark poster. Desktop DPR caps at 1.5; off-screen, hidden-tab and user-paused rendering stops. Context recovery rebuilds the environment map. A pause control accompanies continuous idle rotation.
- Program reference figures come from the existing demo fixtures and remain explicitly labeled. Hover/focus lift and arrow reveal are disabled or static under reduced motion.

## Verification

Production build and TypeScript passed. Landing/shared UI lint passed. Ten web tests cover shared control accessibility, reference fixtures, landing semantics and sample simulator boundaries.

Chromium checks cover 320/360/768/1440px layouts, scroll numerals, keyboard slider controls, truthful over-limit meter text, both loss-limit statuses, visible keyboard focus, live reduced-motion changes and actual WebGL loss/recovery. Observed mobile Lighthouse scores: 100 performance, 100 accessibility, CLS 0. Body-copy contrast measured at least 7.94:1; monitor signal text meets 7:1 on its dark surface.

Physical-device FPS and manual screen-reader testing were not performed. `/programs` remains an unimplemented destination. No backend/provider functionality, production offers or legal terms were verified.
