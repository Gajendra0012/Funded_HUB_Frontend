# Admin App Build Plan

**Goal:** build the Funded HUB admin app (`apps/admin`) completely and correctly, one small step at a time.

- Created: 2 Nov 2026
- Last updated: 2 Nov 2026
- Progress: **0 of 66 steps done**

---

## 1. How we work

1. **One step at a time, in order.** Finish the current step before starting the next.
2. **Small steps.** Each step is one feature or one part of a screen.
3. **Blocked step?** Mark it ⏸, write down why, and move to the next step that isn't blocked. Come back when the blocker is solved.
4. **Read first.** Before coding, read:
   - `docs/ADMIN_UI_RULES.md` and `DESIGN.md` (look and feel)
   - the Next.js 16 guide in `node_modules/next/dist/docs/` (this Next.js version has breaking changes)
   - the backend API contract (`Funded_Hub_backend/openapi.json`) for any screen that uses the API
5. **No guessing data.**
   - If the API is **defined** but not live yet, build against the contract types, using sample data that matches the contract exactly.
   - If **no API is defined**, don't invent the data shape. Get the contract from the backend first.
6. **No fake security.** The UI must never pretend that login, 2FA or permissions work when they don't. The backend decides permissions; the UI only hides what the user can't use.
7. **Commits.** One commit per step, with the step ID in the message (for example `ADM-05: real permission list`). We need push access to the repo first.

### Done means

A step is ☑ only when all of these are true:

- [ ] `bun run lint` passes
- [ ] Admin type check passes (`bun run --cwd apps/admin typecheck`)
- [ ] Admin tests pass, and new logic has new tests (`bun run --cwd apps/admin test`)
- [ ] The page opens and works in the browser at http://127.0.0.1:3101, on desktop and phone width
- [ ] Every new button and form field has a `data-testid`
- [ ] This file is updated: status, date, short note

### Legend

**Status:** ☐ to do · ◐ in progress · ☑ done · ⏸ blocked

**Backend:**

| Tag | Meaning |
|---|---|
| **Frontend only** | No backend needed |
| **Supabase** | Uses Supabase Auth directly |
| **API defined** | In backend contract v1, but not coded yet |
| **Needs API** | Database table exists, no endpoint yet |
| **Decision** | Waiting for a decision (see section 5) |

---

## 2. Where we are today (2 Nov 2026)

- **The admin app is a visual preview only.** All 22 screens look finished, but:
  - all data is fake (`apps/admin/src/mocks`)
  - every button only shows a "Sample… previewed" message
  - there is no login, 2FA, session, page protection, permission check, paging or live data
- **The backend API defines only Programs and Rule sets.** That's 22 admin endpoints, and none are coded yet. Every other admin screen needs backend endpoints first.
- **2FA is switched off** in the backend's local Supabase config (`supabase/config.toml`: `enroll_enabled = false`, `verify_enabled = false`). Admin 2FA can't be tested locally until it's switched on.
- **The admin install was fixed on 2 Nov 2026.** `apps/admin` was added to the workspaces, so the app now installs and runs.

### What we can build before the backend is finished

| Steps | What they need | Can we build now? |
|---|---|---|
| Phase 0–1 (ADM-01 – 10) | Nothing from the backend. The API types come from `openapi.json`, which already exists. | **Yes** |
| Phase 2 (ADM-11 – 16) | Only Supabase, running locally from the backend repo (Docker). Not the backend code. One small config change: switch TOTP 2FA on in `supabase/config.toml`. | **Yes**, after that config change |
| Phase 3–4 (ADM-20 – 33) | The API is **defined** in the contract but not coded. We build in **sample mode** (see ADM-09): sample answers shaped exactly like the contract. When the backend endpoints are ready, we switch one setting to live and test again. | **Yes**, in sample mode |
| ADM-17 – 19, 37, 61 | Decisions D2–D6 | No, blocked |
| Phase 5–9 (ADM-34 – 60) | **No API defined yet.** We would have to guess the data, which breaks rule 5. | **No.** These screens stay as the current preview until the backend defines their API. |
| Phase 10 (ADM-62 – 66) | Nothing; done at the end | Yes, at the end |

So the work order doesn't change. When we reach Phase 5, the backend must at least have **defined** the API for that screen; it doesn't need to be coded yet.

---

## 3. Build order (overview)

| Phase | Steps | What | Why this order |
|---|---|---|---|
| 0 | ADM-01 – 06 | Clean base | Fix the base before adding anything |
| 1 | ADM-07 – 10 | Connect to the backend | Every real screen needs the API layer |
| 2 | ADM-11 – 19 | Login and security | The admin API refuses calls without login + 2FA |
| 3 | ADM-20 – 29 | Programs | Only area with an API defined; in the manager's demo on Fri 6 Nov |
| 4 | ADM-30 – 33 | Rule sets | API defined; programs need published rule sets |
| 5 | ADM-34 – 38 | Core admin | Admin users, audit log, settings, instruments |
| 6 | ADM-39 – 43 | Orders and payments | Backend week 2 (9–13 Nov) |
| 7 | ADM-44 – 53 | Trading operations | Backend week 3 (16–20 Nov, Demo 3) |
| 8 | ADM-54 – 58 | Money out | Backend week 4 (23–27 Nov) |
| 9 | ADM-59 – 61 | Dashboard and reports | Needs data from all the areas above |
| 10 | ADM-62 – 66 | Finish | Security, clean-up, final checks |

---

## 4. Steps

### Phase 0: Clean base

#### ADM-01 · Add the admin app to the main checks ☐
- **Build:** make the root `typecheck`, `test` and `build` scripts check `apps/admin` too. Today they only check `apps/web`.
- **Backend:** Frontend only
- **Done when:** `bun run typecheck`, `bun run test` and `bun run build` cover both apps and pass.

#### ADM-02 · Remove dead code ☐
- **Build:** delete code nothing uses:
  - `components/status.tsx`
  - `usePreview` and the unused `PreviewProvider` config and state
  - `mocks/screenshot-pages.ts`
  - unused mock fields
- **Decide in this step:** keep or remove the old `applyPreviewCommand` reducer. Only its tests use it.
- **Backend:** Frontend only
- **Done when:** the app looks and works exactly the same, and all checks pass.

#### ADM-03 · Fix UI bugs ☐
- **Build:**
  - The sidebar highlights the right item on detail pages (e.g. `/traders/TRD-1042`) and on alias pages (`/users`, `/audit`, `/kyc-queue`).
  - The dashboard KYC card links to `/kyc`, not the alias.
  - Admin users: remove the date filter that does nothing.
  - Admin users: don't offer "Disable" for admins who are already disabled.
  - Toasts close by themselves after a few seconds.
- **Not in this step:** mistakes inside the fake data. The fake data will be replaced by real data later.
- **Backend:** Frontend only
- **Done when:** each bug is fixed and covered by a test where possible.

#### ADM-04 · Update the old notes ☐
- **Build:** fix `docs/admin-preview.md` and `apps/admin/VISUAL_AUDIT.md`:
  - pnpm → bun
  - the test count
  - remove features that no longer exist
- **Backend:** Frontend only
- **Done when:** the notes match the code.

#### ADM-05 · Use the real permission list ☐
- **Build:**
  - Replace the 16 old permissions with the backend's **18 permissions and 4 roles**, exactly as in `Funded_Hub_backend/supabase/seed.sql` and `src/contracts/permissions.ts`. The full matrix is below.
  - The Roles page shows this matrix.
  - Put it in one shared file, because steps ADM-18 and later will use it to hide buttons.
- **Backend:** Frontend only (copies the backend list)
- **Done when:** the Roles page shows the 18 permissions with the right roles, and a test checks the list against the backend's.

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

#### ADM-06 · Real loading, error and not-found pages ☐
- **Build:**
  - `loading.tsx`, `error.tsx` and `not-found.tsx` for the admin pages
  - one shared "what went wrong" message component, ready for real API errors
- **Backend:** Frontend only
- **Done when:** a crashing page shows the error page, not a blank screen, and you can retry from it.

### Phase 1: Connect to the backend

#### ADM-07 · App settings (environment) ☐
- **Build:** `apps/admin/.env.example` with:
  - the API address
  - `NEXT_PUBLIC_SUPABASE_URL`
  - the Supabase **publishable** key (never the secret key)
  - a startup check that stops with a clear message if a value is missing
- **Backend:** Frontend only
- **Done when:** the app starts with the settings and stops with a clear message without them.

#### ADM-08 · API types from the backend contract ☐
- **Build:** a script that generates TypeScript types from the backend's `openapi.json`. The generated file is committed, so everyone uses the same contract version.
- **Backend:** API defined (contract v1)
- **Done when:** the types for all 22 admin operations exist and the type check passes.

#### ADM-09 · One API helper ☐
- **Build:** one function for every API call. It:
  - adds the login token (`Authorization: Bearer …`)
  - reads success responses `{data, meta}` and errors `{error: {code, message, fields}}`
  - turns error codes into clear messages:
    - `401`: refresh the session
    - `403 FORBIDDEN`: "you don't have permission"
    - `403 MFA_REQUIRED`: ask for the 2FA code, then retry
    - `409`: show the reason
    - `400 VALIDATION_FAILED`: show the message next to each form field
    - `429`: "too many tries"
  - keeps money as text, never decimal maths
  - shows times in UTC
  - has a **sample mode**, switched by one setting:
    - **sample:** calls are answered by sample data shaped exactly like the contract
    - **live:** calls go to the real API
    - the screens never know which mode is on
- **Backend:** API defined
- **Done when:** unit tests cover every error code, the money and time handling, and both modes.

#### ADM-10 · Tables with real paging and filters ☐
- **Build:**
  - The tables load page by page with the API's cursor ("Load more" or "Next").
  - Search and filters are sent to the server.
  - Note: the API gives no total count (see D5).
- **Backend:** API defined (the paging format is in the contract)
- **Done when:** a test list with more than one page works with filters.

### Phase 2: Login and security

Phase 2 needs local Supabase running from the backend repo (Docker + `npx supabase start`), with **TOTP 2FA switched on** in `supabase/config.toml`. That is a backend change.

#### ADM-11 · Supabase connection ☐
- **Build:** a Supabase client for the browser and one for the server, using only the publishable key.
- **Backend:** Supabase
- **Done when:** the app connects to local Supabase.

#### ADM-12 · Real login (email + password) ☐
- **Build:** replace the login preview with a real Supabase sign-in. It shows one generic error message for every failure and a lockout message.
- **Backend:** Supabase
- **Done when:** a real admin can sign in, and a wrong password shows the generic error.

#### ADM-13 · 2FA setup on first login ☐
- **Build:** a real QR code and manual key from Supabase. The admin enters a 6-digit code to confirm.
- **Backend:** Supabase (TOTP must be on)
- **Done when:** a new admin sets up 2FA with an authenticator app.

#### ADM-14 · 2FA code on later logins ☐
- **Build:** ask for the 6-digit code after the password, reaching the 2FA login level the API needs (`aal2`). Also, when the API answers `MFA_REQUIRED`, ask for the code and retry the call.
- **Backend:** Supabase
- **Done when:** sign-in without the code is impossible, and the API accepts the token.

#### ADM-15 · Sign out and session ☐
- **Build:**
  - a real user menu with the real name and sign out
  - the token refreshes automatically
  - a 12-hour admin session limit
  - a real "session expires in" timer
- **Backend:** Supabase
- **Done when:** sign out works and the session ends after 12 hours.

#### ADM-16 · Page protection ☐
- **Build:**
  - `proxy.ts` sends signed-out users to `/login`
  - the admin layout does a real server-side check
  - remove the sample login preview
- **Backend:** Supabase
- **Done when:** opening any admin page while signed out goes to `/login`.

#### ADM-17 · Backup codes ⏸
- **Build:** backup codes for when the admin loses their phone. Only if D3 says yes; Supabase doesn't provide them.
- **Backend:** Decision (D3)
- **Done when:** decided and, if yes, built.

#### ADM-18 · "Who am I" and permissions in the UI ⏸
- **Build:**
  - load the signed-in admin's roles and permissions
  - hide menu items and buttons they can't use
  - show their real role in the top bar
- **Backend:** Needs API (D2)
- **Done when:** a Support admin doesn't see Finance-only buttons, and the backend still refuses if they try.

#### ADM-19 · "Confirm it's you" before risky actions ⏸
- **Build:** connect the existing confirm + code dialog to a real re-check. This is used for payouts, risk actions and role changes.
- **Backend:** Needs API (D2: the `POST /admin/auth/reauth` endpoint)
- **Done when:** a wrong code stops the action.

### Phase 3: Programs (API defined)

The manager's plan shows the admin program builder in the **demo on Fri 6 Nov**. All steps need `programs.manage`.

Program rules from the contract:
- Program types are `INSTANT` (1 funded phase), `ONE_STEP` (1 challenge phase + funded) and `TWO_STEP` (2 challenge phases + funded).
- Status changes allowed: Draft → Active, Active → Archived, Archived → Active, Draft → Archived. Never back to Draft. There is no delete.
- A program can become Active only when it has:
  - phases that match its type
  - a published rule set on every phase
  - at least one active account size
  - a payout policy

#### ADM-20 · Programs list ☐
- **Build:** real list with status and type filters (`listAdminPrograms`).
- **Done when:** programs from the API show and the filters work.

#### ADM-21 · Program details page ☐
- **Build:** one read-only page showing everything about a program (`getAdminProgram`).
- **Done when:** every program field from the API is shown.

#### ADM-22 · Create and edit a program ☐
- **Build:**
  - create a program (`createAdminProgram`) and edit it (`updateAdminProgram`)
  - fields: name, slug, type, free trial, fee refund on first payout
  - the type can change only while Draft
- **Done when:** a program can be created and edited, and errors show next to the fields.

#### ADM-23 · Program status changes ☐
- **Build:**
  - buttons for the allowed status changes only
  - when the API refuses (409), show its reason
  - an archived program allows only a status change
- **Done when:** every allowed change works, and a blocked change shows the reason.

#### ADM-24 · Phases ☐
- **Build:**
  - add or edit a phase: Challenge or Funded, rule set, maximum days
  - remove a phase, only while Draft
  - (`createAdminProgramPhase`, `updateAdminProgramPhase`, `deleteAdminProgramPhase`)
- **Done when:** the phases can be built for all 3 program types.

#### ADM-25 · Account sizes and prices ☐
- **Build:** add a size and edit its price; switch a size off, never delete it (`createAdminAccountSize`, `updateAdminAccountSize`).
- **Done when:** sizes and prices are saved and inactive sizes are shown as inactive.

#### ADM-26 · Add-ons ☐
- **Build:**
  - code (can't change after creation), name, price (fixed or percent), what it changes
  - (`createAdminAddon`, `updateAdminAddon`)
  - Note: the list of possible add-on effects isn't decided yet.
- **Done when:** add-ons can be created and edited.

#### ADM-27 · Payout policy ☐
- **Build:**
  - fields: split %, minimum payout, on demand or by cycle (with cycle days), maximum per payout, maximum per cycle, maximum per trader, wallet hold hours
  - editable only while Draft
  - (`replaceAdminPayoutPolicy`, `deleteAdminPayoutPolicy`)
- **Done when:** the policy is saved, and editing is blocked outside Draft.

#### ADM-28 · Scaling milestones ☐
- **Build:**
  - trigger: number of payouts, months funded or profit % → new split % and/or size increase %
  - editable only while Draft
  - (`createAdminScalingMilestone`, `updateAdminScalingMilestone`, `deleteAdminScalingMilestone`)
- **Done when:** milestones can be added, edited and removed.

#### ADM-29 · Allowed pairs per program ☐
- **Build:** choose the trading pairs for a program, with a leverage limit up to the pair's cap (`replaceAdminProgramInstruments`).
- **Done when:** the pairs and limits are saved.

### Phase 4: Rule sets (API defined)

#### ADM-30 · Rule set versions list ☐
- **Build:** all versions for one program, newest first (`listAdminRuleSets`).
- **Permission:** `programs.manage`
- **Done when:** the versions show with their status (Draft, Published, Retired).

#### ADM-31 · Create and edit a draft ☐
- **Build:**
  - a new draft gets the next version number (`createAdminRuleSet`); edit it with `updateAdminRuleSet`
  - all contract fields: profit target %, daily loss %, maximum loss %, drawdown static or trailing, minimum trading days, inactivity days, consistency %, stop-loss required within X seconds, maximum risk per trade %, maximum exposure %, minimum hold seconds, news, weekend and bots allowed, notes
- **Permission:** `programs.manage`
- **Done when:** a draft can be created and saved, and a published version can't be edited.

#### ADM-32 · Publish a rule set ☐
- **Build:** a confirm dialog, then publish (`publishAdminRuleSet`). If it's already published (409 `RULE_SET_PUBLISHED`), show a clear message.
- **Permission:** `rules.publish` (Admin only)
- **Done when:** publishing freezes the version and shows who published it and when.

#### ADM-33 · Compare two versions ☐
- **Build:** a side-by-side comparison of two versions, done in the browser (the API has no comparison endpoint).
- **Done when:** the changed rules are clearly marked.

### Phase 5: Core admin (needs API: get the contract from the backend first)

#### ADM-34 · Admin users ☐
- **Build:**
  - list; create an admin with **several roles**; disable; **re-enable**; reset 2FA; change roles
  - every action uses "Confirm it's you" (ADM-19)
- **Permission:** `admins.manage`
- **Backend:** Needs API
- **Done when:** all actions work against the API and appear in the audit log.

#### ADM-35 · Audit log ☐
- **Build:**
  - real entries with paging
  - filters: who, action, item, date, IP
  - detail view shows before and after values
  - read only
- **Permission:** `audit.read`
- **Backend:** Needs API
- **Done when:** entries from real admin actions show and the filters work.

#### ADM-36 · Settings: restricted countries and basic settings ☐
- **Build:**
  - restricted-countries editor, starting from Bybit's 11 codes: US, CN, HK, SG, CA, KP, CU, IR, UZ, SD, SY
  - daily reset time, snapshot interval, payout wallet hold hours, minimum age
- **Permission:** `settings.manage`
- **Backend:** Needs API
- **Done when:** changes are saved and audited.

#### ADM-37 · Settings: KYC gates ⏸
- **Build:** choose when KYC is required, in any combination: at sign-up, before the funded account, before the first payout. The default is before the first payout. This is a client requirement.
- **Backend:** Decision (D4); no setting exists yet
- **Done when:** decided and built.

#### ADM-38 · Instruments ☐
- **Build:**
  - all pairs, including disabled ones
  - switch on/off; leverage cap; maximum position
  - a "Sync from Bybit" button; last sync time
  - The launch pairs in the plan are BTC, ETH, BNB and SOL (USDT). The sample data has XRP and DOGE instead of BNB.
- **Permission:** `instruments.manage`
- **Backend:** Needs API
- **Done when:** changes save and the sync shows its result.

### Phase 6: Orders and payments (backend week 2)

#### ADM-39 · Discount codes ☐
- **Build:**
  - create a code; deactivate a code
  - full edit: percent or fixed, value, maximum uses, per-user limit, valid from/to, programs, linked affiliate
- **Permission:** `discounts.manage`
- **Backend:** Needs API
- **Done when:** codes can be created, edited and switched off.

#### ADM-40 · Orders and payments ☐
- **Build:**
  - orders list and detail; payments list
  - real statuses; payment method (gateway or direct transfer)
  - deposit address, transaction hash, confirmations
- **Permission:** `orders.read`
- **Backend:** Needs API
- **Done when:** real orders show with their payments.

#### ADM-41 · Payment events and reconciliation ☐
- **Build:** the log of payment-provider messages (webhooks) and a report that checks payments against orders.
- **Permission:** `orders.read`
- **Backend:** Needs API
- **Done when:** the log and the report show real data.

#### ADM-42 · Refunds ☐
- **Build:**
  - refund **from an order**: amount, coin, network, wallet, transaction hash, reason
  - uses "Confirm it's you"
  - this replaces the current refund-queue design
- **Permission:** `refunds.create`
- **Backend:** Needs API
- **Done when:** a refund is recorded and shows on the order.

#### ADM-43 · Invoices and ledger ☐
- **Build:** download PDF invoices and receipts, and a ledger view.
- **Permission:** `orders.read`
- **Backend:** Needs API
- **Done when:** an invoice downloads and the ledger shows entries.

### Phase 7: Trading operations (backend week 3)

#### ADM-44 · Traders list and Trader 360 (real data) ☐
- **Build:** real traders list with search and filters, and the Trader 360 page with its tabs: accounts, orders, KYC, payouts, devices and IPs, flags.
- **Permission:** `traders.read`
- **Backend:** Needs API
- **Done when:** real traders show with all tabs.

#### ADM-45 · Trader actions ☐
- **Build:** edit, lock, suspend and close a trader, each with a reason.
- **Permission:** `traders.update`
- **Backend:** Needs API
- **Done when:** the actions work and are audited.

#### ADM-46 · Trader 360 extras ☐
- **Build:**
  - login history
  - country-mismatch flag
  - accepted agreements
  - who referred them
  - account details: positions, trades, daily stats
- **Permission:** `traders.read`
- **Backend:** Needs API
- **Done when:** each extra shows real data.

#### ADM-47 · KYC queue and review ☐
- **Build:**
  - queue; secure document viewer
  - reviewer checklist
  - Tier 1 / Tier 2
  - duplicate-ID warning only when it's true
  - approve, reject with a reason, or ask to resubmit
- **Permission:** `kyc.review`
- **Backend:** Needs API
- **Done when:** a real application can be reviewed end to end.

#### ADM-48 · Pass reviews ☐
- **Build:** real metrics, automatic vs manual pass, approve or reject with a note.
- **Permission:** `risk.review`
- **Backend:** Needs API
- **Done when:** a real pass review can be decided.

#### ADM-49 · Live updates (WebSocket) ☐
- **Build:** one connection for live admin data: violations, connections, payout queue.
- **Backend:** Needs API (WebSocket `/ws`)
- **Done when:** a new violation appears without reloading the page.

#### ADM-50 · Risk monitor (live) ☐
- **Build:** live usage bars per account (daily loss, maximum loss, profit target).
- **Backend:** Needs API
- **Done when:** the bars move with real account data.

#### ADM-51 · Violations and account actions ☐
- **Build:**
  - violations list and detail: hard or soft, measured vs limit, resolved time
  - account actions: warn, fail, suspend, unsuspend, profit adjust, **close positions**
  - each action needs a reason and "Confirm it's you"
- **Permission:** `risk.action`
- **Backend:** Needs API
- **Done when:** an action works and the trader's account changes.

#### ADM-52 · Connection health ☐
- **Build:**
  - per account: stream status (connected, reconnecting, down), delay, last event, last check
  - connection details: masked key (never the secret), key-expiry warnings
- **Backend:** Needs API
- **Done when:** real connection data shows. Today it wrongly shows risk data.

#### ADM-53 · Abuse review ☐
- **Build:**
  - real flag types
  - outcomes from the spec: warn, remove profit, lower split, close, dismiss
  - lower priority: the plan marks this "Should", not "Must"
- **Permission:** `risk.review`
- **Backend:** Needs API
- **Done when:** a real flag can be resolved.

### Phase 8: Money out (backend week 4)

#### ADM-54 · Payout approvals ☐
- **Build:**
  - queue of profit and affiliate payout requests
  - eligibility checks and split
  - approve, or reject with a reason
  - uses "Confirm it's you"
  - every payout is approved by a person; nothing is paid automatically
- **Permission:** `payouts.approve`
- **Backend:** Needs API
- **Done when:** a real request can be approved or rejected.

#### ADM-55 · Sending payouts and history ☐
- **Build:**
  - send approved payouts
  - payout transactions (provider, network fee, transaction hash)
  - full history
  - payout wallets
- **Permission:** `payouts.send`
- **Backend:** Needs API
- **Done when:** a sent payout shows its transaction.

#### ADM-56 · Affiliates ☐
- **Build:**
  - affiliates list and edit: status, plan, upline, balances
  - commission plans; commissions list
  - 1 level only for now
- **Permission:** `affiliates.manage`
- **Backend:** Needs API
- **Done when:** affiliates and commissions show real data.

#### ADM-57 · Notification templates (new screen) ☐
- **Build:** edit the email and in-app message text for each event (sign-up, KYC, payment, pass/fail, payout, …).
- **Permission:** `notifications.manage`
- **Backend:** Needs API
- **Done when:** a template can be edited and saved.

#### ADM-58 · Liability ☐
- **Build:** real totals for pending and expected payouts against revenue, with alerts.
- **Backend:** Needs API
- **Done when:** the real numbers show.

### Phase 9: Dashboard and reports

#### ADM-59 · Dashboard (real numbers) ☐
- **Build:** real KPIs: sales, active accounts, pass rate, payouts, liability, funded traders, payout ratio, affiliate cost.
- **Backend:** Needs API
- **Done when:** the numbers match the data.

#### ADM-60 · Reports and exports ☐
- **Build:** start an export job (CSV or XLSX), see its status, and download the file.
- **Backend:** Needs API
- **Done when:** a real file downloads.

#### ADM-61 · Legal document versions ⏸
- **Build:** publish new versions of the Terms, Privacy, Risk Disclosure and Trader Agreement.
- **Backend:** Decision (D6)
- **Done when:** decided and built.

### Phase 10: Finish

#### ADM-62 · Security headers ☐
- **Build:** security headers and a Content Security Policy for the admin app.
- **Done when:** the headers are present on every page.

#### ADM-63 · Test IDs check ☐
- **Build:** a final check that every button and form field has a `data-testid`.
- **Done when:** nothing is missing.

#### ADM-64 · Remove everything fake ☐
- **Build:** delete:
  - the mock data
  - the "Sample data" tag
  - the `?state=` preview switch
  - any leftover preview code
- **Done when:** no fake data remains anywhere in the app.

#### ADM-65 · Phone and accessibility pass ☐
- **Build:** check every screen on phone and desktop, keyboard use, labels and contrast.
- **Done when:** every screen works on both and with the keyboard.

#### ADM-66 · Final check ☐
- **Build:** full test run, production build and a security review.
- **Done when:** everything passes and is ready to deploy.

### Later (after launch, not planned now)

Competitions, certificates and news blackout windows. The manager's plan moved these after launch.

---

## 5. Open questions (ask the manager)

| ID | Question | Blocks |
|---|---|---|
| D1 | **Permissions conflict.** The Tech Spec and the backend seed disagree. For example, the spec lets Admin + Risk publish rule sets, but the seed allows Admin only. The risk monitor, violations, connection health, KPIs, reports and liability have **no permission** in the seed. Which is right? | ADM-18, Phases 7–9 |
| D2 | **Missing endpoints.** The backend needs a "who am I" endpoint (roles and permissions) and the "confirm it's you" endpoint (`POST /admin/auth/reauth`). | ADM-18, ADM-19 |
| D3 | **Backup codes.** Do admins get backup codes? Supabase doesn't provide them. | ADM-17 |
| D4 | **Client settings.** KYC gates, consistency rule settings (on/off, where it applies) and the reset timezone are client requirements with no backend support. | ADM-37, ADM-31 |
| D5 | **Table totals.** Tables can't show total counts (the API's paging has none). Is that OK for admin tables? | ADM-10 |
| D6 | **Legal versions.** How are new versions published: an admin screen, or a database migration? | ADM-61 |

---

## 6. Sources

Where the facts in this plan come from:

| Topic | File |
|---|---|
| Current admin app | `apps/admin/src`, `docs/admin-preview.md`, `apps/admin/VISUAL_AUDIT.md` |
| UI rules | `docs/ADMIN_UI_RULES.md`, `DESIGN.md` |
| Backend API contract | `Funded_Hub_backend/openapi.json`, `src/contracts/` (`admin-programs.ts`, `admin-rule-sets.ts`, `permissions.ts`) |
| Permissions and roles | `Funded_Hub_backend/supabase/seed.sql` |
| Database tables | `Funded_Hub_backend/supabase/migrations/` |
| Scope and schedule | The project planning documents: the manager's v2 backend guide and decisions (31 Oct 2026) and the week 1 plan |
| Client decisions | The project's client answers log |
| Older plans (superseded where they conflict) | `SPRINT_1_DETAILED_PLAN.md`, `BUILD_SPRINT_PLAN.md`, the Tech Spec PDF |

---

## 7. Change log

| Date | Step | Note |
|---|---|---|
| 2 Nov 2026 | – | Plan created. Earlier the same day: `apps/admin` added to the workspaces (`package.json`, `bun.lock`), so the admin app installs and runs. |
| 2 Nov 2026 | – | Added "What we can build before the backend is finished" (section 2) and sample mode to ADM-09, because the backend isn't finished yet. |
