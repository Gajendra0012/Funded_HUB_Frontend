# Admin frontend preview

Built at the user's request on 29 October 2026. Separate Next.js app at `apps/admin`, reusing `packages/ui` and the confirmed navy/blue/white PDF palette. No backend, authentication provider, database, real user records, account secrets or outbound email are connected.

## Run

From repository root: `pnpm dev:admin` for development, or `pnpm build` then `pnpm start:admin` for production preview. Admin runs only on `http://127.0.0.1:3101`. The public landing remains on its own port/app.

## Screens

- `/`: overview derived from fictional team data and local audit events; no fabricated business revenue.
- `/users`: searchable/filterable staff directory; add an in-memory invitation, edit name/email/roles, disable/re-enable sample users after confirmation. No invitation email is sent. Current preview admin and last active admin are protected by local preview invariants.
- `/roles`: read-only planned permission matrix, transcribed from Sprint 1 Detailed Plan pp. 10–11. It does not enforce authorization.
- `/audit`: actor/entity/IP search, action and inclusive UTC-date filters, before/after detail dialog. No edit/delete controls. Seed IPs are documentation-only addresses.
- `/settings`: sample platform identity, fixed UTC display, and example country-exclusion controls. No country is excluded by default; the list is a limited UI specimen, not an approved eligibility policy. Saves are recorded in the preview audit stream and do not change the public app.

All changes are held in a root React provider and survive navigation only. Reload or the confirmed "Reset sample data" action restores the seed state. The reset is not a production data deletion operation. No credentials or private data should be entered.

## Sprint boundary

This implements the frontend shell and sample UI behavior for AD1-01 and portions of AD1-03–06. It does **not** complete AD1-02 (mandatory 2FA/admin login), AD1-07 (protected routes, real permission checks, 12-hour sessions/re-auth), or backend acceptance criteria. There is no fake authentication bypass or client-side role switch masquerading as security.

Before production, connect the agreed admin API, protect every route and mutation, implement mandatory 2FA and re-authentication, replace fixtures with authorized DTOs, and write durable server audit events. Do not deploy this preview as an authenticated admin system.

## Verification

- Root lint and both app type-checks passed. Fourteen tests passed (seven existing web tests, seven admin preview transition tests). Both production builds passed; the affected admin checks/build were rerun after final fixes.
- Browser checked desktop at 1440px and phone at 390px; all five pages checked at 320px with no document-level horizontal overflow. Wide tables scroll within their panels. Fixed hidden table headers escaping the narrow scroll container.
- Verified required-role validation, sample user creation, search, editing roles, confirmed disabling, before/after audit detail, audit empty state, invalid date-range feedback using native date keyboard input, settings save/normalization, mobile navigation, and reset restoring seed data and form state.
- Final console check returned no errors or warnings. Sample edits were reset; viewport override restored. Desktop/mobile screenshots saved in the chat artifacts.
- Not checked: real authentication/2FA, server permissions, invitation delivery, provider integrations, durable audit guarantees, production deployment, or full cross-browser/accessibility conformance. No changes were committed, pushed or deployed.
