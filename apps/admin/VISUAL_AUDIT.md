# Admin visual review

The requested docs/ADMIN_UI_RULES.md was absent. The user explicitly confirmed using the rules in their message as the complete requirements. Changes are visual presentation and typed mock fixtures only; existing dialog, navigation, selection and toast behavior is retained.

## Non-token inventory and replacements

| Previous non-token use in apps/admin | Replacement |
| --- | --- |
| 50% radii on the user menu avatar, person avatar, permission marks and status dots | Existing packages/ui --radius-card. Controls and panels retain --radius-control / --radius-card. |
| Direct Instrument Serif variable plus a raw serif fallback on login | packages/ui --font-display alias for the same existing Instrument Serif face. Geist and Geist Mono remain --font-sans and --font-mono. No new font. |
| Inline navy/transparent 78% color mixtures on login overlay and dialog backdrops | Existing --glass-light-background. |
| Literal transparent backgrounds and inactive navigation borders | Background/border resets (none / 0), with active navigation using existing --accent-2. No replacement color was invented. |
| SVG currentColor and status-dot currentColor declarations | Existing --admin-text, --admin-muted and the semantic --state-color aliases in packages/ui. |

Final source scan: no hex, rgb/rgba, hsl/hsla, raw radius, direct font-family, currentColor, transparent or NovaEdge occurrences remain in apps/admin/src. Font inheritance, SVG fill=none and CSS background=none are structural resets rather than new palette or font values. Font loaders still instantiate the existing Geist, Geist Mono and Instrument Serif families.

## Typography and contrast

Browser-computed dashboard typography: body 14px, table cells 14px, IDs 13px, no visible text below 12px at 1440px. Existing --admin-muted resolves to landing-tint (#A8C4DC), already exceeding the requested minimum, so no new muted color was added. WCAG sRGB contrast against the resolved admin surface tokens: background 8.50:1; surface-1 7.17:1; surface-2 / hover 5.65:1. Primary copy remains the existing white token. Data states retain the existing profit/loss/caution tokens.

## Screenshot critique and corrections

- 1440px: shortened wrapping KPI comparison copy to “vs prior period”; removed inactive navigation outlines; compressed the six health rows to align the two main cards at 436.5px; kept padding after the last table row. Moved the development indicator to bottom-right so the collapse icon and label remain visible.
- 1024px: replaced the ragged 3+2 KPI grid with a balanced three-column first row and two equal-width cards beneath; changed health to two columns so Checked timestamps stay on one line. The table fits its 734px viewport. No document-level horizontal overflow at either width.
- All KPI sparklines stay blue; only delta text receives green/red. The oldest abuse-review item receives a subtle existing blue accent border. Sample clock, snapshot and health checks share SAMPLE_NOW; event times derive from offsets.

Final Playwright screenshots are delivered alongside this review. Production visibility and required lint, type, test and build results are reported in the chat.


## Operational-screen expansion — commit checkpoint

Added mock-only operational screens, detail views, confirmation/code-entry previews and development-only loading/empty/error query states. The explicitly enumerated permission list contains 16 permissions and all 16 are shown. Existing /users, /audit and /kyc-queue routes remain aliases of the canonical routes.

At this checkpoint, repository lint, admin type checking and 16 admin tests passed. Desktop/mobile spot checks led to fixes for the mobile sidebar/topbar, program phase fixtures and fixed-size chart labels. The requested 324-image capture matrix was interrupted by the user’s request to commit. The complete screenshot critique, final web-design-guidelines review and production build for this expansion are not complete.
