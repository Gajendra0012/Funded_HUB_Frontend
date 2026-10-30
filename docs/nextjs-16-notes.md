# FE1-01: Next.js 16 notes

Reviewed 29 October 2026 against the installed Next.js **16.3.8** documentation in `apps/web/node_modules/next/dist/docs/01-app/`. This is the 16.3 patch line specified by the PM plan; React stays on 19.2. Version and dependency resolution are recorded in pnpm-lock.yaml.

## Routing and runtime

- App Router files live under `apps/web/src/app`; root `layout.tsx` supplies metadata and shared chrome. Pages are Server Components by default; use `use client` only for interactive boundaries.
- Next.js 16 uses `proxy.ts` rather than the old middleware convention. Place it beside `src/app` when needed. Proxy runs on Node.js and is useful for redirects and request headers, not slow fetching or complete authorization.
- `cookies()`, `headers()`, route `params`, and page `searchParams` are asynchronous. Await them in server code. Do not copy legacy synchronous auth code from older examples.
- Turbopack is the default for development and builds. `next lint` is removed; this workspace runs ESLint directly. Build does not replace lint or type-check commands.

## Authentication integration (later Sprint 1 tasks)

- PM plan: backend-owned opaque session cookie, HttpOnly + Secure + SameSite=Lax; trader session 7 days, admin 12 hours. Confirm API origin, cookie domain/path, CORS, CSRF strategy, DTOs and error formats with backend before connecting forms.
- A proxy cookie check is only an optimistic redirect. Validate sessions and permissions server-side near protected data and on every API/mutation. Hiding navigation or checking only a layout is insufficient.
- Never treat localStorage, a client context, a demo login, or a user-supplied role as authorization. Do not port the reference's simulated auth into production.
- Client validation improves feedback; the API must repeat validation. Share the agreed schemas when the backend contract exists. Avoid installing a second auth system or inventing backend endpoints.
- Signup will require country eligibility, versioned consent, 18+ declaration, optional marketing opt-in, and preservation of referral attribution. Login must support TOTP/backup codes, generic errors, and lockout feedback. These screens are outside Day 1.

## Data security

- Follow the installed `02-guides/data-security.md`: fetch from the backend with server-side authorization, pass only minimal public DTOs to Client Components, and keep sensitive modules server-only.
- Never put session tokens, Bybit secrets, provider keys, or private account records in public environment variables, browser storage, logs, URLs, or git. `NEXT_PUBLIC_` values are exposed to the browser.
- Treat Server Actions and Route Handlers as public endpoints: validate input and authorization independently. Authenticated data must not enter a cross-user cache.

## Content Security Policy

- Read installed `02-guides/content-security-policy.md` before deployment. A nonce must be unpredictable and fresh per request, applied to request and response headers, and requires dynamic rendering; a static page cannot reuse a fixed nonce safely.
- Development may need `unsafe-eval`; production should not inherit it. Fonts are self-hosted here, simplifying `font-src`.
- Day 1 does not claim a CSP implementation or security hardening. Coordinate CSP with the API/WebSocket endpoints, Sentry, required scripts, and deployment topology. Verify the final policy in the browser instead of copying a policy that breaks hydration.

## Sources

Installed guides: `01-getting-started/16-proxy.md`, `02-guides/upgrading/version-16.md`, `02-guides/authentication.md`, `02-guides/data-security.md`, `02-guides/content-security-policy.md`.

Official references: [Version 16](https://nextjs.org/docs/app/guides/upgrading/version-16), [authentication](https://nextjs.org/docs/app/guides/authentication), [data security](https://nextjs.org/docs/app/guides/data-security), [CSP](https://nextjs.org/docs/app/guides/content-security-policy).
