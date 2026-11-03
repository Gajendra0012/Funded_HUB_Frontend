# FE1-01: Next.js 16 notes

Reviewed 29 October 2026 against the installed Next.js **16.3.8** documentation in `apps/web/node_modules/next/dist/docs/01-app/`. This is the 16.3 patch line specified by the PM plan; React stays on 19.2. Version and dependency resolution are recorded in `bun.lock`. The login section was rewritten on 3 Nov 2026 for Supabase Auth (WEB-02).

## Routing and runtime

- App Router files live under `apps/web/src/app`; root `layout.tsx` supplies metadata and shared chrome. Pages are Server Components by default; use `use client` only for interactive boundaries.
- Next.js 16 uses `proxy.ts` rather than the old middleware convention. Place it beside `src/app` when needed. Proxy runs on Node.js and is useful for redirects and request headers, not slow fetching or complete authorization.
- `cookies()`, `headers()`, route `params`, and page `searchParams` are asynchronous. Await them in server code. Do not copy legacy synchronous auth code from older examples.
- Turbopack is the default for development and builds. `next lint` is removed; this workspace runs ESLint directly. Build does not replace lint or type-check commands.

## Authentication integration

Login is **Supabase Auth** (decision of 31 Oct 2026, replacing the earlier plan of a backend-owned session cookie). Plans: `docs/WEB_BUILD_PLAN.md` (trader website) and `docs/ADMIN_BUILD_PLAN.md` (admin app).

- **Who does what.** The browser uses the Supabase SDK with the **publishable key** for sign-up, login, 2FA (TOTP), email verification and password reset. Our API never sees a password: it receives the Supabase access token as `Authorization: Bearer …`, verifies it, and checks the profile, `aal` and permissions itself. No backend session cookie or CSRF token.
- **Session in cookies.** `@supabase/ssr` keeps the session in cookies, so `proxy.ts`, Server Components and route handlers read the same login. Server Components can't set cookies, so `proxy.ts` renews the session on each request (`auth.getClaims()` right after creating the client). When it renews, Supabase's no-store headers must reach the browser; checked in production on 3 Nov: the response is `private, no-store` even for prerendered pages.
- **Verify, don't trust.** On the server, check the login with `auth.getClaims()` (verifies the token's signature), never `auth.getSession()` (reads the cookie as is). Whether a trader has 2FA comes from Supabase (`auth.getUser()`), never from the cookie's copy, which the browser can edit.
- **Two layers.** A `proxy.ts` check is only an optimistic redirect. Check again on the server near protected data (a cached `verifySession()`-style function in the layout), and the API checks every call. Hiding navigation or checking only a layout is insufficient.
- **2FA levels.** Admins always need `aal2`. Traders need `aal2` once they turned 2FA on. Session lengths: traders 7 days (Supabase time-box, project-wide), admins 12 hours (enforced by the admin app and the backend).
- **Email links** (verify email, reset password) come back to a route handler (`app/auth/confirm/route.ts`, `verifyOtp` with `token_hash`). Build every link from the configured `NEXT_PUBLIC_SITE_URL`, never from the request's host, and accept only same-site `next` paths.
- Never treat localStorage, a client context, a demo login, or a user-supplied role as authorization. Do not port the reference's simulated auth into production.
- Client validation improves feedback; the API and Supabase repeat it. Send the signup data exactly as the backend contract's `SignUpMetadata` (unknown fields are refused). Avoid installing a second auth system or inventing backend endpoints.
- Signup requires country eligibility, versioned consent, the 18+ declaration, optional marketing opt-in and keeping the referral code. Login needs generic errors, the TOTP step, and a "too many attempts" message (Supabase rate limits; no account lockout or backup codes, see the web plan's WD5).

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

Supabase: [server-side auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs), [password-based auth](https://supabase.com/docs/guides/auth/passwords), [MFA](https://supabase.com/docs/guides/auth/auth-mfa), [sessions](https://supabase.com/docs/guides/auth/sessions).
