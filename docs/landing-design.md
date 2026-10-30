# Funded HUB landing

The current direction replaces the previous multi-section landing with the Sellix-inspired, full-viewport globe hero, implemented natively in Next.js, TypeScript, React, and a scoped CSS Module. Updated 30 October 2026 at the user's request.

The homepage pairs Instrument Sans with an italic Instrument Serif accent on the second headline line, white pill actions, a violet globe video, a two-line masked headline reveal, and a mobile menu at 1160px. Two copies of the supplied CloudFront video crossfade at the loop boundary. The first frame/poster is used for reduced-motion and Save-Data visitors. Playback can be paused, and hidden tabs pause automatically. Entrance listeners and timers detach after completion; component unmount cleans up video handlers.

The previous crystal, dashboard illustration, ticker, charts, risk simulator, program cards, payout strip, and long-form sections are removed. Shared UI and the separate admin preview remain available.

Navigation and CTAs open native accessible dialogs with concise Funded HUB product information. There are no dead program/signup links and no fake login, purchase, or payout submission. Program terms, production branding, authentication, enrollment, Bybit integration, support channels, and rewards remain outside this design preview. All challenge accounts described here use simulated capital.

## Files

- `apps/web/src/app/page.tsx`: page metadata and Next.js font loading.
- `apps/web/src/components/landing/landing.tsx`: hero, menu, entrance sequence, and informational dialogs.
- `apps/web/src/components/landing/landing.module.css`: proportional reference layout and responsive styling.
- `apps/web/src/components/landing/video-playback.ts`: globe assets and crossfade lifecycle.

The original standalone Sellix draft is retained separately in `../Sellix-Draft/2/index.html`. External CloudFront media remains at the exact draft URLs; no video is copied into this application.
