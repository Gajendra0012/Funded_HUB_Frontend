# Day 1 frontend handoff

Scope agreed in chat on 29 October 2026: FE1-01 and the initial FE1-02 foundation from the PM's Sprint 1 plan. This is Day 1 of our implementation, not a claim that the original 26 October kickoff schedule has shifted.

## Delivered

- Local feature branch `codex/feat/frontend-foundation`; no ticket number invented.
- pnpm frontend workspace: web app and source-exported UI package.
- Node 24 LTS pin, dependency lockfile, lint, type-check, build, and component tests.
- Reference-derived dark tokens, Geist and JetBrains Mono fonts, spacing, surfaces, button states, labeled inputs, cards, and badges. Muted/error colors are lightened for readability.
- Crypto-only placeholder homepage and a component review page; reference branding clearly marked provisional.
- Framework, auth-boundary, and CSP notes in `nextjs-16-notes.md`.

FE1-02 is a foundation pass, not a completed port of every reference component or page. FE1-03 public/legal shells and FE1-04 onward authentication remain separate tasks.

## Integration questions before subsequent tasks

Confirm the backend API contract, cookie/origin setup and shared validation ownership; approved brand assets; actual country restrictions/legal text; admin frontend ownership; and whether this frontend workspace remains separate or joins the proposed full monorepo. Do not implement a fake login while these details are pending.

## Verification

- `pnpm lint`: passed with zero warnings.
- `pnpm typecheck`: passed, including generated route types and shared UI source.
- `pnpm test`: four shared-control tests passed (loading/disabled buttons and accessible field descriptions).
- `pnpm build`: production build passed; homepage, component library, and 404 render statically.
- Production preview on `http://127.0.0.1:3100`: inspected homepage at 1440x1000, 390x844, and 320x740; component library at desktop and mobile widths; no horizontal overflow in the tested views.
- Browser checks: section navigation, component library/home navigation, missing-page recovery, skip-to-main focus, field label/error associations, and keyboard movement between inputs passed. Component library console check returned no errors or warnings before the intentional 404 test.
- The browser viewport override was restored after testing. Fonts are served locally.

Not checked: full accessibility conformance, other browser engines, Docker, deployment, CI, API integration, auth, or a formal QA pass. There is no Docker configuration or production API in Day 1 scope. Nothing has been pushed, merged, deployed, or marked done in Zoho.
