# Admin App Build Plan

**Goal:** build the Funded HUB admin app (`apps/admin`) completely and correctly. We work **one build order at a time**, starting with what Sprint 1 needs.

- Created: 2 Nov 2026
- Last updated: 3 Nov 2026 (AO-7 done: fresh 2FA code before every change, UI fixes, Sprint 1 demo script passes locally)
- Progress: **20 of 70 steps done** (AO-1 ☑ – AO-7 ☑; ADM-18 ◐) · next: **close Sprint 1**, see [Closing Sprint 1](#closing-sprint-1-after-ao-7-3-nov). First ADM-70 (Next.js security fix, needs your OK); AO-8 (staging) waits for staging.

---

## 1. Sprint 1 target: due for the demo on Wed 4 Nov

The client's payment plan (Instalment 1, Sprint 1, 26 Oct – 4 Nov) promises:

> **Admin panel with mandatory 2FA, roles and audit log**

The client checks it like this before paying, on **staging**:

> **Admin login requires 2FA; actions appear in the audit log.**

### What is done and what is left (Sprint 1 admin tasks)

| Task | What the sprint asks | Admin app today | Backend `dev` today | Left to do | Order |
|---|---|---|---|---|---|
| AD1-01 | Admin app shell | ☑ Done (visual) | n/a | Nothing for Sprint 1 | — |
| AD1-02 | Admin login with **mandatory 2FA** | ☑ Real Supabase login, 2FA setup on first login, 2FA code on every login (AO-2, 3 Nov) | ✅ Every admin call requires a 2FA session (`aal2`); local 2FA switched on | Nothing locally; staging (AO-8) | AO-2 ☑ |
| AD1-03 | Admin users: list, add, disable, reset 2FA, roles | ☑ Live (AO-4, 3 Nov): list and search, add an existing account, change roles, disable, re-enable; "Reset 2FA" says "Not available yet" | ✅ List, add (existing account), change roles, disable/enable · ❌ reset 2FA · ❌ email invites | Nothing locally; fresh 2FA code before each change (AO-7) | AO-4 ☑ |
| AD1-04 | Roles and permissions view | ☑ Live matrix (AO-4, 3 Nov): 4 roles × 18 permissions | ✅ `GET /admin/roles` (4 roles, 18 permissions) | Nothing | AO-4 ☑ |
| AD1-05 | Audit log viewer | ☑ Live (AO-5, 3 Nov): newest first, filters, Load more, details with before and after | ✅ `GET /admin/audit-logs` with filters · ❌ IP filter · ❌ actor names | Nothing locally (IP filter and names: G6) | AO-5 ☑ |
| AD1-06 | System settings | ☑ Live (AO-6, 3 Nov): all 7, each reviewed and saved on its own, with what uses it | ✅ 7 settings, each saved with an audit record | Fresh 2FA code before saving (AO-7) | AO-6 ☑ |
| AD1-07 | Page protection, permission checks, 12-hour session, 2FA again for sensitive actions | ☑ Page protection and the 12-hour session (AO-2), permission handling, fallback version (AO-3), a fresh 2FA code before every change (AO-7) | ✅ Permission check on every call · ❌ "who am I" · ❌ re-auth check · ❌ 12-hour limit | Backend checks (G1, G4, G5); hiding by permission after G1 | AO-7 ☑ |
| — | Live on **staging** | Not deployed | Not deployed | Deploy admin app and backend, create the first admin there | AO-8 |

✅ = built and tested on backend `dev` · ❌ = missing on the backend (see section 6, "Backend gaps")

**Short answer: what's left for Sprint 1.**
- **Done (AO-1 – AO-6):** local stack, real login with mandatory 2FA, page protection, 12-hour session, one API helper with paging, error pages, the admin access check, live roles, admin users and settings, and the live audit log that shows each of their changes.
- **Frontend work left (AO-7):**
  - a fresh 2FA check before sensitive actions
  - UI fixes and the Sprint 1 demo check
- **Deployment to staging (AO-8):** needs a staging backend and hosted Supabase. Those are not confirmed yet; ask the manager.
- **Backend gaps:** a few small ones (section 6). The panel works around each, but the backend should close them.

### Is it doable today?

The rough estimate for AO-1 to AO-7 is **10–12 hours of focused work**. That's tight for one day.

- **Biggest risk:** staging (AO-8). Without a deployed backend and hosted Supabase, the demo can only run on this computer.
- **If time runs out, keep these first:**
  - AO-2 (login + 2FA) ☑
  - AO-5 (audit log) ☑
  - one action that writes to the audit log (role change in AO-4 ☑, or a setting in AO-6 ☑)

  Together these prove the client's check: "admin login requires 2FA; actions appear in the audit log".

Not part of this plan: the Sprint 1 line "Staging site: registration, email verification, login, password reset, 2FA" is the **trader website** (`apps/web`), which still uses the sample's demo login.

### Closing Sprint 1 (after AO-7, 3 Nov)

**Where it stands:** everything the admin panel promises for Sprint 1 works on this computer, and the demo script ([`docs/ADMIN_SPRINT1_DEMO.md`](ADMIN_SPRINT1_DEMO.md)) passes end to end. Sprint 1 is closed when the client sees it on **staging**. What's left, and who owns it:

**A. Needed before the client can accept Sprint 1**

| # | Item | Owner | Status |
|---|---|---|---|
| A1 | **Staging** (G8, D7, AO-8). It needs: a deployed backend; hosted Supabase with TOTP 2FA on and a strong password policy (G9); a host for the admin app; `ADMIN_URL` set to its address; the first admin, made with SQL (G7). Also confirm the Mumbai Supabase projects (asymmetric JWT keys, new API keys) and the company AWS account exist. | Manager + backend engineer | Not started; blocks A4 |
| A2 | **Next.js security update** (ADM-70). 16.3.8 has 2 critical and 1 high advisory; never deploy it. | Frontend | Ready; needs your OK |
| A3 | **Audit IPs behind a proxy** (G14): set Express `trust proxy` before staging. Otherwise every audit entry there shows the proxy's IP. | Backend engineer | Open |
| A4 | **Run the demo script on staging** (ADM-69 in AO-8). | Frontend + you | After A1–A3 |
| A5 | **Push.** 6 commits on frontend `dev` aren't on GitHub: AO-3 – AO-7, plus the website's WO-1. | You decide | Waiting for your OK |
| A6 | **Restricted countries** (client decision Q11, D9). Locally the list is empty, so sign-up allows every country. Enter Bybit's list on staging, and here. | Manager / client confirm the list; any admin enters it | Open |

**B. Security gaps the backend must close.** The panel only works around them.
- **G4:** the API doesn't check that a fresh 2FA code came before a change. Also, Supabase accepts a code again for about 90 seconds (checked 3 Nov).
- **G5:** the API doesn't enforce the 12-hour admin session.
- **G1:** there's no "who am I" endpoint, ideally one that answers before the code step. Today a non-admin account can set up 2FA before it's turned away.
- **G9:** hosted Supabase needs a strong password policy.
- **G2:** an admin can't reset another admin's 2FA. Together with D3, an admin who loses their phone today needs a manual fix in Supabase.

**C. Other backend gaps** (the panel works around each, see section 6):
- G3 (invites), G6 (audit IP filter and names), G7 (first-admin script), G11 (admin list filter and order), G12 (last login), G15 (request ID).
- In the contract: G10 (field name `input`), G13 (permission list), G16 (country list), G17 (settings nothing reads).

**D. Decisions** (manager or client, section 7):
- D1 – D7, as before.
- New: D8 (a fresh code for every change, or once per few minutes), D9 (the exact restricted-country list), D10 (which payout wallet hold applies).

**E. Admin-app work left.** None of it is needed for the Sprint 1 promise.
- E1 **Keep the automated checks.** About 300 browser and API checks (AO-2 – AO-7) run from a temporary folder of the chat session. Move them into the repo (Playwright) so they survive and can run in CI.
- E2 ADM-18, full version (after G1): hide what an admin can't use, and show their roles in the top bar.
- E3 ADM-17: backup codes (after D3).
- E4 AO-13: tidy-up (ADM-02 dead preview code, ADM-04 old notes).
- E5 AO-last: security headers, test IDs everywhere, a phone and accessibility pass.
- E6 The 18 sample screens stay sample until their API is built. Next: AO-9 – AO-11 (programs and rule sets) for the manager demo on Fri 6 Nov.

**F. Outside this plan**
- The website's Sprint 1 items: registration, email verification, login, password reset and 2FA on staging (`docs/WEB_BUILD_PLAN.md`, WO-2 – WO-10).
- 4 Elastic IPs in Mumbai for the Bybit streams, needed in Week 2.

---

## 2. Build orders (do them in this order)

### How every build order works

1. **Read first:**
   - the backend's `docs/ADMIN_API.md` and `openapi.json` (contract **v1.1.0**, backend `dev` at `4b81f8d`; unchanged at `1d4c8bf`, checked 3 Nov)
   - `docs/ADMIN_UI_RULES.md` and `DESIGN.md`
   - the Next.js 16 guide in `node_modules/next/dist/docs/`
   - the project's Engineering Standards
2. **Check before building.**
   - New packages: check their current versions and security advisories.
   - Gaps or conflicts in the order: report them **before** building. Stop if one blocks the work.
3. **Build production-grade:**
   - secure
   - typed
   - tested
   - no secrets in the browser (only the Supabase publishable key)
   - no fake success (if something isn't connected, the UI says so)
4. **Finish with the "Done means" checklist** (section 3), then **report back:**
   - files changed
   - commands run
   - test and check results
   - commit hash
   - gaps found
   - anything the backend engineer must know
5. **Commit:** one commit per order on the frontend `dev` branch, with the order and step IDs in the message, e.g. `AO-2 (ADM-12, ADM-13): real login with mandatory 2FA`. Push only when the user says so.

### Order list

| Order | Goal | Steps | Needed for | Rough time | Status |
|---|---|---|---|---|---|
| **AO-1** | Run the real backend locally and create the first admin | ADM-67, ADM-07, ADM-01 | Sprint 1 | 1 h | ☑ 3 Nov |
| **AO-2** | Login with mandatory 2FA, page protection, sign out | ADM-11, ADM-12, ADM-13, ADM-14, ADM-15, ADM-16 | Sprint 1 | 3 h | ☑ 3 Nov |
| **AO-3** | One API helper, paging, error and permission handling | ADM-08, ADM-09, ADM-10, ADM-06, ADM-18 | Sprint 1 | 2 h | ☑ 3 Nov |
| **AO-4** | Roles matrix and admin users, live | ADM-05, ADM-34 | Sprint 1 | 2 h | ☑ 3 Nov |
| **AO-5** | Audit log, live | ADM-35 | Sprint 1 | 1 h | ☑ 3 Nov |
| **AO-6** | Settings, live | ADM-36 | Sprint 1 | 1 h | ☑ 3 Nov |
| **AO-7** | Fresh 2FA before sensitive actions, bug fixes, Sprint 1 demo check | ADM-19, ADM-03, ADM-69 | Sprint 1 | 1.5 h | ☑ 3 Nov |
| **AO-8** | Admin app on staging | ADM-68 | Sprint 1 (client acceptance) | 1 h + infra | ⏸ needs staging infra |
| **AO-9** | Programs: list, details, create, edit, status | ADM-20, ADM-21, ADM-22, ADM-23 | Manager demo Fri 6 Nov | 2.5 h | ☐ |
| **AO-10** | Rule sets: versions, drafts, publish, compare | ADM-30, ADM-31, ADM-32, ADM-33 | Manager demo Fri 6 Nov | 2 h | ☐ |
| **AO-11** | Program details: phases, sizes, add-ons, payout policy, scaling, pairs | ADM-24 – ADM-29 | Manager demo Fri 6 Nov | 3 h | ☐ |
| **AO-12** | Traders: list, detail, edit, status | ADM-44 (list and detail), ADM-45 | Sprint 2 | 2 h | ☐ |
| **AO-13** | Tidy-up: dead code, old notes | ADM-02, ADM-04 | Any time | 1 h | ☐ |
| **AO-14+** | Everything that waits for backend APIs, grouped when each API is defined | ADM-37, ADM-38, ADM-39 – ADM-43, ADM-46 – ADM-61 | Sprints 2–6 | — | ⏸ needs API |
| **AO-last** | Finish: security headers, test IDs, remove fake data, phone and accessibility pass, final check | ADM-62 – ADM-66 | Before launch | — | ☐ |

### Order cards (Sprint 1 and the Fri 6 Nov demo)

#### AO-1 · Local stack and first admin
- **Steps:**
  - ADM-67: run backend `dev` locally and create the first admin
  - ADM-07: admin app settings
  - ADM-01: admin in the main checks
- **Before you start:**
  - Docker Desktop is running.
  - Node 26 + npm 12 for the backend.
  - Node 24 + Bun for the frontend.
- **Done when:**
  - the backend answers `http://127.0.0.1:4000/health`
  - a first admin with the ADMIN role exists in local Supabase
  - the admin app starts with its settings, and stops with a clear message without them
  - `bun run typecheck` and `bun run test` cover both apps
- **Not in this order:** any screen changes.

#### AO-2 · Login with mandatory 2FA
- **Steps:**
  - ADM-11: Supabase connection
  - ADM-12: login
  - ADM-13: 2FA setup
  - ADM-14: 2FA code on every login
  - ADM-15: sign out and session
  - ADM-16: page protection
- **Done when:**
  - no admin page opens without password **and** a 6-digit code
  - a new admin must set up 2FA before anything else
  - a wrong code is refused
  - sign out works
  - the session ends after 12 hours
- **Tests:**
  - unit tests for "which login step to show" and the page-protection rules
  - one manual run with a real authenticator app
- **Not in this order:** backup codes (ADM-17, D3) and hiding buttons by permission (ADM-18).

#### AO-3 · Talk to the backend
- **Steps:**
  - ADM-08: API types
  - ADM-09: API helper
  - ADM-10: paging
  - ADM-06: error pages
  - ADM-18: permission handling, fallback version
- **Done when:**
  - every call goes through one helper with the 2FA token
  - each error code shows a clear message
  - lists load more with the cursor
  - a refused page (403) shows "You don't have permission for this page"
  - a crash shows the error page with Retry
  - an account without admin access is signed out right after login with "This account has no admin access" (ADM-18; found in AO-2)
- **Tests:** unit tests for every error code, paging, and a missing or expired token.

#### AO-4 · Roles and admin users
- **Steps:** ADM-05 (live roles matrix), ADM-34 (admin users).
- **Done when:**
  - Roles: shows the live 4 roles × 18 permissions.
  - Admin users, list: search and status work.
  - Admin users, add: find an existing account by email, give it one or more roles.
  - Admin users, manage: change roles, disable, re-enable.
  - The backend's refusals show clearly: changing your own access, or removing the last admin.
  - Every change shows up in the audit log.
- **Not in this order:** reset 2FA and email invitations. They're backend gaps G2 and G3; the buttons say "Not available yet".
- **Done 3 Nov:** all of the above, against the local backend. "Removing the last admin" can't happen for real: you can't change your own access, so you are always one active Admin. Its message was checked with a simulated answer. Found: G11, G12 and G13.

#### AO-5 · Audit log
- **Steps:** ADM-35.
- **Done when:**
  - real entries show, newest first
  - filters work: actor, action, entity type, date range (UTC)
  - "Load more" works
  - the details drawer shows before/after values, IP, browser and request ID
- **Not in this order:** an IP filter on the server (gap G6). Until then it filters only the loaded rows, and says so.
- **Done 3 Nov:** all of the above, against the local backend. Found: G14 (IPs behind a proxy) and G15 (request ID).

#### AO-6 · Settings
- **Steps:** ADM-36.
- **Done when:**
  - all 7 settings load and save
  - backend validation errors show next to the field
  - the restricted-countries editor works
  - every save shows up in the audit log
- **Not in this order:** KYC gates (ADM-37, D4).
- **Done 3 Nov:** all of the above, against the local backend. Found: G16 (country list) and G17 (5 settings nothing reads yet).

#### AO-7 · Sensitive actions and the Sprint 1 check
- **Steps:**
  - ADM-19: fresh 2FA code before sensitive actions
  - ADM-03: UI bug fixes
  - ADM-69: Sprint 1 demo check
- **Done when:**
  - changing roles, disabling an admin and changing a setting first ask for a fresh 2FA code
  - the Sprint 1 demo script (ADM-69) passes end to end on this computer
  - all checks pass
  - the work is committed
- **Not in this order:** backend enforcement of the fresh code (gap G4).
- **Done 3 Nov:** all of the above. The demo script is [`docs/ADMIN_SPRINT1_DEMO.md`](ADMIN_SPRINT1_DEMO.md).

#### AO-8 · Staging
- **Steps:** ADM-68.
- **Before you start:** ADM-70 (patched Next.js). Never deploy Next.js 16.3.8.
- **Blocked by:** a staging backend, hosted Supabase (2FA on) and a host for the admin app. Owner: the manager and backend engineer.
- **Done when:** the Sprint 1 demo script passes on the staging address.

#### AO-9 · Programs
- **Steps:** ADM-20 – ADM-23.
- **Done when:**
  - programs from the live API show, with filters
  - a program can be created and edited
  - status changes work
  - a blocked change shows the backend's reason

#### AO-10 · Rule sets
- **Steps:** ADM-30 – ADM-33.
- **Done when:**
  - a program's versions show
  - a draft can be created and edited
  - publishing freezes the draft (Admin only)
  - two versions can be compared

#### AO-11 · Program details
- **Steps:** ADM-24 – ADM-29.
- **Done when:**
  - a full 2-Step program can be built through the panel
  - it can be switched to Active with real data: phases on published rule sets, a size, a payout policy

---

## 3. Rules for every step

1. **One build order at a time, in order.** If a step is blocked, mark it ⏸ with the reason and move on.
2. **No guessing data.**
   - Use the backend contract (`openapi.json` v1.1.0) exactly.
   - Screens with no API yet stay as the clearly labelled preview until the backend defines their API.
3. **No fake security.**
   - The UI never pretends login, 2FA or permissions work when they don't.
   - The backend decides permissions; the UI only hides or explains what you can't use.
4. **Money is text, times are UTC.** Never do decimal maths on prices in the browser.

### Done means

A step is ☑ only when all of these are true:

- [ ] `bun run lint` passes
- [ ] Admin type check passes (`bun run --cwd apps/admin typecheck`)
- [ ] Admin tests pass, and new logic has new tests (`bun run --cwd apps/admin test`)
- [ ] Screens that use the API work against the **local backend `dev`** with a real 2FA (`aal2`) session
- [ ] The page works at http://127.0.0.1:3101 on desktop and phone width
- [ ] Every new button and form field has a `data-testid`
- [ ] This file is updated: status, date, short note

**Status:** ☐ to do · ◐ in progress · ☑ done · ⏸ blocked

**Backend tags:**
- **Live:** built on backend `dev`
- **Supabase:** Supabase Auth, used directly
- **Needs API:** database table exists, no endpoint yet
- **Gap:** see section 6
- **Decision:** see section 7

---

## 4. Where we are (3 Nov 2026)

### Admin app

- **Real login (AO-2, 3 Nov):** Supabase password + mandatory 2FA, page protection, sign out and the 12-hour session.
- **Talking to the backend (AO-3, 3 Nov):** one API helper (`src/lib/api`) with the 2FA token, typed from the contract; cursor paging; error, loading and not-found pages; the admin access check on every page load. Lint blocks direct `fetch` calls in admin code.
- **Live screens (3 Nov):** Roles (the live matrix) and Admin users (list, search, add, change roles, disable, re-enable) in AO-4; the Audit log in AO-5; Settings in AO-6. The top bar says "Live data" on these pages and "Sample data" on the others.
- **The other screens are still a preview.**
  - 18 screens on sample data (`apps/admin/src/mocks`).
  - Every button only shows a "Sample… previewed" message.
  - They move to the API helper one by one (AO-9 onwards: programs and rule sets).
- **New readable colour palette** (2 Nov), in `packages/ui`, committed 3 Nov (`24661b6`).
- **The app installs and runs** (workspace fix of 2 Nov) on the frontend `dev` branch.

### Backend (`dev` at `4b81f8d`, 3 Nov)

The backend `dev` branch = the backend work (NestJS foundation, contract, risk engine) plus 3 admin commits by DhruvVerseX:

- **Contract v1.1.0:** 13 new admin operations plus the 22 program and rule-set operations, **35 admin routes in total**.
- **Every admin call checks** a verified Supabase login, the 2FA level `aal2`, an active admin membership and the permission, all from the database.
- **Every change and its audit record are saved together:** if the audit record fails, the change is undone.
- **Built-in protections:** you can't lock yourself out, and the last active admin can't be removed.
- **Local Supabase now has TOTP 2FA switched on.**
- **CORS:** only `APP_URL` and `ADMIN_URL` may call the API. `ADMIN_URL` must equal the admin app's address exactly; locally that's `http://127.0.0.1:3101`.
- **Tests:** 731 unit tests and 13 real-database tests passed (backend's own report).
- **Not tested by the backend:** hosted Supabase login and 2FA, and the frontend connection.
- **Since 3 Nov, `dev` is at `1d4c8bf`** (the local backend runs it): sign-up controls for the trader website, and the database's own admin check now also needs `aal2`, an active membership and `audit.read` for direct audit reads. The admin API and its contract didn't change.

Routes the Sprint 1 screens use:

| Method | Route | Permission | Used by |
|---|---|---|---|
| GET / POST | `/api/v1/admin/users` | `admins.manage` | Admin users (list, add) |
| GET / PATCH / DELETE | `/api/v1/admin/users/{id}` | `admins.manage` | Admin users (detail, roles, status, disable) |
| GET | `/api/v1/admin/roles` | `admins.manage` | Roles matrix |
| GET | `/api/v1/admin/traders` | `traders.read` | Finding an account to make admin; Traders screen |
| GET / PATCH | `/api/v1/admin/traders/{id}` | `traders.read` / `traders.update` | Traders screen |
| GET | `/api/v1/admin/settings` | `settings.manage` | Settings |
| GET / PUT | `/api/v1/admin/settings/{key}` | `settings.manage` | Settings |
| GET | `/api/v1/admin/audit-logs` | `audit.read` | Audit log |

Programs and rule sets: 22 routes, all `programs.manage` except publishing (`rules.publish`). The full list is in the backend's `docs/ADMIN_API.md`.

---

## 5. Steps

### Base and setup

#### ADM-01 · Add the admin app to the main checks ☑ *(3 Nov: root `typecheck`, `test` and `build` run both apps; new `build:admin`)*
- **Build:** make the root `typecheck`, `test` and `build` scripts check `apps/admin` too. Today they only check `apps/web`.
- **Backend:** Frontend only · **Order:** AO-1
- **Done when:** `bun run typecheck`, `bun run test` and `bun run build` cover both apps and pass.

#### ADM-02 · Remove dead code ☐
- **Build:** delete code nothing uses:
  - `components/status.tsx`
  - `usePreview` and the unused `PreviewProvider` config and state
  - `mocks/screenshot-pages.ts`
  - unused mock fields
- **Decide in this step:** keep or remove the old `applyPreviewCommand` reducer (only its tests use it).
- **Backend:** Frontend only · **Order:** AO-13
- **Done when:** the app looks and works the same, and all checks pass.

#### ADM-03 · Fix UI bugs ☑ *(3 Nov)*
- **Build:**
  - The sidebar highlights the right item on detail pages and alias pages (`/users`, `/audit`, `/kyc-queue`).
  - The dashboard KYC card links to `/kyc`.
  - Toasts close by themselves after a few seconds.
  - ~~The admin-users screen's ignored date filter and "Disable" for disabled admins~~: fixed in AO-4 (ADM-34). The live screen has no date filter, and a disabled admin offers "Re-enable admin".
  - The admin app has no icon, so browsers ask for `/favicon.ico` and get a 404 on every page (found 3 Nov by AO-2's browser test). Add `src/app/icon.svg`.
  - The shared `Modal` (packages/ui): a dialog that mounts already open closes itself in React's development double-run, and that close counts as "cancel" (found in AO-3). The 2FA prompt and the action dialogs (`src/components/action-dialog.tsx`, used by admin users and settings) avoid it by staying mounted; fix it in the `Modal` so every dialog is safe.
- **Backend:** Frontend only · **Order:** AO-7
- **Done when:** each bug is fixed and covered by a test where possible.
- **Done 3 Nov:**
  - **Sidebar** (`src/lib/navigation.ts`): an alias marks the page it shows (`aria-current="page"`). A detail page marks its list (`aria-current="location"`).
  - **Dashboard:** the KYC card opens `/kyc`.
  - **Toasts** (packages/ui `Toast`) close after 6 seconds, but not while the pointer or keyboard focus is on them.
  - **Icon:** `src/app/icon.svg`, the website's icon. The proxy already skips `.svg` files, so the login page shows it too.
  - **Modal** (packages/ui): `onClose` now reports only closes the person makes. React's development double-run no longer cancels a dialog that mounts open. Tried with a temporary page: it stays open, and Escape reports exactly one close.
  - Covered by unit tests (sidebar, KYC link) and the AO-7 browser run.

#### ADM-04 · Update the old notes ☐
- **Build:** fix `docs/admin-preview.md` and `apps/admin/VISUAL_AUDIT.md`:
  - pnpm → bun
  - the test count
  - features that no longer exist
  - the new palette
- **Backend:** Frontend only · **Order:** AO-13
- **Done when:** the notes match the code.

#### ADM-05 · Live roles and permissions matrix ☑ *(3 Nov)*
- **Build:**
  - The Roles page shows the matrix from `GET /admin/roles`: 4 roles, each with its permissions.
  - Keep one shared list of the 18 permission codes in the frontend. It's used for the column order and, later, for hiding buttons (ADM-18).
  - Remove the 16 old permissions.
- **Permission:** `admins.manage` · **Backend:** Live · **Order:** AO-4
- **Done when:**
  - the page shows the live matrix
  - a test checks that the frontend's 18 codes match the backend's `permissions.ts`
- **Done 3 Nov:**
  - The list is `src/lib/auth/permissions.ts`, with the backend's own descriptions as labels. The roles are shown as Admin, Risk, Support, Finance (the API sends them in ID order).
  - The contract doesn't list every permission code (gap G13). So `apps/admin/contract/permissions.json` is a copy of the backend's `permissions.ts`, and a test keeps the two equal. The test also checks every permission the contract's routes require.
  - A code the app doesn't know yet still gets a row, with a warning: the page hides nothing.
  - The 16 old sample permissions are gone.
  - Tried for real: all 35 ✓ on screen match the API. A Support admin gets "You don't have permission for this page".

| Permission | ADMIN | RISK | SUPPORT | FINANCE |
|---|:-:|:-:|:-:|:-:|
| `traders.read` | ✓ | ✓ | ✓ | ✓ |
| `traders.update` | ✓ | | ✓ | |
| `kyc.review` | ✓ | | ✓ | |
| `programs.manage` | ✓ | | | |
| `rules.publish` | ✓ | | | |
| `instruments.manage` | ✓ | ✓ | | |
| `risk.action` | ✓ | ✓ | | |
| `risk.review` | ✓ | ✓ | | |
| `orders.read` | ✓ | | ✓ | ✓ |
| `refunds.create` | ✓ | | | ✓ |
| `payouts.approve` | ✓ | | | ✓ |
| `payouts.send` | ✓ | | | ✓ |
| `affiliates.manage` | ✓ | | | ✓ |
| `discounts.manage` | ✓ | | | ✓ |
| `notifications.manage` | ✓ | | | |
| `settings.manage` | ✓ | | | |
| `admins.manage` | ✓ | | | |
| `audit.read` | ✓ | ✓ | | ✓ |

#### ADM-06 · Real loading, error and not-found pages ☑ *(3 Nov)*

**Done on 3 Nov:**
- **Files:** `app/(app)/loading.tsx`, `error.tsx` (uses Next 16.3's `retry`), `not-found.tsx`, plus `app/global-error.tsx` for crashes in the root layout.
- **Error screens never show the error's own text**, only a reference (`digest`) that matches the server log.
- **Shared panel:** `components/api-error-panel.tsx` for API errors. It shows "Try again" only when trying again can help.
- **Tried for real:** a page that crashed once showed the error screen inside the layout, and "Try again" loaded it. An unknown trader showed "We couldn't find this page".
- **Build:**
  - `loading.tsx`, `error.tsx` and `not-found.tsx` for the admin pages
  - one shared "what went wrong" panel for API errors, with Retry
- **Backend:** Frontend only · **Order:** AO-3
- **Done when:** a crashing page shows the error page, not a blank screen, and Retry works.

#### ADM-67 · Run the backend locally and create the first admin ☑ *(added and done 3 Nov)*

**Done on 3 Nov:**
- **Backend `dev` (`4b81f8d`)** runs from `E:\Prop\Funded_Hub_backend-dev`, a separate git worktree. The `saurabh-backend` checkout is untouched.
- **Local Supabase** runs with 2FA on and reuses the existing local database: 7 migrations, 4 roles, 18 permissions.
- **The cache (Valkey)** runs from the backend's Docker Compose file.
- **The API** answers `/health` and `/health/ready` (database up, Redis up).
- **CORS** allows only `http://127.0.0.1:3101` (and the web app).
- **First admin:** `admin@example.com`, profile and membership ACTIVE, role ADMIN, no 2FA set up yet. The password is kept outside the repo.
- **End-to-end check, 9/9 passed:**
  - a password-only session is refused (`403 MFA_REQUIRED`)
  - after a TOTP code the session is `aal2`, and `GET /roles`, `/users` and `/audit-logs` answer 200
  - the temporary authenticator was then removed, so AO-2 starts from a fresh 2FA setup
- **Build:**
  1. **Backend `dev` in its own folder** (so the local `saurabh-backend` checkout is untouched):

     `git worktree add ../Funded_Hub_backend-dev origin/dev`

     Then `npm ci` with Node 26.
  2. **Start local Supabase** from that folder:
     - First create the local signing key: `npm run supabase:signing-key`. It isn't committed. Without it, login tokens use the old HS256 signing, which the backend refuses.
     - Then run `npx supabase start` (Docker). 2FA is already switched on there.
     - Only one local Supabase can run at a time.
  3. **Backend `.env`:** copy `.env.example`, then set:
     - the Supabase URL and keys from `npx supabase status`
     - `ADMIN_URL=http://127.0.0.1:3101`
     - `APP_URL=http://127.0.0.1:3000`

     Then run `npm run dev` (port 4000).
  4. **First admin:**
     - In Supabase Studio, go to **Authentication → Users → Add user** (email + password, auto-confirm).
     - Then run this SQL in the Studio SQL editor:

```sql
insert into public.admin_members (profile_id)
select id from public.profiles where email = 'admin@example.com';

insert into public.admin_member_roles (admin_member_id, role_id)
select am.id, r.id
from public.admin_members am
join public.profiles p on p.id = am.profile_id
join public.roles r on r.code = 'ADMIN'
where p.email = 'admin@example.com';
```

- **Backend:** Live + Supabase · **Order:** AO-1
- **Done when:** `/health` answers, and the first admin exists with the ADMIN role.

#### ADM-07 · App settings (environment) ☑ *(3 Nov)*

**Done on 3 Nov:**
- **Files:**
  - `apps/admin/.env.example` (committed)
  - `.env.local` (git-ignored)
  - `src/config/env.ts`: the checker
  - `next.config.ts`: runs the check for `next dev`, `next build` and `next start`, and skips it for `next typegen`
- **The checker refuses:**
  - missing values
  - a secret key
  - non-publishable keys
  - plain http except localhost
  - malformed addresses
- **Tests:** 10 in `tests/env.test.ts`.
- **Tried for real:** without `.env.local` the app stops with the message; with it, every page loads.
- **Build:**
  - `apps/admin/.env.example` (committed), plus `.env.local` (not committed) with:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (never the secret key)
    - `NEXT_PUBLIC_ADMIN_API_URL`
  - a startup check that stops with a clear message if a value is missing
- **Backend:** Frontend only · **Order:** AO-1
- **Done when:** the app starts with the settings and stops with a clear message without them.

#### ADM-70 · Upgrade Next.js to the patched version ☐ *(added 3 Nov)*
- **Why:** `bun audit` (3 Nov) found three Next.js advisories, published 22 Oct 2026, for every version from 16.0.0 to 16.4.0. Both apps use **16.3.8**.
  - critical: remote code execution in the image optimizer when SVG files are used ([GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw))
  - critical: remote code execution in `use cache` functions that return typed arrays ([GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr))
  - high: denial of service in the App Router with Server Actions ([GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r))
  - All three are fixed in 16.4.1. The latest on 3 Nov is 16.4.4.
  - Also found, moderate and only in the development tools: `minimatch` below 11.0.1, through ESLint ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)).
- **Build:**
  - First read the Next.js 16.4 release notes and the bundled docs for changes.
  - Raise `next` in both apps (and `eslint-config-next` to the same version) to the latest 16.4 patch, pinned exactly.
  - Run every check for both apps, then click through both apps.
- **Backend:** Frontend only · **Order:** its own commit, recommended before AO-3; required before AO-8.
- **Done when:** `bun audit` shows no Next.js advisories, and all checks and both production builds pass.

### Talking to the backend

#### ADM-08 · API types from the backend contract ☑ *(3 Nov)*

**Done on 3 Nov:**
- **Contract copy:** `apps/admin/contract/openapi.json`, byte for byte the backend's file at `4b81f8d` (v1.1.0, 35 admin operations).
- **Types:** `bun run --cwd apps/admin api:types` generates `src/lib/api/schema.d.ts` with `openapi-typescript` 7.13.0 (dev only).
  - `--default-non-nullable=false`, so fields with a default stay optional in request bodies, as the contract says.
- **Type helpers** (`src/lib/api/types.ts`): each path + method gives its exact path IDs, query, body and answer. A wrong status value, a missing ID or a body on a GET doesn't compile (checked in `tests/api-contract.test.ts`).
- **Build:**
  - Save a copy of the backend's `openapi.json` (v1.1.0, `4b81f8d`) in the admin app.
  - Generate TypeScript types from it with one script (`bun run api:types`).
  - Commit both, so everyone uses the same contract version.
- **Backend:** Live · **Order:** AO-3
- **Done when:** the types for all 35 admin operations exist and the type check passes.

#### ADM-09 · One API helper ☑ *(3 Nov)*

**Done on 3 Nov:**
- **`src/lib/api/client.ts`:** every call returns `{ ok, data, meta }` or `{ ok: false, error }`. Each call:
  - carries the aal2 token, never cookies
  - times out after 15 s
  - doesn't follow redirects
- **Recovery,** at most once per call:
  - 401: renew the session and send again; if that fails, sign out to `/login?reason=ended`.
  - `MFA_REQUIRED`: the 2FA code prompt (`components/two-factor-prompt.tsx`), then send again.
  - Reads that fail on the way (no connection, timeout, 502/503/504): 2 more tries, 200–400 ms then 400–800 ms apart.
  - Writes are never retried automatically.
- **Messages:** one for each of the 20 contract error codes, plus no connection, timeout, cancelled, unexpected answer and session ended. Conflicts show the backend's reason; `VALIDATION_FAILED` keeps each field's message.
- **Supabase can't be reached** while renewing: shown as "no connection", never a sign-out.
- **Money and time:** `src/lib/api/format.ts`. Money stays text (no rounding, no JS numbers), and times print in UTC the same on server and browser.
- **Pages get the helper** from `useAdminApi()` (`components/admin-api-provider.tsx`). Lint blocks `fetch` anywhere else in admin code.
- **Tried for real** against backend `dev` (15/15): 404, 400 with field messages, SUPPORT's 403, `MFA_REQUIRED` → real 2FA code → 200, 401 → renewed → 200, backend down → retried, then a clear message.
- **Build:** one function for every API call. It:
  - adds the 2FA login token (`Authorization: Bearer …`) from the Supabase session
  - reads success `{data, meta}` and errors `{error: {code, message, fields}}`
  - turns error codes into clear messages:
    - `401`: refresh the session, otherwise go to login
    - `403 FORBIDDEN`: "You don't have permission"
    - `403 MFA_REQUIRED`: ask for the 2FA code, then retry
    - `409 CONFLICT` and `RULE_SET_PUBLISHED`: show the backend's reason
    - `400 VALIDATION_FAILED`: show each message next to its field
    - `429`: "Too many tries, wait a moment"
    - `503 SERVICE_UNAVAILABLE`: "The service is busy, try again"
  - keeps money as text and shows times in UTC
- **Backend:** Live · **Order:** AO-3
- **Done when:** unit tests cover every error code, the token handling, and money and time formatting.

#### ADM-10 · Tables with real paging and filters ☑ *(3 Nov)*

**Done on 3 Nov:**
- **`src/lib/api/paging.ts`:** the list state.
  - Answers for older filters or older requests are dropped.
  - Rows that show up twice are merged by ID (cursors are offsets).
  - Empty filters are not sent (the API refuses empty text), and search is capped at 100 characters.
- **`src/lib/api/use-cursor-list.ts`:** the hook (`useCursorList`) plus `useDebouncedValue` for search boxes.
- **`components/load-more.tsx`:** "Load more", then "End of list · N shown". No totals (D5).
- **Tried for real** on the traders list: one row per page reached all 3 traders with no repeats, and `q` and `status` were applied by the server. Screens start using it in AO-4.
- **Build:**
  - lists load page by page with the API's cursor ("Load more")
  - search and filters are sent to the server
  - no totals: the API doesn't give them (D5)
- **Backend:** Live · **Order:** AO-3
- **Done when:** a list with more than one page works with filters.

### Login and security

#### ADM-11 · Supabase connection ☑ *(3 Nov)*

**Done on 3 Nov:**
- **Packages:** `@supabase/ssr` 0.12.7 and `@supabase/supabase-js` 2.118.0, the latest on 3 Nov, with no advisories.
- **Clients:** `src/lib/supabase/browser.ts` (browser) and `src/lib/supabase/server.ts` (server only). Both use the publishable key only, and the session lives in cookies.
- **Token check:** the server and `proxy.ts` read the session with `getClaims()`, which verifies the token's signature (ES256) instead of trusting the cookie.
- **Build:**
  - Supabase clients for the browser and the server (`@supabase/ssr`), using only the publishable key
  - the session is kept in cookies, so the server and `proxy.ts` can check it
- **Backend:** Supabase · **Order:** AO-2
- **Done when:** the app connects to local Supabase.

#### ADM-12 · Real login (email + password) ☑ *(3 Nov)*

**Done on 3 Nov:**
- `src/components/login-flow.tsx` replaces the preview and signs in with Supabase.
- **Messages:**
  - one generic message for every sign-in failure
  - "too many attempts" for 429
  - "unavailable" when there's no connection or the server fails, so the password isn't blamed
- **After login:** the admin goes back to the page they asked for (`?next=`). Only paths on this site are accepted; anything else goes to the dashboard.
- **Build:**
  - Replace the login preview with a real Supabase sign-in.
  - One generic error message for every failure.
  - A clear "too many attempts" message on 429.
- **Backend:** Supabase · **Order:** AO-2
- **Done when:** the first admin can sign in, and a wrong password shows the generic error.

#### ADM-13 · 2FA setup on first login ☑ *(3 Nov)*

**Done on 3 Nov:**
- **No verified authenticator yet:** the admin sees the real QR code and key from `mfa.enroll`, labelled "Funded HUB Admin", and confirms with a 6-digit code.
- **No way to skip it:** every other page sends the admin back to this step.
- **Unfinished setups** from earlier attempts are removed first, so a reload starts a fresh setup.
- **If the 2FA status can't be read** (no connection), the page says so. It never starts a new setup by guessing.
- **QR code check:** decoded in the test, it's a standard `otpauth://totp` link (SHA1, 6 digits, 30 s) whose key matches the key shown.
- **Build:**
  - If the admin has no verified authenticator yet, show the real QR code and manual key from Supabase (`mfa.enroll`).
  - Ask for a 6-digit code (`mfa.challenge` + `mfa.verify`).
  - No way to skip it.
- **Backend:** Supabase · **Order:** AO-2
- **Done when:** a new admin sets up 2FA with an authenticator app and lands in the panel at `aal2`.

#### ADM-14 · 2FA code on every login ☑ *(3 Nov)*

**Done on 3 Nov:**
- **With a verified authenticator,** the code step follows the password. Wrong and old codes are refused.
- **Backend check:** the backend accepts the browser's `aal2` token (`GET /api/v1/admin/traders` → 200) and refuses a password-only token (`403 MFA_REQUIRED`).
- **Moved to ADM-09 (AO-3):** "the API answers `MFA_REQUIRED` → ask for the code and retry". AO-2 makes no API calls yet.
- **Build:**
  - After the password, ask for the 6-digit code until the session reaches `aal2`.
  - When the API answers `MFA_REQUIRED`, ask for the code and retry the call.
- **Backend:** Supabase · **Order:** AO-2
- **Done when:** sign-in without the code is impossible, and the API accepts the token.

#### ADM-15 · Sign out and session ☑ *(3 Nov)*

**Done on 3 Nov:**
- **User menu** shows the signed-in name and email. **Sign out** also ends the session in Supabase: its refresh token stops working.
- **12-hour limit,** counted from the password sign-in (the token's `amr` time):
  - `proxy.ts` ends an older session and shows `/login?reason=expired` ("Your admin session ended after 12 hours").
  - The top-bar timer ("Session expires in 11:42") signs out when it reaches zero.
  - Signing out in another tab signs this tab out too.
- **Tokens refresh by themselves,** in the browser and in `proxy.ts`.
- **Still open on the backend:** gap G5.
- **Build:**
  - real user menu with the signed-in email, and a working sign out
  - the token refreshes automatically
  - a **12-hour admin session limit**, enforced by the frontend (backend gap G5)
  - a real "session expires in" timer
- **Backend:** Supabase · **Order:** AO-2
- **Done when:** sign out works, and the session ends 12 hours after sign-in.

#### ADM-16 · Page protection ☑ *(3 Nov)*

**Done on 3 Nov:**
- **`src/proxy.ts`** sends every page without an active session (password + 2FA, under 12 hours) to `/login?next=…`. If you're already signed in, `/login` goes straight on to the page.
- **`app/(app)/layout.tsx`** checks again on the server (`verifyAdminSession` in `src/lib/auth/session.ts`).
- **Removed:**
  - the sample login preview, with its "Explore the sample workspace" link and its styles
  - from the top bar: the sample role badge, "View profile" and the sample toast
- **Tests:**
  - 23 new unit tests in `tests/auth.test.ts` (49 admin tests in total)
  - a real run in Edge against local Supabase and the backend: 38/38 checks
  - a no-connection run: 4/4
- **Build:**
  - `proxy.ts` sends anyone without an `aal2` session to `/login`
  - the admin layout checks the session again on the server
  - remove the sample login preview and the "Explore the sample workspace" link
- **Backend:** Supabase · **Order:** AO-2
- **Done when:** every admin page opened while signed out, or before the 2FA code, goes to `/login`.

#### ADM-17 · Backup codes ⏸
- **Build:** backup codes for when the admin loses their phone. Only if D3 says yes; Supabase doesn't provide them.
- **Backend:** Decision (D3)
- **Done when:** decided and, if yes, built.

#### ADM-18 · Permissions in the UI ◐ fallback done in AO-3 (3 Nov), full version after gap G1

**Fallback done on 3 Nov:**
- **Access check:** once per page load, the admin shell calls `GET /api/v1/admin/traders?limit=1`.
  - `403 FORBIDDEN` signs out to `/login?reason=no-access` ("This account doesn't have admin access").
  - If the backend can't be reached, a banner says so, with "Try again".
- **A 403 on a page** shows "You don't have permission for this page" (`ApiErrorPanel`).
- **Tried for real:** a non-admin was signed out with the message (it still had to set up 2FA first; see G1), and a SUPPORT admin got 403 on settings.
- **Fallback now (AO-3):**
  - show the signed-in email in the top bar (done in AO-2: the user menu shows the name and email)
  - **check admin access right after login** with one call every role may make: `GET /api/v1/admin/traders` (all 4 roles have `traders.read`). On `403 FORBIDDEN`, sign out with "This account has no admin access".
    - Why (found in AO-2): until then, any Supabase account that knows its own password can set up 2FA and open the admin shell. It sees only sample data, and the backend refuses all of its API calls.
  - when the API refuses (403), show "You don't have permission for this page" instead of an error
  - admins with `admins.manage` can see their own roles (they're in the admin users list, marked "You", since AO-4)
- **Full version (after G1, a "who am I" endpoint):**
  - hide menu items and buttons the admin can't use
  - show their roles in the top bar
- **Backend:** Gap G1 · **Order:** AO-3 (fallback)
- **Done when:**
  - Now: a Support admin who opens a Finance page sees the permission message.
  - After G1: they don't see that page in the menu at all.

#### ADM-19 · Fresh 2FA code before sensitive actions ☑ *(3 Nov, in the browser; the backend check is G4)*
- **Build:**
  - Connect the existing confirm + code dialog to a real Supabase 2FA check (`mfa.challenge` + `mfa.verify`) before the action is sent.
  - Used for: role changes, disabling or re-enabling admins, settings changes and, later, payouts and risk actions.
  - Where it goes: every change already runs through one dialog built on `src/components/action-dialog.tsx`. Admin users (AO-4): Add admin, Change roles, Disable / Re-enable in `admin-user-dialogs.tsx`. Settings (AO-6): the review dialog in `settings-screen.tsx`. The code step goes into those forms, before the request is sent.
- **Backend:** Supabase (the backend doesn't check yet that the code is fresh: gap G4) · **Order:** AO-7
- **Done when:** a wrong code stops the action, and a right code lets it through.
- **Done 3 Nov:**
  - **Where:** every change asks for a 6-digit code in its dialog: Add admin, Change roles, Disable / Re-enable, and every settings save. The button stays off until all 6 digits are typed.
  - **How it's checked:** `verifyFreshCode` (`src/lib/auth/fresh-code.ts`) runs a new Supabase challenge and verify. The 2FA prompt for MFA_REQUIRED uses the same function.
  - **Refusals:** a wrong code saves nothing and empties the boxes. If the code can't be checked (no connection), the dialog says so and sends nothing.
  - **Each change asks again.** Supabase accepts a code again while it's valid (this 30-second window and the one before), so a fresh code can be up to about 90 seconds old. The backend doesn't check any of this yet (G4).
  - **Tried for real** in the AO-7 browser run: a wrong code (nothing sent), Supabase unreachable (nothing sent), then the right code (sent). The AO-4 and AO-6 runs now type the code too.

### Sprint 1 screens

#### ADM-34 · Admin users ☑ *(3 Nov, without the fresh 2FA code: that's ADM-19 in AO-7)*
- **Build:**
  - **List:** `GET /admin/users` with search (`q`) and "Load more". Columns: name, email, roles, status, 2FA enrolled, last login.
  - **Add admin:** find an **existing account** by email (`GET /admin/traders?q=`), pick one or more roles, then `POST /admin/users` with `profile_id` and `role_ids`.
    - The person must have signed up first. The backend doesn't create logins or send invites (gap G3).
    - Found in AO-3: the traders list leaves out admin members, so this search only finds accounts that aren't admins yet, which is what "Add admin" needs.
  - **Change roles:** `PATCH /admin/users/{id}` with `role_ids`.
  - **Disable:** `DELETE /admin/users/{id}`.
  - **Re-enable:** `PATCH` with `status: ACTIVE`.
  - **Clear messages** for the backend's refusals: your own access, or the last active admin.
  - Every action uses the fresh 2FA check (ADM-19).
- **Not yet:** "Reset 2FA" (gap G2) and email invitations (gap G3). Their buttons say "Not available yet".
- **Permission:** `admins.manage` · **Backend:** Live · **Order:** AO-4
- **Done when:** all actions work against the API and appear in the audit log.
- **Done 3 Nov:**
  - **Screen:** `src/components/admin-users-screen.tsx` with its dialogs in `admin-user-dialogs.tsx`; the rules behind it are in `src/lib/admin-users.ts`.
  - **List:** 100 per page (the API's maximum, so a normal team fits on one page), sorted by name. The API sends rows in ID order (G11).
  - **Search:** the server searches name or email.
  - **Status filter:** applies to the loaded rows, because the API has no status filter (G11). The screen says so when more pages exist.
  - **Last login:** says "Not recorded", because the backend never records it (G12).
  - **Your own row** is marked "You". Its actions are switched off with the reason "You can't change your own access. Ask another admin." The backend refuses those changes anyway (409).
  - **Add admin:** searches active accounts only (`status=ACTIVE`, 10 matches). It tells the new admin they set up 2FA at their next sign-in. Adding an account that's already an admin says so.
  - **Change roles:** 1 to 4 roles. "Save roles" stays off until something changes, and with no role it suggests "Disable" instead.
  - **Disable** reads the admin back after the empty 204 answer. **Re-enable** keeps their roles.
  - **Details drawer:** has the same actions, which is easier on a phone.
  - **Refusals** show the backend's own reason, in the dialog.
  - **No answer (lost connection):** the dialog says the change may already be saved, and the list loads again.
  - **Tried for real** against backend `dev` (`1d4c8bf`): API helper 31/31, browser 50/50. Included: the new admin set up 2FA and got in; Finance access applied at once after a role change; a disabled admin's next request was refused (403); every change was in the audit log with qa-admin as the actor; a Support admin gets the permission message.

#### ADM-35 · Audit log ☑ *(3 Nov)*
- **Build:**
  - real entries from `GET /admin/audit-logs`, newest first, with "Load more"
  - filters: actor, action, entity type, date range (UTC)
  - details drawer: before and after values side by side, IP, browser (user agent), request ID
  - read only: no edit or delete
- **Not yet:**
  - a server-side IP filter and actor names (gap G6). The actor shows as an ID, or as a name when the viewer can see the admin list.
  - admin sign-ins in the log (they go to Supabase, not the API).
- **Permission:** `audit.read` · **Backend:** Live · **Order:** AO-5
- **Done when:** entries from real admin actions (AO-4, AO-6) show, and the filters work.
- **Ready from AO-4:** admin-user changes are logged as `createAdminMember`, `updateAdminMember` and `disableAdminMember`, with entity type `admin_members` and the member's ID. `actor_id` is the acting admin's **member** ID, not their profile ID, so the admin users list can turn it into a name.
- **Done 3 Nov:**
  - **Screen:** `src/components/audit-screen.tsx`; the rules behind it are in `src/lib/audit.ts`. 50 entries per page, newest first, with "Load more".
  - **Filters:** Who, Action, Record and From/To (UTC days, sent as `00:00:00.000Z` to `23:59:59.999Z`) are applied by the server. IP filters the loaded entries and says so when more pages exist (G6).
  - **Bad filters are explained, not sent:** a backwards date range, or a partial admin ID typed by someone who can't see names. The API would refuse both (400).
  - **Words, not codes:** each action is shown in plain words with its code underneath (the 23 write operations; a test keeps the list equal to the contract). An admin change says what it did: re-enabled, disabled or roles changed.
  - **Records** are named from the entry itself (email, setting key, name), so they read well after the record is gone.
  - **Names (G6):** admins who can manage admins see names, from the admin list. Others (Risk, Finance) see "Admin 3cddad6e…" with a note.
  - **IPs:** IPv4 addresses arrive as `::ffff:127.0.0.1` and show as `127.0.0.1`. The IP filter matches either form.
  - **Details drawer:** who (name and email), actor type and ID, action, record, IP, browser, request ID, entry ID, "Changed: …", and before and after side by side with the changed fields first.
  - **Read only:** no buttons. The API has no route to change an entry (DELETE, PATCH and PUT → 404, checked).
  - **Tried for real** against backend `dev` (`1d4c8bf`): API helper 24/24, browser 33/33, including a Finance viewer (IDs, filter by a typed ID) and a Support viewer ("You don't have permission for this page").

#### ADM-36 · Settings ☑ *(3 Nov, without the fresh 2FA code: that's ADM-19 in AO-7)*
- **Build:**
  - all 7 settings from `GET /admin/settings`:
    - platform name
    - support email
    - restricted countries
    - daily reset time (UTC)
    - snapshot interval (seconds)
    - payout wallet hold (hours)
    - minimum age
  - save each with `PUT /admin/settings/{key}`, showing the backend's validation messages
    - Found in AO-3: a bad value comes back under the field name `input`, not `value` (gap G10). Show it under the value field.
  - restricted-countries editor (ISO country codes). Suggested start: Bybit's 11 codes (US, CN, HK, SG, CA, KP, CU, IR, UZ, SD, SY).
  - every save uses the fresh 2FA check (ADM-19)
- **Permission:** `settings.manage` · **Backend:** Live · **Order:** AO-6
- **Done when:** changes save and show in the audit log.
- **Found in AO-5:** locally only 5 of the 7 settings have a saved value. `platform_name` and `support_email` have no row yet, so `GET /admin/settings/{key}` answers 404 for them and the list leaves them out. The screen must show those two as "not set yet". Saving one creates it, because `PUT` is an upsert.
- **Done 3 Nov:**
  - **Screen:** `src/components/settings-screen.tsx`; the rules behind it are in `src/lib/settings.ts`. Three groups: Trader sign-up, Platform, Trading and payouts. Each setting is saved on its own.
  - **In use or not:** each setting says whether anything reads it (checked in the backend at `1d4c8bf`). Only sign-up reads two of them: `restricted_countries` (refuses those countries, and the website's public list shows them) and `min_age_years` (refuses a date of birth below it). The other 5 say "Not used yet" and why (G17). Sign-up stops completely if either of the two is missing, and the API has no delete, so they can't be removed.
  - **Checked before sending:** text 1–120 characters, an email, a time as HH:mm, whole numbers in each range, and countries from the backend's 249 ISO codes (`apps/admin/contract/country-codes.json`, a copy, G16). Errors show under the field, only while the value differs from the saved one.
  - **Review before saving:** "Now → New" in words, or, for countries, "Will be restricted" and "Can sign up again". "Not set yet" settings say saving creates them. The backend's own refusal (under `input`, `value` or `value.0`, G10) shows in the dialog.
  - **No answer:** the dialog says the value may already be saved, and the settings load again. The dialog stays on screen while they load (a bug the browser test found).
  - **Who changed it:** the admin's name, or "the initial setup" for seeded values.
  - **Restricted countries:** search by name or code, chips for the chosen ones, "N to add · M to remove", a link to Bybit's official list, and the client decision (Q11: sign-up blocks the countries Bybit doesn't serve). **The list is still empty locally, so sign-up allows every country.** An admin must enter Bybit's list on this page (staging included).
  - **Tried for real** against backend `dev` (`1d4c8bf`): API helper 17/17 and browser 39/39. Included: saving Antarctica made the website's public list show it, and sign-up from AQ was refused (COUNTRY_RESTRICTED). A minimum age of 21 refused a 19-year-old (UNDER_AGE). Both were put back, and the same sign-ups then passed those checks (they stopped at Terms, so no account was made). Every save was in the audit log, nothing was logged for refused values, and a Support admin gets the permission message. Settings were left exactly as found.

#### ADM-37 · Settings: KYC gates ⏸
- **Build:** choose when KYC is required, in any combination: at sign-up, before the funded account, before the first payout. The default is before the first payout. This is a client requirement.
- **Backend:** Decision (D4); no setting exists yet
- **Done when:** decided and built.

#### ADM-69 · Sprint 1 demo check ☑ on this computer *(3 Nov; staging in AO-8)*
- **Build:** a short written demo script, run end to end:
  1. Open the admin app while signed out: you're sent to login.
  2. Sign in with the password only: you can't get in.
  3. Enter the 6-digit code: you're in.
  4. A new admin's first login forces 2FA setup.
  5. Add an admin with a role, then change their role.
  6. Change a setting (e.g. restricted countries).
  7. Open the audit log: the role change and the setting change are there, with before/after values.
  8. Sign out.
- **Order:** AO-7
- **Done when:** every line passes on this computer (and on staging in AO-8).
- **Done 3 Nov (on this computer):** the script is [`docs/ADMIN_SPRINT1_DEMO.md`](ADMIN_SPRINT1_DEMO.md). All 8 steps passed in the AO-7 browser run (31/31): signed-out redirect, password-only refused, the code lets you in, a new admin forced to set up 2FA, add and change role, a setting with a fresh code, both in the audit log with before and after, sign out.

#### ADM-68 · Admin app on staging ⏸ *(added 3 Nov)*
- **Build:** deploy the admin app with the staging settings. The staging setup needs:
  - a staging backend with `ADMIN_URL` set to the admin app's staging address
  - hosted Supabase with TOTP 2FA switched on
  - the first admin created there (ADM-67's SQL)
- **Backend:** Needs staging (manager / backend) · **Order:** AO-8
- **Done when:** the Sprint 1 demo script (ADM-69) passes on staging.

### Programs and rule sets (API live)

All need `programs.manage`; publishing a rule set needs `rules.publish`.

Program rules from the contract:
- Program types are `INSTANT` (1 funded phase), `ONE_STEP` (1 challenge + funded) and `TWO_STEP` (2 challenges + funded).
- Status changes allowed: Draft → Active, Active → Archived, Archived → Active, Draft → Archived. Never back to Draft, and there is no delete.
- A program can become Active only with:
  - phases that match its type
  - a published rule set on every phase
  - at least one active account size
  - a payout policy

#### ADM-20 · Programs list ☐
- **Build:** live list with status and type filters (`listAdminPrograms`).
- **Order:** AO-9
- **Done when:** programs from the API show and the filters work.

#### ADM-21 · Program details page ☐
- **Build:** one page showing everything about a program (`getAdminProgram`).
- **Order:** AO-9
- **Done when:** every program field from the API is shown.

#### ADM-22 · Create and edit a program ☐
- **Build:**
  - create (`createAdminProgram`) and edit (`updateAdminProgram`)
  - fields: name, slug, type, free trial, fee refund on first payout
  - the type can change only while Draft
- **Order:** AO-9
- **Done when:** a program can be created and edited, and errors show next to the fields.

#### ADM-23 · Program status changes ☐
- **Build:**
  - buttons for the allowed changes only
  - when the API refuses (409), show its reason
  - an archived program allows only a status change
- **Order:** AO-9
- **Done when:** every allowed change works, and a blocked change shows the reason.

#### ADM-24 · Phases ☐
- **Build:**
  - add or edit a phase: Challenge or Funded, rule set, maximum days
  - remove only while Draft
  - (`createAdminProgramPhase`, `updateAdminProgramPhase`, `deleteAdminProgramPhase`)
- **Order:** AO-11
- **Done when:** the phases can be built for all 3 program types.

#### ADM-25 · Account sizes and prices ☐
- **Build:** add a size, edit its price, switch a size off; never delete (`createAdminAccountSize`, `updateAdminAccountSize`).
- **Order:** AO-11
- **Done when:** sizes and prices save, and inactive sizes show as inactive.

#### ADM-26 · Add-ons ☐
- **Build:**
  - code (fixed after creation), name, price (fixed or percent), what it changes
  - (`createAdminAddon`, `updateAdminAddon`)
  - the list of possible add-on effects isn't decided yet
- **Order:** AO-11
- **Done when:** add-ons can be created and edited.

#### ADM-27 · Payout policy ☐
- **Build:**
  - split %, minimum payout, on demand or by cycle (with cycle days), maximum per payout, maximum per cycle, maximum per trader, wallet hold hours
  - Draft only
  - (`replaceAdminPayoutPolicy`, `deleteAdminPayoutPolicy`)
- **Order:** AO-11
- **Done when:** the policy saves, and editing is blocked outside Draft.

#### ADM-28 · Scaling milestones ☐
- **Build:**
  - trigger: number of payouts, months funded or profit %. Effect: new split % and/or size increase %.
  - Draft only
  - (`createAdminScalingMilestone`, `updateAdminScalingMilestone`, `deleteAdminScalingMilestone`)
- **Order:** AO-11
- **Done when:** milestones can be added, edited and removed.

#### ADM-29 · Allowed pairs per program ☐
- **Build:** choose the trading pairs, with a leverage limit up to the pair's cap (`replaceAdminProgramInstruments`).
- **Order:** AO-11
- **Done when:** the pairs and limits save.

#### ADM-30 · Rule set versions list ☐
- **Build:** all versions for one program, newest first (`listAdminRuleSets`).
- **Order:** AO-10
- **Done when:** versions show with their status (Draft, Published, Retired).

#### ADM-31 · Create and edit a draft ☐
- **Build:**
  - a new draft gets the next version number (`createAdminRuleSet`); edit it with `updateAdminRuleSet`
  - all contract fields:
    - profit target %, daily loss %, maximum loss %, drawdown static or trailing
    - minimum trading days, inactivity days, consistency %
    - stop-loss required within X seconds, maximum risk per trade %, maximum exposure %, minimum hold seconds
    - news, weekend and bots allowed
    - notes
- **Order:** AO-10
- **Done when:** a draft can be created and saved, and a published version can't be edited.

#### ADM-32 · Publish a rule set ☐
- **Build:** a confirm dialog, then `publishAdminRuleSet`. An already-published set (409 `RULE_SET_PUBLISHED`) shows a clear message.
- **Permission:** `rules.publish` (Admin only) · **Order:** AO-10
- **Done when:** publishing freezes the version and shows who published it and when.

#### ADM-33 · Compare two versions ☐
- **Build:** a side-by-side comparison done in the browser (the API has no comparison endpoint).
- **Order:** AO-10
- **Done when:** the changed rules are clearly marked.

### Traders (API live for the basics)

#### ADM-44 · Traders list and Trader 360 ☐
- **Build:**
  - **Now (live):** traders list with search (`q`) and status filter, and the trader detail (name, email, country, status, KYC status, last login).
  - **Later (needs API):** the other Trader 360 tabs: accounts, orders, payouts, devices and IPs, flags.
- **Permission:** `traders.read` · **Backend:** Live (list and detail) / Needs API (tabs) · **Order:** AO-12
- **Done when:** real traders show with their details.

#### ADM-45 · Trader actions ☐
- **Build:** edit first and last name; change status (Active, Locked, Suspended, Closed), each with a confirm step (`PATCH /admin/traders/{id}`).
- **Permission:** `traders.update` · **Backend:** Live · **Order:** AO-12
- **Done when:** the changes save and appear in the audit log.

#### ADM-46 · Trader 360 extras ☐
- **Build:**
  - login history
  - country-mismatch flag
  - accepted agreements
  - who referred them
  - account details: positions, trades, daily stats
- **Permission:** `traders.read` · **Backend:** Needs API · **Order:** AO-14+

### Waiting for backend APIs (AO-14 and later)

These stay as labelled previews until the backend defines their API. Each becomes its own build order then.

| Step | What | Permission | Planned backend week |
|---|---|---|---|
| ADM-38 | Instruments: on/off, leverage cap, max position, sync from Bybit | `instruments.manage` | Week 1–2 |
| ADM-39 | Discount codes: create, edit, deactivate | `discounts.manage` | Week 2 |
| ADM-40 | Orders and payments: list, detail, status, method, tx hash | `orders.read` | Week 2 |
| ADM-41 | Payment events (webhooks) and reconciliation | `orders.read` | Week 2 |
| ADM-42 | Refunds from an order (replaces today's refund queue) | `refunds.create` | Week 2 |
| ADM-43 | Invoices (PDF) and ledger | `orders.read` | Week 2 |
| ADM-47 | KYC queue and review: documents, checklist, approve / reject / resubmit | `kyc.review` | Week 3 |
| ADM-48 | Pass reviews: metrics, approve or reject with a note | `risk.review` | Week 3 |
| ADM-49 | Live updates over WebSocket: violations, connections, payout queue | — | Week 3 |
| ADM-50 | Risk monitor with live usage bars | (D1) | Week 3 |
| ADM-51 | Violations and account actions, including "close positions" | `risk.action` | Week 3 |
| ADM-52 | Connection health: stream status, delay, key expiry | (D1) | Week 3 |
| ADM-53 | Abuse review: flag types and outcomes ("Should", not "Must") | `risk.review` | Week 3 |
| ADM-54 | Payout approvals: every payout approved by a person | `payouts.approve` | Week 4 |
| ADM-55 | Sending payouts, transactions and history | `payouts.send` | Week 4 |
| ADM-56 | Affiliates, commission plans and commissions (1 level) | `affiliates.manage` | Week 4 |
| ADM-57 | Notification templates (new screen) | `notifications.manage` | Week 4 |
| ADM-58 | Liability totals and alerts | (D1) | Week 4 |
| ADM-59 | Dashboard with real numbers | (D1) | After the above |
| ADM-60 | Reports and exports (CSV / XLSX) with download | (D1) | After the above |
| ADM-61 | Legal document versions | Decision (D6) | Before launch |

### Finish (AO-last)

#### ADM-62 · Security headers ☐
- **Build:** security headers and a Content Security Policy for the admin app.
- **Done when:** the headers are on every page.

#### ADM-63 · Test IDs check ☐
- **Build:** a final check that every button and form field has a `data-testid`.
- **Done when:** nothing is missing.

#### ADM-64 · Remove everything fake ☐
- **Build:** delete:
  - the mock data
  - the "Sample data" tag
  - the `?state=` preview switch
  - any leftover preview code
- **Done when:** no fake data remains anywhere.

#### ADM-65 · Phone and accessibility pass ☐
- **Build:** check every screen on phone and desktop, keyboard use, labels and contrast.
- **Done when:** every screen works on both and with the keyboard.

#### ADM-66 · Final check ☐
- **Build:** full test run, production build and a security review.
- **Done when:** everything passes and is ready to deploy.

### Later (after launch, not planned now)

Competitions, certificates and news blackout windows. The manager's plan moved these after launch.

---

## 6. Backend gaps (send to the backend engineer)

The admin API on backend `dev` covers most of Sprint 1. These pieces are missing; the panel works around each until it's added.

| ID | Missing on the backend | Sprint task | What the panel does until then |
|---|---|---|---|
| **G1** | A "who am I" endpoint for admins (e.g. `GET /admin/me`: my member record, roles, permissions). Ideally it also answers before the 2FA step (`aal1`), so the login can turn away non-admin accounts before they set up 2FA. | AD1-07 | Shows the name and email (AO-2); on every page load, one call every role may make tells admins from other accounts, and signs the others out (AO-3); explains 403s; can't hide what you can't use (ADM-18) |
| **G2** | Reset another admin's 2FA (needs the Supabase admin API on the server) | AD1-03 | "Reset 2FA" shows "Not available yet" |
| **G3** | Invite or create an admin login by email; today `POST /users` only grants access to an existing account | AD1-03 | "Add admin" picks an account that already signed up |
| **G4** | Check that a fresh 2FA code was entered before sensitive actions (role changes, disabling admins, settings, payouts, risk actions), e.g. a `totp` entry in `amr` less than a few minutes old. Note (checked 3 Nov): Supabase accepts the same code again while it's valid, about 90 seconds. | AD1-07 | Asks for a real fresh code in the browser before every change (ADM-19, AO-7); the API doesn't check it |
| **G5** | Enforce the 12-hour admin session. Today the backend accepts any valid `aal2` token, however old the sign-in is, and Supabase sessions never end on their own. So a stolen refresh token keeps working past 12 hours outside the admin app. Fix: the backend refuses admin tokens whose `amr` password time is over 12 hours old. Don't set Supabase's **Time-box user sessions** to 12 h: it applies to every account in the project, traders included (corrected 3 Nov; the trader plan, `docs/WEB_BUILD_PLAN.md`, sets it to 7 days). | AD1-07 | The admin app ends the session 12 hours after the password sign-in, in `proxy.ts` and in the browser, and signs it out in Supabase (ADM-15) |
| **G6** | Audit log: an IP filter, and the actor's name or email in each entry | AD1-05 | Filters IP on loaded rows only, and says so. Names come from the admin list for admins who can manage admins; others see "Admin 3cddad6e…" with a note (AO-5) |
| **G7** | First admin on staging: there is no script, only manual SQL | Sprint 1 | ADM-67's SQL, run by the backend engineer on staging |
| **G8** | Staging: deployed backend + hosted Supabase (2FA on) + `ADMIN_URL` set to the staging admin address | Sprint 1 acceptance | Demo only on this computer until it exists (AO-8 ⏸) |
| **G9** | Admin password strength: local Supabase allows 6 characters with no rules | Security | Nothing in the panel; set a strong policy in hosted Supabase |
| **G10** | `PUT /admin/settings/{key}` reports a bad value under the field name `input` instead of `value` (found in AO-3) | AD1-06 | Shows `input` messages under the value field (ADM-36) |
| **G11** | `GET /admin/users` has no `status` filter, and returns rows in internal ID order, which looks random (found in AO-4). Add `status`, and order by email or name. | AD1-03 | Asks for 100 per page, sorts the loaded rows by name, and filters status on the loaded rows (and says so when there are more pages) |
| **G12** | Admin last login is never recorded: nothing writes `admin_members.last_login_at` (or `profiles.last_login_at`), so `GET /admin/users` always sends `null` (found in AO-4). Fill it from Supabase's `auth.users.last_sign_in_at`, or record it at sign-in. | AD1-03 | Shows "Not recorded", not "Never" |
| **G13** | The contract doesn't list all 18 permission codes: `StaffRole.permissions` is plain text, and only the 7 codes the routes use appear (found in AO-4). Publish the `PermissionCode` list in `openapi.json`. | AD1-04 | Keeps a copy of the backend's list (`apps/admin/contract/permissions.json`), checked by a test; copy it again when the backend changes it |
| **G14** | Audit IPs behind a proxy: the backend saves `request.ip` but never sets Express's `trust proxy`. On staging or production behind a load balancer, every entry would show the proxy's IP (found in AO-5). Set `trust proxy` to the host's proxy hops, and check one staging entry. | AD1-05, AO-8 | Shows the IP the backend saved; correct locally (`127.0.0.1`) |
| **G15** | The audit "request ID" is a new random ID per entry, written only to the audit table. No request header or server log carries it, so an entry can't be matched to server logs (found in AO-5). Give each request one ID, log it, return it as a header, and save that one. | AD1-05 | Shows it as "Request ID" (it does identify the entry) |
| **G16** | The contract's `CountryCode` only checks two capital letters; the 249 accepted codes (backend `iso-country-codes.ts`) aren't in `openapi.json` (found in AO-6). Publish them as an enum. | AD1-06 | Keeps a copy (`apps/admin/contract/country-codes.json`), checked by a test; copy it again when the backend changes it |
| **G17** | 5 of the 7 settings aren't read by anything yet (found in AO-6): `platform_name` and `support_email` (no branding or emails yet); `daily_reset_utc` (the rules library takes the reset time as an input, but nothing passes the setting); `snapshot_interval_seconds` (no snapshot worker yet); `payout_wallet_hold_hours` (each program's payout policy has its own `wallet_hold_hours`, so decide which one wins). | AD1-06 | Each says "Not used yet" and why; change `inUse` in `src/lib/settings.ts` when the backend starts reading one |

---

## 7. Open questions (ask the manager)

| ID | Question | Blocks |
|---|---|---|
| D1 | **Permissions.** The backend now enforces the seed's 18 permissions. The Tech Spec disagrees in places (e.g. Admin + Risk publishing rule sets). Viewing the risk monitor, connection health, KPIs, reports and liability has **no permission** in the seed. Which is right? | ADM-50, ADM-52, ADM-58 – ADM-60 |
| D2 | **Endpoints for identity and re-auth.** Same as gaps G1 and G4: who builds them, and when? | ADM-18 (full), ADM-19 (backend check) |
| D3 | **Backup codes.** Do admins get backup codes? Supabase doesn't provide them. | ADM-17 |
| D4 | **Client settings.** KYC gates, consistency rule settings and the reset timezone are client requirements with no backend support. | ADM-37, ADM-31 |
| D5 | **Table totals.** Tables can't show total counts (the API's paging has none). Is that OK? | ADM-10 |
| D6 | **Legal versions.** Admin screen, or a database migration per version? | ADM-61 |
| D7 | **Staging for the 4 Nov demo.** Where are the backend, hosted Supabase and admin app hosted, and who deploys them? | AO-8 |
| D8 | **Fresh 2FA code: for every change, or once per few minutes?** Every change asks today (strict). A short "confirmed" window, for example 5 minutes, makes several changes in a row easier. | ADM-19 |
| D9 | **The restricted-country list.** Q11: sign-up blocks the countries Bybit doesn't serve. Someone must confirm the exact list (it changes), and whether UAE residents are left out (Q11's note). | Closing A6, ADM-36 |
| D10 | **Payout wallet hold.** There's a global setting and a value per program's payout policy. Which one applies? | G17, ADM-36 |

---

## 8. Sources

| Topic | Where |
|---|---|
| Sprint 1 promise and client check | Payment plan, Instalment 1 (Sprint 1, demo Wed 4 Nov) |
| Sprint 1 admin tasks | Sprint 1 detailed plan, section 9.2 (AD1-01 – AD1-07) |
| Backend admin API | Backend repo, `dev` at `4b81f8d`: `docs/ADMIN_API.md`, `openapi.json` v1.1.0, `src/contracts/admin-foundation.ts` |
| Permissions and roles | Backend `supabase/seed.sql`, `src/contracts/permissions.ts` |
| Admin tables (first-admin SQL) | Backend `supabase/migrations/20261031000100_p1_foundation.sql` |
| Current admin app | `apps/admin/src`, `docs/admin-preview.md`, `apps/admin/VISUAL_AUDIT.md` |
| UI rules and palette | `docs/ADMIN_UI_RULES.md`, `DESIGN.md` |
| Scope and schedule | The manager's v2 backend guide and decisions (31 Oct 2026) and the week 1 plan |
| Client decisions | The project's client answers log |
| Supabase session limits (G5) | [Supabase: User sessions](https://supabase.com/docs/guides/auth/sessions) (time-box, Pro plan) |
| Next.js advisories (ADM-70) | GitHub Advisory Database: GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r |
| API types (ADM-08) | `openapi-typescript` 7.13.0 (MIT, openapi-ts project, released 11 Feb 2026, no advisories) |
| Error, loading and not-found files (ADM-06) | The bundled Next.js 16.3 docs: `error.md` (`retry`), `loading.md`, `not-found.md`; `forbidden.md` is still experimental, so it isn't used |
| Admin users and roles (ADM-05, ADM-34) | Backend `dev` at `1d4c8bf`: `src/contracts/admin-foundation.ts` (StaffMember, StaffRole, request bodies), `src/contracts/permissions.ts`, `src/api/admin/admin-foundation.service.ts` (the self and last-Admin refusals, the search, the ID order), `src/api/admin/admin.service.ts` (one transaction per change with its audit record; the action is the operation ID), `supabase/seed.sql` (roles, permission descriptions) |
| Audit log (ADM-35) | Backend `dev` at `1d4c8bf`: `src/contracts/admin-foundation.ts` (AuditRecord, the audit query), `src/api/admin/admin-foundation.service.ts` (`listAdminAuditLogs`: exact action and record type, `created_at` range, newest by ID), `src/api/admin/admin.service.ts` (the only writer: action = operation ID, IP = `request.ip`, request ID = random), `src/contracts/primitives.ts` (Timestamp: ISO 8601 with `Z`; UUID: RFC 9562) |
| Settings (ADM-36) | Backend `dev` at `1d4c8bf`: `settingSchemas` in `src/api/admin/admin-foundation.service.ts` (the rules per key; `PUT` is an upsert), `src/contracts/iso-country-codes.ts` (249 codes), the sign-up hook `validate_trader_signup` in `supabase/migrations/20261103000100_sprint_1_signup.sql` (reads `restricted_countries` and `min_age_years`), `src/api/signup/signup.controller.ts` (public restricted-countries list), `src/lib/rules/trading-day.ts` (reset time is an input, default 00:00 UTC), `src/contracts/programs.ts` (per-program `wallet_hold_hours`); client decision Q11 in the project's client answers |
| Fresh 2FA code (ADM-19) | Supabase JS `mfa.challengeAndVerify`; that a code is accepted again within its validity was checked against local Supabase on 3 Nov. Next.js 16.3 bundled docs: `app-icons.md` (`app/icon.svg`) |

---

## 9. Change log

| Date | Step | Note |
|---|---|---|
| 2 Nov 2026 | – | Plan created. Earlier the same day: `apps/admin` added to the workspaces (`package.json`, `bun.lock`), so the admin app installs and runs. |
| 2 Nov 2026 | – | Added "What we can build before the backend is finished" and a sample mode for ADM-09, because the backend wasn't finished. |
| 2 Nov 2026 | – | Colours only (not a numbered step): new readable admin palette in packages/ui (dark neutral layers, web-theme accents), at the user's request. See DESIGN.md › Admin palette. |
| 3 Nov 2026 | AO-1 | **Done.** ADM-67: backend `dev` running locally in a separate worktree, first admin created, 2FA chain tested end to end (9/9). ADM-07: settings file plus a startup check, with 10 tests. ADM-01: root checks cover both apps. Checks: lint ✓, typecheck (web and admin) ✓, tests 15 + 26 ✓, both production builds ✓. README updated. |
| 3 Nov 2026 | – | **Rebuilt as build orders (AO-1 …).** Reasons: the backend's `dev` branch now has a live admin API (35 routes, contract v1.1.0, `4b81f8d`), and Sprint 1 promises "admin panel with mandatory 2FA, roles and audit log" for the Wed 4 Nov demo. Changes: Sprint 1 orders come first; programs, rule sets and trader basics moved from "API defined" to "Live"; the sample mode in ADM-09 was dropped (the screens it served now have a live API); ADM-34 – ADM-36 rewritten to the real API; added ADM-67 (local backend + first admin), ADM-68 (staging) and ADM-69 (Sprint 1 demo check); added backend gaps G1–G9 and question D7. |
| 3 Nov 2026 | AO-2 | **Done.** ADM-11 – ADM-16: real Supabase login with mandatory 2FA (setup on first login, code on every login), page protection in `proxy.ts` plus a server check, sign out, and the 12-hour session with a top-bar timer. Sample login preview removed. Checks: lint ✓, admin typecheck ✓, admin tests 49 ✓ (23 new), admin production build ✓, real run in Edge 38/38 ✓ (phone width and both 12-hour paths included), no-connection run 4/4 ✓, QR code decoded ✓. Still to do: the first scan with a phone authenticator app, by the user. |
| 3 Nov 2026 | ADM-70 | **Added.** `bun audit` found 2 critical and 1 high Next.js advisories for 16.0.0 – 16.4.0; both apps use 16.3.8; fixed in 16.4.1. Also from AO-2's tests: the admin favicon 404 (added to ADM-03), non-admin accounts can sign in until AO-3's access check (ADM-18, G1 updated), and the 12-hour limit isn't enforced for direct API calls (G5 updated). |
| 3 Nov 2026 | AO-3 | **Done.** ADM-08: contract copy + generated types (`openapi-typescript` 7.13.0, dev only). ADM-09: one API helper (2FA token, timeouts, safe read retries, session renewal, 2FA prompt, a message per error code, money as text, UTC times); lint blocks direct `fetch`. ADM-10: cursor paging (list state, hook, "Load more"). ADM-06: loading, error (with `retry`) and not-found pages, plus a shared API error panel. ADM-18 fallback: access check on every page load signs non-admins out. Checks: lint ✓, typecheck (both apps) ✓, tests web 15 + admin 109 (60 new) ✓, admin production build ✓, real backend 15/15 ✓, browser 26/26 ✓, AO-2 login test again 39/39 ✓. Local QA accounts made for testing (qa-admin, qa-support, qa-newadmin, qa-trader 1–3). Found: G10 (settings field name), the shared `Modal`'s dev double-run close (ADM-03), the traders list leaves out admin members (ADM-34). |
| 3 Nov 2026 | G5 | **Corrected.** Supabase's "Time-box user sessions" applies to every account in the project, so it must not be set to 12 h (traders get 7 days, see `docs/WEB_BUILD_PLAN.md`). The admin 12 h stays in the backend and the admin app. |
| 3 Nov 2026 | AO-4 | **Done.** ADM-05: live roles matrix (4 roles × 18 permissions), one permission list for the app (`src/lib/auth/permissions.ts`) kept equal to the backend's by a test; the 16 old sample permissions removed. ADM-34: live admin users (list and search, add an existing account, change roles, disable, re-enable, details drawer), the backend's refusals shown as it words them; "Reset 2FA" says "Not available yet". Also: the top bar says "Live data" or "Sample data" for each page, and hides the sample clock on live pages; `DataTable` got optional row names, row test IDs, a drawer title and an empty message; the list hook can swap in one edited row; tables keep their screen-reader text inside their scroll box (a phone overflow found by the browser test). Checks: lint ✓, typecheck (both apps) ✓, tests web 29 + admin 129 (20 new) ✓, admin production build ✓, real backend 31/31 ✓, browser 50/50 ✓, AO-3 browser test again 26/26 ✓, AO-2 login test again 39/39 ✓. Contract unchanged at backend `1d4c8bf`. Found: G11, G12, G13. |
| 3 Nov 2026 | AO-5 | **Done.** ADM-35: live audit log. Newest first, 50 per page with "Load more". The server filters by who, action, record type and UTC days; the screen filters IP on the loaded entries (G6). Actions and records are shown in words; the details drawer shows before and after with the changed fields first. Names come from the admin list when allowed, otherwise short IDs. Read only. The sample audit events were removed, and the top bar marks `/audit-log` and `/audit` as live. Checks: lint ✓, typecheck (both apps) ✓, tests web 29 + admin 140 (11 new) ✓, admin production build ✓, real backend 24/24 ✓, browser 33/33 ✓, again AO-4 50/50, AO-3 26/26, AO-2 39/39 ✓. Found: G14 (audit IPs behind a proxy), G15 (request ID not tied to logs), and that `platform_name` and `support_email` have no saved value yet (noted in ADM-36). |
| 3 Nov 2026 | AO-6 | **Done.** ADM-36: live settings. All 7 in three groups, each checked before sending, reviewed ("Now → New", or countries to restrict and free) and saved on its own; "not set yet" ones are created by saving; each says whether anything uses it. The restricted-countries editor covers the backend's 249 ISO codes. The backend's refusals show in the dialog; with no answer, the settings load again and the dialog keeps its message. Also: the action-dialog frame is shared by admin users and settings; `outcomeUnknown` moved to `src/lib/api/errors.ts`; the sample settings data was removed; `/settings` is marked live. Checks: lint ✓, typecheck (both apps) ✓, tests web 29 + admin 155 (15 new) ✓, admin production build ✓, real backend 17/17 ✓ (sign-up obeys both settings), browser 39/39 ✓, again AO-5 33/33, AO-4 50/50, AO-3 26/26, AO-2 39/39 ✓. Found: G16 (country list not in the contract), G17 (5 settings nothing reads yet), and that the restricted list is still empty, so sign-up allows every country (client decision Q11 wants Bybit's list). |
| 3 Nov 2026 | AO-7 | **Done.** ADM-19: a fresh 2FA code before every change (add admin, change roles, disable, re-enable, each setting), checked with Supabase; a wrong or uncheckable code sends nothing. ADM-03: sidebar marking on alias and detail pages, the KYC card link, self-closing toasts (paused while hovered or focused), the app icon, and the shared Modal's development double-run fix. ADM-69: demo script written (`docs/ADMIN_SPRINT1_DEMO.md`) and passed end to end locally. Also: the 2FA prompt uses the same code check. Checks: lint ✓, typecheck (both apps) ✓, tests web 29 + admin 162 (7 new) ✓, admin production build ✓, AO-7 browser 31/31 ✓; again AO-6 39/39 + 17/17, AO-5 33/33, AO-4 50/50, AO-3 26/26, AO-2 39/39 ✓. Found: Supabase accepts a code again while it's valid (added to G4); new decisions D8 – D10; the Sprint 1 close-out list (section 1). |
