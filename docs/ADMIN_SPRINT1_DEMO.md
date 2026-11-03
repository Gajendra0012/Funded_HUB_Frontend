# Admin panel: Sprint 1 demo script

What the client checks for Sprint 1: **"Admin login requires 2FA; actions appear in the audit log."**
Run these 8 steps in order. Each says what to do and what everyone should see.

- Passed end to end on this computer on 3 Nov 2026 (automated run, AO-7).
- On staging: run it again once staging exists (AO-8).

## Before the demo

- **Servers running:** backend, Supabase and the admin app.
  - Locally the admin app is http://127.0.0.1:3101.
  - On staging, use the staging address.
- **You:** an admin account with the ADMIN role, and its authenticator app on your phone.
- **A second account** that signed up on the website and isn't an admin yet. It becomes the new admin in step 4. Its owner sets up 2FA during the demo, so have that phone (or a second authenticator app) ready.
- **Restricted countries:** check the current list on Settings first, so you can put it back afterwards.
- **Two browser windows:** a normal one for you, and a private one for the new admin, so the two sessions stay apart.

## The steps

| # | Do | Everyone should see |
|---|---|---|
| 1 | In the normal window, open **/admin-users** without signing in. | The login page. No admin page opens while signed out. |
| 2 | Enter your email and password, but not the code. Then open **/admin-users** again. | The login page, asking for the 6-digit code. A password alone doesn't get in. |
| 3 | Enter the 6-digit code from your phone. | You're in, on the page you asked for. The top bar shows the 12-hour session countdown. |
| 4 | **Admin users** → **Add admin**. Search for the second account, tick **Support**, type a fresh code, then click **Add admin**. Then, in the private window, sign in as that account. | Before adding, the dialog asks for a fresh 6-digit code. The new admin's first sign-in forces 2FA setup (QR code and key). After setup they're in. |
| 5 | Back in your window: ••• on the new admin → **Change roles** → also tick **Finance** → fresh code → **Save roles**. | "Roles saved…" and both badges on the row. A wrong code is refused, and nothing changes. |
| 6 | **Settings** → **Restricted countries**. Add a country (for example Antarctica), then **Review and save** → fresh code → **Save setting**. | The review shows "Will be restricted: …". After saving: "Sign-up uses it from now on." The website's sign-up now refuses that country. |
| 7 | **Audit log**. Click the role change, then the setting change. | Both are on top, with who, when, IP and browser. **Before and After** sit side by side, the changed field first. |
| 8 | Top-right menu → **Sign out**. Then open **/admin-users**. | The login page again. |

## Afterwards

- **Put the country back:** Settings → remove it → save with a fresh code.
- **The new admin:** disable them if they shouldn't stay.
  - The app can't delete an admin.
  - Disabling keeps their history in the audit log.

## Say these honestly if asked

- **The fresh code is checked in the browser only.** The backend doesn't check it yet (gap G4).
  - Supabase also accepts a code again for about 90 seconds.
- **Not available yet:**
  - "Reset 2FA" (G2)
  - email invites (G3): the person must sign up on the website first
- **Data the backend doesn't send yet:**
  - "Last login" says "Not recorded" (G12)
  - admin names in the audit log, for viewers without the Admin role (G6)
- **Settings not used yet:** 5 of the 7 say "Not used yet". Only sign-up reads the restricted countries and the minimum age (G17).
