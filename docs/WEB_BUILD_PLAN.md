# Trader Website Build Plan: sign-up, login and 2FA

**Goal:** real trader accounts on the trader website (`apps/web`): registration, email verification, login, password reset and 2FA, then a dashboard only signed-in traders can open. We work **one build order at a time**, in the order of the Sprint 1 demo.

- Created: 3 Nov 2026
- Progress: **4 of 25 steps done** (WO-1 ☑) · next order: **WO-2**
- The admin app has its own plan: `docs/ADMIN_BUILD_PLAN.md` (orders AO-…). This plan uses its own IDs, so the two never clash:
  - orders **WO-1 …**
  - steps **WEB-01 …**
  - backend gaps **WG1 …**
  - open questions **WD1 …**

---

## 1. Sprint 1 target: due for the demo on Wed 4 Nov

The Sprint 1 deliverables promise:

> **Staging site: registration, email verification, login, password reset, 2FA**

The backend's delivery pack (`docs/SPRINT_1_DELIVERY.md` on backend `dev`, `1d4c8bf`) says how the client checks it:

> Public staging URL and a QA recording showing registration, email verification, login, TOTP enrollment and challenge, password reset and subsequent login.

**The demo script**, from the same document, section 7:
1. register, accepting the Terms and Privacy
2. verify the email through the mailbox
3. log in
4. turn on 2FA (authenticator app)
5. log out
6. log in with the password and the 2FA code
7. reset the password through the mailbox
8. log in with the new password and the 2FA code

### What is done and what is left (Sprint 1 trader tasks)

| Task | What the sprint asks | Web app today | Backend `dev` today (`1d4c8bf`) | Left to do | Order |
|---|---|---|---|---|---|
| FE1-01 | Next.js 16 notes | ☑ `docs/nextjs-16-notes.md` (29 Oct); login section rewritten for Supabase Auth on 3 Nov (WEB-02) | n/a | Nothing | — |
| FE1-02 | Port the demo design system | ☑ Done 2 Nov (the approved sample is in `apps/web`) | n/a | Nothing | — |
| FE1-03 | Public shell with legal pages | Header, footer and landing done. Terms, Privacy and Risk are pop-ups only, with no pages of their own | ❌ No Terms or Privacy versions in the database (WG3) | Legal pages that the signup form can link to | WO-2 |
| FE1-04 | Sign-up | Fake form: any input "works"; fake "Sign up with Google" | ✅ Signup check in Supabase (country, 18+, Terms/Privacy version); ✅ list of blocked countries; ✅ latest Terms/Privacy | Real Supabase signup with the backend's fields | WO-2 |
| FE1-05 | Verify-email pages | None | ✅ Supabase sends the email (confirmation is on) · ❌ email templates for links that work in any browser (WG1) | Check-your-inbox, verified, link-expired + resend | WO-3 |
| FE1-06 | Login with the 2FA code | Fake: any email and password work; "Continue as Demo Trader" | ✅ Supabase login and TOTP · ❌ lockout · ❌ backup codes | Real login, then the 2FA code if 2FA is on | WO-4, WO-5 |
| FE1-07 | Forgot / reset password | Fake: shows a toast | ✅ Supabase reset email · ❌ template (WG1) | Forgot page, reset page | WO-6 |
| FE1-08 | Profile and security | Fake QR code (not scannable), fake session list | ✅ Supabase 2FA and password change · ❌ session list · ❌ backup codes | Real 2FA on/off; change password; sign out other devices | WO-5, WO-8 |
| FE1-09 | Protected dashboard | The browser hides it until the demo login (`localStorage`); nothing on the server | ❌ `GET /api/v1/me` is in the contract but not built (WG2) | `proxy.ts` + server check; real name and email | WO-4 |
| FE1-10 | Forms, errors, loading | The sample's own forms only | n/a | Shared validation, loading and error states | WO-9 |
| FE1-11 | Phone and accessibility | The sample is responsive; new pages not checked | n/a | Check every new page | WO-9 |
| — | Live on **staging** | Not deployed | Not deployed | Hosted Supabase, email sender, deploy | WO-10 |

✅ = built on backend `dev` · ❌ = missing on the backend (section 6, "Backend gaps")

**Short answer: what's left.** All of the trader login work. The web app still has only the sample's fake login. The backend side is mostly ready: Supabase does login, emails, reset and 2FA, and backend `dev` added the signup check today. Three backend items block or weaken the demo: Terms/Privacy versions (WG3, blocks every signup), email templates (WG1) and `GET /me` (WG2).

### Is it doable for tomorrow?

- **Rough time:** the demo path (WO-1 to WO-7) is about **10 hours**. The admin app still has AO-4 to AO-7 (about 6 hours). Both don't fit in one day.
- **Biggest risk:** staging (WO-10, same as admin AO-8). Without hosted Supabase, an email sender and a deployed site, the demo can only run on this computer.
- **If time runs out, build in this order:** WO-1 → WO-2 → WO-3 → WO-4 (register, verify, log in). Then WO-5 (2FA) and WO-6 (reset). Each order works on its own, so the demo can show whatever is finished.

---

## 2. Build orders (do them in this order)

### How every build order works

1. **Read first:**
   - `docs/final docs/ENGINEERING_STANDARDS.md` (sections 1 and 10: the standard preamble)
   - the backend at `dev` `1d4c8bf`: `docs/SPRINT_1_STAGING.md`, `docs/SPRINT_1_DELIVERY.md`, `src/contracts/sign-up.ts`, `src/contracts/agreements.ts`, `src/contracts/profile.ts`, `supabase/config.toml` (the `[auth]` sections)
   - Supabase Auth docs: server-side auth for Next.js, password-based auth, email templates, MFA (TOTP), auth hooks
   - the Next.js 16 guide in `apps/web/node_modules/next/dist/docs/`: `01-app/02-guides/authentication.md`, `data-security.md`, `01-app/01-getting-started/16-proxy.md`, `01-app/03-api-reference/03-file-conventions/proxy.md` and `route.md`
   - `DESIGN.md` (the web theme)
2. **Check before building.**
   - New packages: check their current versions and security advisories.
   - Gaps or conflicts: report them **before** building. Stop if one blocks the work.
3. **Build production-grade:**
   - secure, typed, tested
   - no secrets in the browser (only the Supabase publishable key)
   - no fake success: a demo button or a sample value is removed or clearly labelled
   - reuse the admin app's login code where it fits (AO-2). Move shared parts to a shared package; don't copy them.
4. **Finish with the "Done means" checklist** (section 3), then **report back:**
   - files changed
   - commands run
   - test and check results
   - commit hash
   - gaps found
   - anything the backend engineer must know
5. **Commit:** one commit per order on the frontend `dev` branch, with the order and step IDs in the message, e.g. `WO-2 (WEB-05, WEB-06): legal pages and real registration`. Push only when the user says so.

### Order list

| Order | Goal | Steps | Needed for | Rough time | Status |
|---|---|---|---|---|---|
| **WO-1** | Local backend with the signup check; web app settings; Supabase connection | WEB-01, WEB-02, WEB-03, WEB-04 | Demo | 1.5 h | ☑ 3 Nov |
| **WO-2** | Legal pages and real registration | WEB-05, WEB-06 | Demo | 2 h | ☐ |
| **WO-3** | Email verification | WEB-07, WEB-08 | Demo | 1.5 h | ☐ |
| **WO-4** | Login, logout and the protected dashboard | WEB-09, WEB-10, WEB-11 | Demo | 2 h | ☐ |
| **WO-5** | Trader 2FA: turn on and off, code at login | WEB-12, WEB-13 | Demo | 1.5 h | ☐ |
| **WO-6** | Forgot and reset password | WEB-14, WEB-15 | Demo | 1.5 h | ☐ |
| **WO-7** | Sprint 1 trader demo check | WEB-16 | Demo | 0.5 h | ☐ |
| **WO-8** | Security page: change password, sign out other devices | WEB-17, WEB-18 | Sprint 1 | 1.5 h | ☐ |
| **WO-9** | Forms, errors, phone and accessibility pass; tidy-up | WEB-19, WEB-20, WEB-21 | Sprint 1 | 2 h | ☐ |
| **WO-10** | Trader website on staging | WEB-22 | Sprint 1 (client acceptance) | 1 h + infra | ⏸ needs staging infra |
| **WO-later** | Waiting for the backend or a decision | WEB-23, WEB-24, WEB-25 | Later sprints | — | ⏸ |

### Order cards

#### WO-1 · Setup
- **Steps:**
  - WEB-01: local backend on `1d4c8bf`, with test Terms and Privacy
  - WEB-02: update the Next.js notes (login section)
  - WEB-03: web app settings
  - WEB-04: Supabase connection
- **Before you start:**
  - Docker Desktop is running.
  - The admin app uses the same local backend. Agree a moment to update it, so that work isn't interrupted.
- **Done when:**
  - the backend runs `1d4c8bf`, with the signup check switched on in local Supabase
  - a test signup through Supabase is refused for a blocked country and accepted with the current Terms and Privacy
  - the web app starts with its settings, and stops with a clear message without them
  - the admin login still works (checked by hand, see WEB-01)
- **Not in this order:** any screen changes.

#### WO-2 · Legal pages and registration
- **Steps:** WEB-05 (legal pages), WEB-06 (registration).
- **Done when:**
  - a new trader can register with the real fields
  - a blocked country, a missing 18+ tick and an old Terms version are each refused with a clear message
  - the verification email arrives in Mailpit (http://127.0.0.1:54324)
- **Tests:** unit tests for the signup data and every refusal message; one real run against local Supabase.
- **Not in this order:** the verification pages (WO-3).

#### WO-3 · Email verification
- **Steps:** WEB-07 (the link handler), WEB-08 (the pages).
- **Done when:**
  - the email link signs the trader in and opens the dashboard
  - a used or expired link shows "This link has expired" with a resend button
  - resend waits 60 seconds between emails
- **Tests:** a real run with Mailpit: verify, reuse the link, resend.

#### WO-4 · Login, logout and the protected dashboard
- **Steps:** WEB-09 (login), WEB-10 (page protection), WEB-11 (dashboard with the real trader).
- **Done when:**
  - a wrong email or password shows one generic message
  - an unverified account is told to verify, with resend
  - no dashboard page opens without a login, and logout closes them again
  - the fake demo login is gone
- **Tests:** unit tests for the protection rules; a real run.

#### WO-5 · Trader 2FA
- **Steps:** WEB-12 (turn 2FA on and off), WEB-13 (the code at login).
- **Done when:**
  - a trader can turn on 2FA with a real authenticator app (scannable QR code)
  - from then on, login asks for the code, and a wrong code is refused
  - turning 2FA off needs a fresh code
  - a trader with 2FA can't open the dashboard with the password alone
- **Not in this order:** backup codes (WD5).

#### WO-6 · Forgot and reset password
- **Steps:** WEB-14 (forgot page), WEB-15 (reset page).
- **Done when:**
  - the reset email arrives, and the same message shows for unknown emails
  - the new password works and the old one doesn't
  - a trader with 2FA must enter the code during the reset
  - other devices are signed out after a reset
  - a used link is refused

#### WO-7 · Sprint 1 trader demo check
- **Steps:** WEB-16.
- **Done when:** the demo script (section 1) passes end to end on this computer, with screenshots saved for the QA record.

#### WO-8 · Security page extras
- **Steps:** WEB-17 (change password), WEB-18 (other devices).
- **Done when:** changing the password works (with the emailed code when Supabase asks for it), and "Sign out other devices" works.
- **Not in this order:** a list of devices with "sign out" for each one (WG6).

#### WO-9 · Forms, errors, phone and accessibility
- **Steps:** WEB-19 (forms and errors), WEB-20 (phone and accessibility), WEB-21 (tidy-up).
- **Done when:** every new form has validation, loading and error states; every new page works on phone and desktop and with the keyboard; the decisions in WD1–WD4 are applied.

#### WO-10 · Staging
- **Steps:** WEB-22.
- **Blocked by:** hosted Supabase, an email sender (SMTP), a host for the web app and a deployed backend. Owner: the manager and backend engineer (same as admin AO-8).
- **Done when:** the demo script passes on the staging address with a real mailbox.

---

## 3. Rules for every step

1. **One build order at a time, in order.** If a step is blocked, mark it ⏸ with the reason and move on.
2. **Use the backend contract exactly.** The signup data must match `SignUpMetadata` (contract v1.1.0): the backend refuses unknown fields.
3. **No fake security.**
   - Login, 2FA and protection are real or not shown.
   - Never treat `localStorage`, a client store or a demo login as a login.
4. **Never reveal whether an email has an account.** Signup, resend and forgot password show the same message either way. Login errors are generic.
5. **Links go only to this site.** `?next=` and email links accept same-site paths only. Email links are built from the configured site address, never from the request's host.

### Done means

A step is ☑ only when all of these are true:

- [ ] `bun run lint` passes
- [ ] Web type check passes (`bun run --cwd apps/web typecheck`)
- [ ] Web tests pass, and new logic has new tests (`bun run --cwd apps/web test`)
- [ ] The flow works against **local Supabase and backend `dev` `1d4c8bf`**, with real emails read in Mailpit
- [ ] The page works at http://127.0.0.1:3000 on desktop and phone width
- [ ] Every new button and form field has a `data-testid`
- [ ] This file is updated: status, date, short note

**Status:** ☐ to do · ◐ in progress · ☑ done · ⏸ blocked

---

## 4. Where we are (3 Nov 2026)

### Web app (`apps/web`)

- **The approved sample, with a fake login.** The login lives in the browser (`useDemoStore` in `src/lib/store.ts`, saved in `localStorage`). Any email and password "work".
- **Fake buttons:** "Continue as Demo Trader", "Sign up with Google", "Forgot password?" (only a toast), and the landing page's demo button, which signs in a demo trader.
- **The dashboard** is hidden by the browser until the demo login (`DashboardShell`). Nothing checks on the server.
- **Settings › Security:** the QR code is decorative (not scannable) and the session list is fake.
- **Legal texts** are pop-ups (`LegalModal`), with no pages to link to.
- **The country list** has 54 countries; signup needs the full list.
- **A sample admin page** (`/admin`, with "Admin preview" in the footer) sits inside the trader site, separate from the real admin app.
- **Since WO-1 (3 Nov):** a settings file and startup check, the Supabase connection, and a `proxy.ts` that keeps a login fresh. No real login screens yet.

### Backend (`dev` at `1d4c8bf`, 3 Nov, by DhruvVerseX)

The commit "Complete Sprint 1 backend handoff and signup controls" added:

- **A signup check inside Supabase** (a "before user created" hook, `public.validate_trader_signup`). It refuses a signup when:
  - the first or last name, the country or the 18+ declaration is missing or invalid → `VALIDATION_FAILED`
  - the country is on the blocked list → `COUNTRY_RESTRICTED`
  - a date of birth is given and the person is under the minimum age (18) → `UNDER_AGE`
  - the Terms or Privacy version on the form isn't the latest one → `CONSENT_REQUIRED`

  The refusal reaches the browser as an error from `supabase.auth.signUp`: status 400 or 403, and the message starts with the code, e.g. `COUNTRY_RESTRICTED: Sign-ups from your country are not available.`
- **Saving at signup:** the new profile and both acceptances are saved in one step (without IP address or browser details).
- **Two public endpoints** for the signup form: `GET /api/v1/public/restricted-countries` and `GET /api/v1/public/agreements/{TERMS|PRIVACY}/latest`.
- **Supabase settings:**
  - email confirmation on
  - passwords of at least 10 characters
  - "secure password change" on
  - 60 seconds between emails to the same address
  - email links expire after 1 hour
  - TOTP 2FA on
  - site address `http://127.0.0.1:3000`
- **Admin privileges in the database now require 2FA (`aal2`).** No effect on traders.

**Not there yet:**
- Terms and Privacy versions in the database: **every signup is refused** until they exist (WG3)
- `GET /api/v1/me` and `PATCH /api/v1/me`: in the contract, not built (WG2)
- `POST /api/v1/agreements/{version_id}/accept`: in the contract, not built (WG5)
- email templates for links that work in any browser (WG1)
- session list, login history, lockout, backup codes, security emails (WG6, WG7)
- staging (WG9)
- one setting lets signup reveal which emails have accounts (WG11)

**Tested by the backend:** the signup check as a database function, and profile + acceptance saving. **Tested in WO-1 (3 Nov):** real signups through Supabase and the hook, 17/17 (WEB-01). The local backend now runs `1d4c8bf`, with test Terms and Privacy.

---

## 5. Steps

### Setup (WO-1)

#### WEB-01 · Local backend on `1d4c8bf`, with test Terms and Privacy ☑ *(3 Nov)*

**Done on 3 Nov:**
- The backend worktree is on `1d4c8bf`. Both new migrations are applied (`migration up`; data kept: 4 admins, their 2FA), and local Supabase was restarted with the new settings.
- Test Terms and Privacy versions `0.1-local` were added; `GET /api/v1/public/agreements/{TERMS|PRIVACY}/latest` answers.
- **Signup through Supabase, 17/17 checks:**
  - refusals arrive as documented: `VALIDATION_FAILED` 400, `CONSENT_REQUIRED`, `UNDER_AGE` and `COUNTRY_RESTRICTED` 403 (the blocked-country list was set to a test code and put back afterwards)
  - a 9-character password → 422 `weak_password`
  - refused signups create no account
  - a good signup saves the profile and both acceptances; the email arrives in Mailpit with Supabase's default link (WG1); the link confirms it; then the login works
  - before confirming, login → `email_not_confirmed`
  - the same unconfirmed email within 60 s → 429 `over_email_send_rate_limit`
  - a confirmed email signed up again → 422 `user_already_exists` (WG11)
- The test traders were deleted afterwards. The admin login wasn't run by script (it uses your phone's 2FA); its pages still answer and still redirect to `/login`.
- **Build:**
  1. In the backend worktree `E:\Prop\Funded_Hub_backend-dev`: `git fetch origin` then `git checkout --detach origin/dev` (`1d4c8bf`). Nothing is committed in the backend repo.
  2. Apply the two new migrations without wiping data: `npx supabase migration up`.
  3. Restart local Supabase so it loads the new settings (signup check, email confirmation): `npx supabase stop`, then `npx supabase start`. The data is kept.
  4. Add **test** Terms and Privacy versions (local only; staging needs the client's real ones, WG3):

```sql
insert into public.agreement_versions (type, version, file_url, published_at) values
  ('TERMS',   '0.1-local', 'http://127.0.0.1:3000/legal/terms',   now()),
  ('PRIVACY', '0.1-local', 'http://127.0.0.1:3000/legal/privacy', now());
```

  5. Restart the backend API (`npm run dev`, Node 26).
- **Check:**
  - a signup through Supabase with a blocked country is refused, and with the current versions is accepted (the profile and both acceptances are saved)
  - the verification email shows up in Mailpit
  - the admin login still works. Check it by hand: automated tests must never use `admin@example.com`, which has your phone's 2FA. Tests use their own trader accounts, created through signup.
- **Backend:** Live · **Order:** WO-1

#### WEB-02 · Update the Next.js notes ☑ *(3 Nov)*

**Done on 3 Nov:** the "Authentication integration" section of `docs/nextjs-16-notes.md` now describes Supabase Auth: who does what, the session in cookies, verify-don't-trust, the two check layers, 2FA levels, session lengths and email links. `pnpm-lock.yaml` → `bun.lock`.
- **Build:** rewrite the "Authentication integration" section of `docs/nextjs-16-notes.md`. It still describes a backend cookie with CSRF; the decision of 31 Oct is Supabase Auth, with the access token sent as `Authorization: Bearer` to our API.
- **Backend:** Frontend only · **Order:** WO-1
- **Done when:** the notes match how login works.

#### WEB-03 · Web app settings ☑ *(3 Nov)*

**Done on 3 Nov:**
- `apps/web/.env.example` (committed) and `.env.local` (git-ignored) with the four settings.
- `apps/web/src/config/env.ts` checks them. `next.config.ts` runs the check for `next dev`, `next build` and `next start` (not `next typegen`).
- The rules are shared with the admin app in a new package, `packages/config` (`@funded-hub/config`). The admin checker now uses it too, with the same messages; its 10 tests are unchanged and pass.
- **Tested for real:** without settings, `next build` stops with the list of missing values; with them, both apps build.
- **Tests:** 12 new in `apps/web/tests/env.test.ts`.
- **Build:**
  - `apps/web/.env.example` (committed) and `.env.local` (not committed) with:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (never the secret key)
    - `NEXT_PUBLIC_API_URL` (the backend)
    - `NEXT_PUBLIC_SITE_URL` (this site's address, used in email links: `http://127.0.0.1:3000` locally)
  - the same startup check as the admin app (ADM-07). Move the checker's shared rules into a small shared package used by both apps, rather than copying them.
- **Backend:** Frontend only · **Order:** WO-1
- **Done when:** the app starts with the settings and stops with a clear message without them.

#### WEB-04 · Supabase connection ☑ *(3 Nov)*

**Done on 3 Nov:**
- `@supabase/ssr` 0.12.7 and `@supabase/supabase-js` 2.118.0 (still the latest on 3 Nov; the same as the admin app).
- `src/lib/supabase/browser.ts` and `server.ts`.
- `src/proxy.ts` renews the session on every page (fonts, images and build files skipped). No page rules yet.
- **Tested for real:**
  - without a login, pages load and nothing is set
  - a fresh login passes untouched
  - an expired token is renewed in `proxy.ts`, the new session comes back (split into 3 cookie parts), and the next request needs no renewal
  - a broken login cookie doesn't break the page
  - **caching, in production mode (`next start`):** a response that renews a login is `private, no-cache, no-store`, even for prerendered pages. Pages without a login stay cacheable (`s-maxage`). The dev server always sends its own `no-cache` header, so this can only be checked in production mode.
- **Tests:** 2 new in `apps/web/tests/proxy.test.ts` (which paths the proxy runs for).
- **Kept per app on purpose:** the few lines of Supabase cookie handling in `proxy.ts` follow Supabase's documented pattern in each app. Moving them into a shared package means changing the admin login's proxy, which can only be re-tested by hand (your phone's 2FA). That move belongs in WEB-21.
- **Build:**
  - `@supabase/ssr` and `@supabase/supabase-js` (the admin app uses 0.12.7 and 2.118.0; check for newer versions and advisories first)
  - browser and server clients; the session lives in cookies
  - `proxy.ts` keeps the session fresh on every page (protection rules come in WO-4)
- **Backend:** Supabase · **Order:** WO-1
- **Done when:** the app connects to local Supabase.

### Registration (WO-2)

#### WEB-05 · Legal pages ☐
- **Build:**
  - pages `/legal/terms`, `/legal/privacy` and `/legal/risk-disclosure`, reusing the pop-up texts, marked "Placeholder text" until the client sends the final versions
  - the footer links to the pages
  - the signup form links to the **exact version** from the backend (`file_url`), with its version number
- **Backend:** Live (versions come from WG3) · **Order:** WO-2
- **Done when:** every legal link opens a page.

#### WEB-06 · Real registration ☐
- **Build:**
  - **Fields, matching the backend's `SignUpMetadata`:**
    - first name and last name: two fields, because the backend needs them separately
    - email
    - password: at least 10 characters, with a strength meter
    - country: the full ISO country list (names from the browser's built-in `Intl.DisplayNames`). Blocked countries come from `GET /api/v1/public/restricted-countries` and show as unavailable.
    - "I am 18 or older" (required)
    - "I accept the Terms and the Privacy Policy" (required), each linking to its current version
    - marketing emails (optional, unticked)
  - **Loading the form:** the server fetches the blocked countries and the current Terms and Privacy from the backend. If the backend is down, the page says "Registration is unavailable right now" instead of showing a form that can't work.
  - **Submit:** `supabase.auth.signUp` with exactly the `SignUpMetadata` fields, and an email link back to `/auth/confirm` (built from `NEXT_PUBLIC_SITE_URL`).
  - **Answers:**
    - success, including an email that already has an account → "Check your inbox" (WEB-08), so nobody can test which emails have accounts. Locally Supabase answers an existing email with 422 `user_already_exists`; show the same "Check your inbox" for it. The backend setting in WG11 replaces that answer with a placeholder user.
    - an email that signed up less than a minute ago and isn't confirmed yet: Supabase resends the email and answers 429 `over_email_send_rate_limit` (found in WO-1) → also "Check your inbox", not an error. Only `over_request_rate_limit` means "too many attempts".
    - `COUNTRY_RESTRICTED` → shown at the country field
    - `UNDER_AGE` → "You must be at least 18"
    - `CONSENT_REQUIRED` → reload the current Terms and Privacy and ask to accept again
    - a weak password → shown at the password field
    - too many attempts (429) → "Too many attempts, wait a few minutes"
    - anything else → one generic message
  - **Referral code:** keep `?ref=` in a first-party cookie for Sprint 4. Don't send it to Supabase: the backend refuses unknown signup fields.
  - Remove the fake "Sign up with Google" (WD3).
- **Backend:** Live · **Order:** WO-2
- **Done when:** a trader registers for real, and each refusal shows its message.

### Email verification (WO-3)

#### WEB-07 · The email link handler ☐
- **Build:** a route `app/auth/confirm/route.ts`, shared by the verification and reset emails. It:
  - accepts the link format Supabase recommends for server-side apps (`token_hash` + `type`, checked with `verifyOtp`). It works in any browser, but needs the backend's email templates (WG1).
  - also accepts Supabase's default link (`code`, exchanged for a session), so verification works before WG1. Supabase confirms the email **before** sending the trader here, so a `code` means the email is verified. The sign-in part only works in the same browser and within 5 minutes of signing up; otherwise the page says "Email verified, please log in".
  - goes on only to pages on this site (`next` may be a path, or a full address on this site)
  - turns an expired or used link (`error_code=otp_expired`) into the "link expired" page
  - later, before launch: this check runs from our server, so every trader's confirmation counts against one IP address (Supabase allows 30 per 5 minutes). Turn on Supabase's IP address forwarding or raise the limit.
- **Backend:** Supabase (+ WG1) · **Order:** WO-3
- **Done when:** verification links sign the trader in, and bad links show the expired page.

#### WEB-08 · Verification pages ☐
- **Build:**
  - **Check your inbox:** shows the address, with "Resend email" (60-second countdown) and "Wrong email? Sign up again"
  - **Email verified:** goes on to the dashboard
  - **Link expired or already used:** an email field and "Send a new link"
  - resend uses `supabase.auth.resend({ type: "signup" })`; a 429 answer shows the wait time
- **Backend:** Supabase · **Order:** WO-3
- **Done when:** verify, resend and the expired page all work with real emails.

### Login and protection (WO-4)

#### WEB-09 · Real login ☐
- **Build:**
  - `signInWithPassword`; one generic message for a wrong email or password
  - unverified account → "Verify your email first", with resend
  - 429 → "Too many attempts, wait a few minutes" (Supabase has no account lockout; WD5)
  - remove "Continue as Demo Trader", the "any password works" note and the "Keep me signed in" box (it can't be honoured as shown)
  - "Forgot password?" links to the page from WO-6 (hidden until then)
- **Backend:** Supabase · **Order:** WO-4
- **Done when:** a verified trader can log in, and the fake login is gone.

#### WEB-10 · Page protection ☐
- **Build:**
  - `proxy.ts`: `/dashboard/**` without a login → `/login?next=…`; `/login` and `/signup` while logged in → `/dashboard`
  - the dashboard layout checks the login again on the server (same pattern as the admin app's `verifyAdminSession`)
  - remove the browser-only check in `DashboardShell`
- **Backend:** Supabase · **Order:** WO-4
- **Done when:** every dashboard page opened while logged out goes to `/login`.

#### WEB-11 · Dashboard with the real trader ☐
- **Build:**
  - the trader's real name and email in the dashboard and Settings (from the session; from `GET /api/v1/me` once WG2 exists)
  - logout in the user menu: signs out, then goes to the home page
  - pages without an API yet: apply the decision in WD1 (sample data labelled "Sample data", or the sprint's "No accounts yet" empty state)
  - the landing page's demo button: apply WD2
- **Backend:** Supabase (+ WG2 later) · **Order:** WO-4
- **Done when:** the dashboard shows who is logged in, and logout works.

### Trader 2FA (WO-5)

#### WEB-12 · Turn 2FA on and off ☐
- **Build:** in Settings › Security, replacing the fake QR code and session list:
  - **turn on:** the real QR code and key from Supabase, then a 6-digit code to confirm (the admin login's code, moved to a shared package). As in the admin app: remove any unfinished setup first, and use one fixed authenticator name (Supabase refuses a second factor with the same name).
  - **status:** "2FA on" or "2FA off", from Supabase
  - **turn off:** a fresh code first (Supabase also needs a 2FA session to remove it)
  - **backup codes:** "Not available yet" (WD5), not a fake download
- **Backend:** Supabase · **Order:** WO-5
- **Done when:** a trader turns 2FA on with an authenticator app and off again with a code.

#### WEB-13 · The 2FA code at login ☐
- **Build:**
  - after the password, if the trader has 2FA: ask for the 6-digit code; a wrong code is refused
  - `proxy.ts` and the server check require a 2FA session (`aal2`) for traders who turned 2FA on
  - **"Has 2FA" comes from Supabase, never from the session cookie.** The cookie's copy of the trader's authenticators can be edited in the browser. When a session is `aal1`, the server check asks Supabase (`getUser()`, once per request) whether the trader has a verified authenticator.
- **Backend:** Supabase (the backend should check the same, WG4) · **Order:** WO-5
- **Done when:** a trader with 2FA can't open the dashboard with the password alone.

### Password reset (WO-6)

#### WEB-14 · Forgot password ☐
- **Build:**
  - `/forgot-password`: email field; the same message for every email ("If an account exists, we've sent a reset link")
  - `resetPasswordForEmail`, with the link back to `/auth/confirm` → `/reset-password`
  - a 60-second wait between emails
- **Backend:** Supabase (+ WG1) · **Order:** WO-6
- **Done when:** the reset email arrives in Mailpit, and unknown emails get the same message.

#### WEB-15 · Reset password ☐
- **Build:**
  - `/reset-password`, reached only through the email link
  - a trader with 2FA enters the code first. Supabase refuses a password change without it ("AAL2 session is required to update email or password when MFA is enabled").
  - a new password with the strength meter → `updateUser({ password })`
  - Supabase then signs out every other device by itself (the sprint asks for this); the test checks it
  - an expired or used link → "Request a new link"
- **Backend:** Supabase · **Order:** WO-6
- **Done when:** the new password works, the old one doesn't, and other devices are signed out.

### Demo check (WO-7)

#### WEB-16 · Sprint 1 trader demo check ☐
- **Build:** run the demo script (section 1) end to end in a real browser against local Supabase, reading the emails in Mailpit. Keep screenshots for the QA record.
- **Backend:** Live + Supabase · **Order:** WO-7
- **Done when:** every step passes.

### Security page extras (WO-8)

#### WEB-17 · Change password ☐
- **Build:**
  - new password with the strength meter → `updateUser({ password })`
  - Supabase's "secure password change" (on in the backend config): when the login is more than 24 hours old, Supabase answers `reauthentication_needed`. Then `reauthenticate()` emails a code; the trader types it, and the change is sent again with it (`nonce`).
  - Supabase signs out the trader's other devices after the change.
- **Backend:** Supabase · **Order:** WO-8
- **Done when:** the password changes, with the emailed code when asked.

#### WEB-18 · Sign out other devices ☐
- **Build:** "Sign out all other devices" (`signOut({ scope: "others" })`). The fake session list is removed until the backend offers a real one (WG6).
- **Backend:** Supabase · **Order:** WO-8
- **Done when:** another browser's session ends.

### Polish (WO-9)

#### WEB-19 · Forms, errors and loading ☐
- **Build:** shared validation rules for the auth forms (zod, matching the backend's limits); loading and error states on every form; `loading.tsx`, `error.tsx` and `not-found.tsx` for the dashboard.
- **Backend:** Frontend only · **Order:** WO-9
- **Done when:** no form can fail without a message.

#### WEB-20 · Phone and accessibility pass ☐
- **Build:** every new page on phone and desktop; keyboard only; labels; contrast; focus after errors.
- **Backend:** Frontend only · **Order:** WO-9
- **Done when:** every new page works on both and with the keyboard.

#### WEB-21 · Tidy-up ☐
- **Build:** apply WD3 and WD4 (Google button, the sample `/admin` page); remove the "demo" pill from the real login pages; remove unused demo-login code from the store. Move the Supabase cookie handling that both apps' `proxy.ts` repeat into a shared package; re-test the admin login by hand.
- **Backend:** Frontend only · **Order:** WO-9
- **Done when:** nothing fake is left in the login flows.

### Staging (WO-10)

#### WEB-22 · Trader website on staging ⏸
- **Build:**
  - deploy `apps/web` to the staging host
  - hosted Supabase, set the same as local plus:
    - a verified email sender (SMTP). It's required: Supabase's built-in sender allows only 2 emails an hour. Raise the hourly limit for testing (30 by default with SMTP).
    - the email templates (WG1)
    - the allowed link addresses (the staging site's `/auth/confirm`)
    - session length (WG8)
  - the client's real Terms and Privacy, blocked countries and minimum age (WG3)
  - the backend's `APP_URL` set to the staging site's address
- **Backend:** Gap WG9 · **Order:** WO-10
- **Done when:** the demo script passes on staging with a real mailbox.

### Later (waiting for the backend or a decision)

#### WEB-23 · Consent screen and profile ⏸
- **Build:** show the "accept the new Terms" screen when `GET /api/v1/me` lists `pending_agreements`, record it with `POST /api/v1/agreements/{version_id}/accept`; let traders edit their profile (`PATCH /api/v1/me`).
- **Backend:** Needs API (WG2, WG5)

#### WEB-24 · Backup codes, device list, lockout message ⏸
- **Build:** whatever the client decides in WD5.
- **Backend:** Decision (WD5) and gaps WG6, WG7

#### WEB-25 · Referral attribution ⏸
- **Build:** send the saved `?ref=` code to the backend when affiliates are built (Sprint 4).
- **Backend:** Needs API

---

## 6. Backend gaps (send to the backend engineer)

The backend side of trader login is mostly ready. These pieces are missing; the website works around each until it's added.

| ID | Missing on the backend | Sprint task | What the website does until then |
|---|---|---|---|
| **WG1** | **Email templates** for links that work in any browser. Supabase's documented link for server-side apps: confirmation `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`, recovery the same with `type=recovery`. Plus the exact allowed redirect addresses (`additional_redirect_urls`; locally `http://127.0.0.1:3000/auth/confirm`; today it lists only `https://127.0.0.1:3000`). Local: `[auth.email.template.confirmation]` and `[auth.email.template.recovery]` in `supabase/config.toml` + template files; hosted: the Email Templates page | FE1-05, FE1-07 | Accepts Supabase's default links too, but those sign in only in the same browser within 5 minutes; elsewhere they say "Email verified, please log in" |
| **WG2** | **`GET /api/v1/me` and `PATCH /api/v1/me`**: in contract v1.1.0, not built (no controller) | FE1-09 | Shows the name and email from the login session; can't show the account status or ask for new consent |
| **WG3** | **Terms and Privacy versions**: none in the seed, so every signup is refused (`CONSENT_REQUIRED`) and `GET /public/agreements/.../latest` answers 404. Seed placeholder versions locally (the sprint's BE1-02 asks for them); staging needs the client's real documents, plus the blocked countries and minimum age | FE1-03, FE1-04 | Adds local test versions by hand (WEB-01) |
| **WG4** | **2FA for traders on the API:** once a trader turns 2FA on, trader routes (and row-level security on trader data) should require an `aal2` token. Otherwise a stolen password alone still works against the API | FE1-06 | Requires `aal2` in the website only |
| **WG5** | **Consent evidence:** the contract says the site calls `POST /api/v1/agreements/{version_id}/accept` after the first login so the API records the IP address and browser, but that endpoint isn't built, and the signup trigger already saves the acceptances (without IP or browser). Pick one and update the contract. The signup IP, geo-IP country and device fingerprint (BE1-03) aren't recorded either | FE1-04 | Sends nothing extra |
| **WG6** | **Sessions and login history:** a session list with "sign out" per device (BE1-06), the `user_login_events` table (nothing writes to it), account lockout after failed logins (BE1-05), the "new login" email. Supabase doesn't provide these; the backend's delivery pack lists them as client decision D5 | FE1-06, FE1-08 | "Sign out all other devices" only |
| **WG7** | **Security emails:** "password changed" (BE1-07) and "2FA turned on/off". Supabase has them, off by default (Auth v2.180+; the local CLI's Auth is v2.197). Local: `[auth.email.notification.password_changed]`, `[auth.email.notification.mfa_factor_enrolled]` and `[auth.email.notification.mfa_factor_unenrolled]` with `enabled = true` in `supabase/config.toml`; hosted: the Email Templates page | FE1-07, FE1-08 | Nothing |
| **WG8** | **Session lengths in one Supabase project:** traders 7 days, admins 12 hours. Supabase's session time-box applies to every user of the project, so set it to **7 days** (Pro plan) and enforce the admins' 12 hours in the backend (admin plan G5). ⚠ This corrects the admin plan's G5 note, which says to set the time-box to 12 h; that would sign traders out every 12 hours | FE1-09 | Nothing extra for traders |
| **WG9** | **Staging:** hosted Supabase with email confirmation, TOTP, a verified email sender (SMTP), the templates (WG1), allowed redirect addresses, the signup hook and the migrations; a deployed API with `APP_URL` = the staging site | Sprint 1 acceptance | Demo only on this computer |
| **WG10** | **Test through Supabase:** the backend's tests call the signup check directly as a database function. Add one test that signs up through Supabase itself (`supabase.auth.signUp`), so a hook misconfiguration is caught | FE1-04 | WO-1 checks it from the website |
| **WG11** | **Signup openly reveals which emails have accounts.** Supabase answers a signup for an existing email with 422 `user_already_exists` whenever email **or phone** confirmations are off, and `supabase/config.toml` has `[auth.sms] enable_confirmations = false`. Fix: set it to `true` (phone signup is off anyway, so nothing else changes); on hosted, keep phone confirmations on. Supabase then answers 200 with a placeholder user and sends no email. That reduces the leak but doesn't remove it: the placeholder's `identities` list is empty, which a careful attacker can spot. The 30-signups-per-5-minutes limit per IP slows mass checks | FE1-04 | Shows "Check your inbox" for both, but the raw answer can still be seen in the browser |
| **WG12** | **The signup check also runs for invitations and social login** (Supabase runs it for invites, `generateLink` signup/invite and OAuth; not for `auth.admin.createUser`). Those carry no country, 18+ or Terms data, so they'd be refused. This matters when admin invitations (admin plan G3) or Google sign-in (WD3) are built: the check must let them through, with the missing details collected later | FE1-04 | Nothing; neither exists yet |

---

## 7. Open questions

| ID | Question | Blocks |
|---|---|---|
| WD1 | **Dashboard after login.** The trading pages have no API yet. Show the sample data labelled "Sample data" (like the admin app), or the sprint plan's empty state "No accounts yet"? | WEB-11 |
| WD2 | **Public demo.** The landing page's demo button and "Continue as Demo Trader" sign in a fake trader. Remove them (recommended), or keep a separate, clearly labelled demo? | WEB-09, WEB-11 |
| WD3 | **Google sign-up.** The sample's "Sign up with Google" is fake. The signup check needs a country, the 18+ declaration and the Terms and Privacy, which Google doesn't give. Remove it for now (recommended), or plan it later with an extra step? | WEB-06 |
| WD4 | **The sample `/admin` page** inside the trader site. Remove it and the footer's "Admin preview" link, now that the real admin app exists (recommended)? | WEB-21 |
| WD5 | **Login features Supabase doesn't have** (the backend's delivery pack, decision D5, for the client): backup codes, account lockout, a session list, one 1-hour expiry for every email link (the sprint asks 24 hours for verification, 1 hour for reset), consent saved without the IP address. Accept the differences, or have the backend build them? | WEB-23, WEB-24 |
| WD6 | **Date of birth at signup.** The backend accepts an optional date of birth ("the age rule is still open"). Sprint 1 asks only for the 18+ tick. Keep the tick only (recommended for Sprint 1)? | WEB-06 |

The admin plan's D3 (backup codes) and D7 (staging hosting) apply here too.

---

## 8. Sources

| Topic | Where |
|---|---|
| Sprint 1 promise | Sprint 1 deliverables: "Staging site: registration, email verification, login, password reset, 2FA" |
| Sprint 1 trader tasks | `docs/final docs/SPRINT_1_DETAILED_PLAN.md`, FE1-01 – FE1-11, BE1-03 – BE1-08, section 14 checklist |
| Client check and demo script | Backend `dev` `1d4c8bf`: `docs/SPRINT_1_DELIVERY.md` (sections 1 and 7), `docs/SPRINT_1_STAGING.md` |
| Signup data and refusal codes | Backend `src/contracts/sign-up.ts` (`SignUpMetadata`, `SignUpRefusalCode`) |
| Signup check and saving | Backend `supabase/migrations/20261103000100_sprint_1_signup.sql` |
| Profile and consent API | Backend `src/contracts/profile.ts`, `src/contracts/agreements.ts` |
| Supabase settings | Backend `supabase/config.toml` (`[auth]`, `[auth.email]`, `[auth.mfa]`, `[auth.hook.before_user_created]`) |
| Login decision (Supabase Auth) | `docs/final docs/manager-docs/DECISIONS_AND_CORRECTIONS_31Oct.md`; `docs/final docs/WEEK_1_DETAILED_PLAN.md` (F1) |
| Rules for every order | `docs/final docs/ENGINEERING_STANDARDS.md` |
| Current web app | `apps/web/src` (`components/auth/AuthForms.tsx`, `lib/store.ts`, `components/dashboard/DashboardShell.tsx`, `components/dashboard/SettingsView.tsx`) |
| Supabase login flows | [Password-based auth](https://supabase.com/docs/guides/auth/passwords) (email links for server-side apps), [Email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow) |
| Supabase 2FA, sessions, limits | [MFA](https://supabase.com/docs/guides/auth/auth-mfa), [Sessions](https://supabase.com/docs/guides/auth/sessions) (time-box: whole project, Pro plan), [Password security](https://supabase.com/docs/guides/auth/password-security) (reauthentication), [Rate limits](https://supabase.com/docs/guides/auth/rate-limits), [Auth hooks](https://supabase.com/docs/guides/auth/auth-hooks) |
| Supabase Auth behaviour checked in the source | `supabase/auth` v2.197.0 (the version the local CLI runs): `internal/api/signup.go` (existing email → 422 when any confirmation is off), `internal/api/user.go` (2FA users need `aal2` to change the password; `reauthentication_needed` after 24 hours), `internal/api/invite.go` (invites run the signup check), `internal/models/user.go` (a password change signs out other sessions) |

---

## 9. Change log

| Date | Step | Note |
|---|---|---|
| 3 Nov 2026 | – | Plan created for the Sprint 1 line "Staging site: registration, email verification, login, password reset, 2FA", after reviewing backend `dev` `1d4c8bf` (signup controls by DhruvVerseX) and the web app. 10 orders, 25 steps, backend gaps WG1–WG12, questions WD1–WD6. Supabase details checked in its docs and in the Auth source (v2.197.0). |
| 3 Nov 2026 | WO-1 | **Done.** WEB-01: local backend on `1d4c8bf` (2 migrations, Supabase restarted, data kept), test Terms/Privacy, signup through Supabase 17/17. WEB-02: Next.js notes' login section rewritten for Supabase Auth. WEB-03: website settings + startup check; the rules moved into the new shared package `packages/config`, also used by the admin app. WEB-04: Supabase clients and a session-renewing `proxy.ts` (checked live, including production caching). Checks: lint ✓, typecheck (both) ✓, tests web 29 (14 new) + admin 109 ✓, both production builds ✓. Found: a just-signed-up email answers 429 `over_email_send_rate_limit` (added to WEB-06). |
