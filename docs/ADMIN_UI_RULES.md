# Admin UI rules

## UI-ONLY RULES

Visual work only, in apps/admin and packages/ui. No API calls, no auth logic, no proxy.ts, no cookies or sessions, no zod validation, no changes to apps/api, packages/db or packages/shared. All data comes from typed mock files in apps/admin/src/mocks (one types file), passed into components through props, so swapping in real data later only replaces the source. Buttons that would perform an action only open the matching dialog or show a toast. Use the frontend-design skill and follow DESIGN.md (admin variant: dark, dense, calm, no video, no 3D, no parallax, motion limited to 150 to 200ms transitions). If screens already exist from earlier work, restyle them instead of rebuilding. Keep tokens, fonts and tests. Explain non-obvious decisions briefly.

## BRAND CONTINUITY

The admin must feel like the same product as the landing in apps/web. Do NOT invent new colors, fonts, radii or glass values. Reuse the existing tokens and glass-panel/glass-light definitions in packages/ui, and the palette, Geist and Geist Mono already in use. Only ADD admin-specific tokens when nothing existing fits (surface levels, row density, status colors), and document each addition in DESIGN.md. Raise panel fill opacity for tables and forms where needed for contrast, and say so in the Admin section. The only brand moment is the /login page: a blurred, darkened still of the globe (reuse /video/mid.webp) behind a centered glass card, with the logo and an italic serif accent line. No video there.

## Token inventory

apps/admin uses no raw hex, rgb/rgba, radius or font-family values. Reference tokens defined in packages/ui for colors, border radii and font families.

| Replaced value or use | Shared token or replacement |
| --- | --- |
| Circular 50% radii, or --radius-card used for circles | --radius-full (9999px) for avatars, status dots, permission marks, stepper marks, timeline dots, skeleton avatars and spinners. Keep --radius-card for panels and --radius-control for controls. |
| Direct Instrument Serif variable with a raw serif fallback | --font-display; UI and numeric text retain --font-sans and --font-mono. |
| Inline navy/transparent 78% overlay mixtures | Existing --glass-light-background. |
| Literal transparent backgrounds and inactive navigation borders | Structural background/border resets; active navigation uses --accent-2. |
| SVG and status-dot currentColor declarations in apps/admin | --admin-text, --admin-muted and semantic --state-color aliases. |
