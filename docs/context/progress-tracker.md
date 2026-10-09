# Progress Tracker

**Current branch:** —
**Phase:** 1 (demo-ready)
**Last updated:** 2026-10-09

How to use: tick tasks as they're done, update the branch status, and add a change-log entry at the bottom. Issue numbers (`#1`–`#30`) refer to `audit-2026-10.md` in this folder.

Status key: ⬜ not started · 🟡 in progress · ✅ merged

---

## Phase 1: Demo-ready

### 1. `fix/security-hardening` ⬜
- [ ] #1 Register `ThrottlerModule.forRoot()` and a global `ThrottlerGuard`; stricter limit on `/auth/*`
- [ ] #4 Ownership check on `GET /chat/sessions/:id/messages`
- [ ] #8 Move `MaxLength`/`MinLength` from `sessionId` to `message`; `@IsIn` for level/mode/languages; cap `focus_area` at ~80 characters; add DTOs for users endpoints
- [ ] #9 Shorten JWT expiry to 7 days for newly issued tokens. Existing 30-day tokens must keep working until they expire (same secret, no revocation)
- [ ] #11 Anchor the CORS regex; remove `credentials: true`
- [ ] #12 `@IsIn`/`@MaxLength` on register fields; return 409 on Mongo error 11000
- [ ] Tests: throttling, ownership, signup conflict

### 2. `fix/ai-reliability` ⬜
- [ ] #6 Gemini errors → 502/503; don't save or count them; add timeout + one retry
- [ ] #14 History = latest 20 messages (sort desc, limit, reverse)
- [ ] #5 Keep the free limit at **5** (free Gemini tier, no cost to the owner); count only successful calls; the opener keeps counting as one; move the limit to one shared constant for client + server (client currently hardcodes `5` in `ChatInterface.jsx`)
- [ ] #7 Validate the user's API key on save; clear message for invalid keys
- [ ] #13 Fix rule numbering and level/focus_area mix-up; add Italian-only scope rule; add prompt-injection handling

### 3. `fix/auth-ux` ⬜
- [ ] #2 Don't redirect on 401 from `/auth/login`; keep the "Invalid credentials" message
- [ ] #10 try/catch around `JSON.parse(storedUser)`; provide `loading` from `AuthContext`

### 4. `chore/deploy-config` ⬜
- [ ] #16 Add `client/vercel.json` rewriting `/(.*)` to `/index.html`; test refresh on `/dashboard` live
- [x] #17 Align axios fallback to port 3000; fix `.env.example` (uppercase `PORT`, add `FRONTEND_URL`, `VITE_API_URL`). Done 2026-10-09 on `main`, before branching
- [ ] #23 Real `<title>`, favicon, meta description, OG tags
- [ ] #29 Add `GET /health`; set it as Railway's health-check path

### 5. `feature/email-verification` ⬜
- [ ] Verify sending domain in Resend (reuse the setup that worked for AI Digest)
- [ ] #3 Send verification email on signup; `isVerified` defaults to `false`; set `verificationToken` with expiry
- [ ] Block AI usage (not login) until verified; add "resend email" option with rate limit
- [ ] Remove `MAIL_PASS` and any unused `RESEND_*` vars
- [ ] Fallback plan: if the domain still fails, ship without it and don't mention email in the post

### 6. `fix/voice-ux` ⬜
- [ ] #19 Inline messages for `not-allowed`, `no-speech`, `network`; try/catch on `start()`; hide/disable mic when unsupported; abort on unmount
- [ ] #20 Wait for `voiceschanged`; speak only the Italian part; `speechSynthesis.cancel()` on unmount/session switch
- [ ] #21 Error + retry state for failed sends; avoid duplicate messages; stable `key` (no `Math.random()`)

### 7. `chore/tests-lint` ⬜
- [ ] #24 Mock Mongoose models with `getModelToken`; delete empty scaffold tests; all suites pass
- [ ] #25 Fix `eslint.config.mjs`; split `lint` and `lint:fix`
- [ ] #26 Remove unused imports and dependencies, `AppController` stub, duplicate `UsersService` provider

### 8. `docs/readme` ⬜
- [ ] #27 Correct Gemini model name; client + server setup; env var table; architecture diagram; screenshots/GIF; deployment notes; license

### Pre-recording checklist
- [ ] Wake the Railway service before recording
- [ ] Full flow tested on production with a throwaway account
- [ ] Client console clean at 375 px width
- [ ] Record in Chrome or Edge
- [ ] Budget alert set on the Gemini / Google Cloud project

---

## Phase 2: After the demo
- [ ] `feature/structured-output` (#15)
- [ ] `feature/streaming`
- [ ] `feature/session-summary`
- [ ] `chore/cleanup` (#22, #26, #9 httpOnly cookie, #28)
- [ ] `chore/ci`

---

## Found during work
Issues spotted while working on another branch. Don't fix them in the current branch; add them here.

| Date | Found on branch | Issue | Planned branch |
|---|---|---|---|
| | | | |

---

## Change log
Newest first.

| Date | Branch | What changed | Files touched |
|---|---|---|---|
| 2026-10-09 | `main` (no branch) | Moved `AGENTS.md` into `app/` (repo root); saved the audit as `audit-2026-10.md`; extracted `PrivateRoute` and `PublicRoute` from `App.jsx` into `client/src/components/` (behaviour unchanged, `loading` is still undefined, see #10); fixed #17 (axios fallback port 3000, `server/.env.example` uppercase `PORT` + `FRONTEND_URL`, new `client/.env.example`). `Dashboard.jsx` split NOT done, still Phase 2 | `AGENTS.md`, `docs/context/audit-2026-10.md`, `client/src/App.jsx`, `client/src/components/PrivateRoute.jsx`, `client/src/components/PublicRoute.jsx`, `client/src/api/axios.js`, `server/.env.example`, `client/.env.example`, docs |
| 2026-10-09 | — | Docs aligned with the real repo: paths, env var names (`DB_URL`, `GOOGLE_API_KEY`, `ENCRYPTION_KEY`), routes, data-model field names, folder layout. Free limit stays at 5; existing JWTs stay valid | `AGENTS.md`, `docs/context/project-overview.md`, `docs/context/progress-tracker.md` |
| 2026-10-08 | — | Audit completed; docs created (`AGENTS.md`, overview, tracker) | `AGENTS.md`, `docs/*` |
