# Progress Tracker

**Current branch:** `fix/ai-reliability` (code done, awaiting review)
**Phase:** 1 (demo-ready)
**Last updated:** 2026-10-12

How to use: tick tasks as they're done, update the branch status, and add a change-log entry at the bottom. Issue numbers (`#1`–`#30`) refer to `audit-2026-10.md` in this folder.

Status key: ⬜ not started · 🟡 in progress · ✅ merged

---

## Phase 1: Demo-ready

### 1. `fix/security-hardening` ✅ (merged, PR #26)
- [x] #1 Register `ThrottlerModule.forRoot()` and a global `ThrottlerGuard`; stricter limit on `/auth/*`
- [x] #4 Ownership check on `GET /chat/sessions/:id/messages`
- [x] #8 Move `MaxLength`/`MinLength` from `sessionId` to `message`; `@IsIn` for level/mode/languages; cap `focus_area` at ~80 characters; add DTOs for users endpoints
- [x] #9 Shorten JWT expiry to 7 days for newly issued tokens. Existing 30-day tokens must keep working until they expire (same secret, no revocation)
- [x] #11 Anchor the CORS regex; remove `credentials: true`
- [x] #12 `@IsIn`/`@MaxLength` on register fields; return 409 on Mongo error 11000
- [x] Tests: throttling, ownership, signup conflict

### 2. `fix/ai-reliability` 🟡 (code done, awaiting review)
- [x] Shared constants: create `shared/constants.json` (levels, modes, languages, free limit) imported by both client and server; replace the hardcoded copies (`Register.jsx`, `Dashboard.jsx`, `grammarTopics.js`, `ChatInterface.jsx`, `server/src/common/constants.ts`)
- [x] #6 Gemini errors → 502/503; don't save or count them; add timeout + one retry
- [x] #14 History = latest 20 messages (sort desc, limit, reverse)
- [x] #5 Keep the free limit at **5** (free Gemini tier, no cost to the owner); count only successful calls; the opener keeps counting as one; move the limit to one shared constant for client + server (client currently hardcodes `5` in `ChatInterface.jsx`)
- [x] #7 Validate the user's API key on save; clear message for invalid keys
- [x] #13 Fix rule numbering and level/focus_area mix-up; add Italian-only scope rule; add prompt-injection handling

### 3. `fix/auth-ux` ⬜
- [ ] #2 Don't redirect on 401 from `/auth/login`; keep the "Invalid credentials" message
- [ ] #10 try/catch around `JSON.parse(storedUser)`; provide `loading` from `AuthContext`

### 4. `chore/deploy-config` ⬜
- [ ] #16 Add `client/vercel.json` rewriting `/(.*)` to `/index.html`; test refresh on `/dashboard` live
- [x] #17 Align axios fallback to port 3000; fix `.env.example` (uppercase `PORT`, add `FRONTEND_URL`, `VITE_API_URL`). Done 2026-10-09 on `main`, before branching
- [ ] #23 Real `<title>`, favicon, meta description, OG tags
- [ ] #29 Add `GET /health`; set it as Railway's health-check path

### 5. `feature/email-verification` ⬜
- [ ] Decision pending: owner leans towards skipping email verification for the demo (and not mentioning email in the post). Confirm before starting this branch
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
| 2026-10-12 | `fix/ai-reliability` | `shared/` lives outside `client/` and `server/`. Building with the server or client folder as the deploy root (Railway/Vercel) would not see it. Railway builds from the repo root (root `package.json`), but check Vercel's "include files outside root directory" setting and Railway's start command (`node dist/server/src/main`) on the first deploy | `chore/deploy-config` |
| 2026-10-12 | `fix/ai-reliability` | Client still has English strings and its own label text for levels/languages; `grammarTopics.js` keys are still hand-written (A1–B1 only) | `chore/cleanup` (#22) |
| 2026-10-12 | `fix/ai-reliability` | The client does not yet show a friendly error/retry state when `send-message` returns 502/503 (the server now returns real errors, the optimistic user bubble remains) | `fix/voice-ux` (#21) |
| 2026-10-09 | `fix/security-hardening` | Levels, modes and languages are now defined in `server/src/common/constants.ts` but the client still hardcodes the same lists (`Register.jsx`, `Dashboard.jsx`, `grammarTopics.js`). AGENTS.md asks for one shared place; the sharing mechanism (client and server are separate packages) needs a decision | `fix/ai-reliability`. **Decision 2026-10-12:** one small `shared/constants.json` imported by both sides |
| 2026-10-09 | `fix/security-hardening` | `start-session` and `send-message` rate limits are per IP, not per user (the global throttler runs before the JWT guard). Fine for a demo; per-user limits would need a custom tracker | `chore/cleanup` |
| 2026-10-09 | `fix/security-hardening` | `app.set('trust proxy', 1)` assumes exactly one proxy hop in front of the app on Railway. Not verified live: check after deploy that two different clients are not throttled together | `chore/deploy-config`. **How to verify:** after deploy, hit an endpoint with the limit (e.g. `/auth/login`, 10/min) from two different networks (home wifi and phone data) and confirm each gets its own bucket; also log `req.ip` once and compare it with your public IP. If every client shows the same IP, raise or lower the hop count |
| 2026-10-09 | `fix/security-hardening` | 3 scaffold specs still fail (`users.service`, `auth.controller`, `chat.controller`); `ai.service.spec` was replaced on `fix/ai-reliability` | `chore/tests-lint` (#24) |

---

## Change log
Newest first.

| Date | Branch | What changed | Files touched |
|---|---|---|---|
| 2026-10-12 | `fix/ai-reliability` | #6 Gemini failures now throw 502/503 (429, timeouts → 503; user key rejected → 400), with a 20 s timeout and one retry; nothing is saved or counted on failure, and the session opener is generated before the session is created; #14 history = latest 20 messages (sort desc, limit, reverse); #5 only successful app-key calls count (opener = 1), limit stays 5 and now comes from `shared/constants.json` (`freeCallLimit`) on both sides; #7 `PUT /users/api-key` validates the key with a cheap Gemini call first (400 if invalid, 503 if the check cannot run); #13 system prompt rewritten (rule numbering, focus area vs level fix, Italian-only scope, injection handling, session values passed as quoted data); `shared/constants.json` is the single source for levels, modes, support languages and the free limit (server `constants.ts`, client `src/constants.js`). Build: server `rootDir` is now `..`, so output moved to `dist/server/src/main` (`start:prod` and `nest-cli.json` `entryFile` updated); Vite `server.fs.allow`. Tests: 25 new (`ai.service.spec`, `chat/chat-reliability.spec`, `users/users.controller.spec`); server `tsc` and client build clean | `shared/constants.json`, `server/src/ai/ai.service.ts`, `chat/chat.service.ts`, `common/constants.ts`, `users/users.controller.ts`, `users/users.module.ts`, `server/tsconfig.json`, `server/nest-cli.json`, `server/package.json`, `client/src/constants.js`, `client/vite.config.js`, `client/src/pages/Dashboard.jsx`, `Register.jsx`, `components/ChatInterface.jsx`, specs, docs |
| 2026-10-12 | `fix/ai-reliability` | Branch created from `main`. Docs updated: `fix/security-hardening` marked merged (PR #26); decided on `shared/constants.json` for shared constants; recorded how to verify `trust proxy`; email verification still undecided (leaning skip) | `docs/context/progress-tracker.md`, `docs/context/project-overview.md` |
| 2026-10-09 | `fix/security-hardening` | #1 global `ThrottlerGuard` + per-route limits (signup 5/min, login 10/min, start-session 5/min, send-message 15/min, others 60/min per IP) and `trust proxy`; #4 ownership check on message listing, and `:id` params validated as Mongo ids on list/delete; #8 DTOs with `@IsIn` / `@MaxLength` for chat, register, login and the two users endpoints (new DTO files), `maxLength=80` on the client focus-area input; #9 new tokens last 7 days (existing 30-day tokens still valid); #11 CORS regex anchored, `credentials` removed; #12 register field limits (password max 72 for bcrypt), 409 on Mongo duplicate key. New tests: 29 across `chat.service.spec`, `auth.service.spec`, `common/throttling.spec`, `common/dto-validation.spec`; `tsc` clean | `server/src/app.module.ts`, `main.ts`, `common/constants.ts`, `common/trim.transform.ts`, `auth/*` (controller, service, module, dto), `chat/*` (controller, service, dto), `users/users.controller.ts`, `users/dto/*`, `client/src/pages/Dashboard.jsx`, specs, docs |
| 2026-10-09 | `main` (no branch) | Moved `AGENTS.md` into `app/` (repo root); saved the audit as `audit-2026-10.md`; extracted `PrivateRoute` and `PublicRoute` from `App.jsx` into `client/src/components/` (behaviour unchanged, `loading` is still undefined, see #10); fixed #17 (axios fallback port 3000, `server/.env.example` uppercase `PORT` + `FRONTEND_URL`, new `client/.env.example`). `Dashboard.jsx` split NOT done, still Phase 2 | `AGENTS.md`, `docs/context/audit-2026-10.md`, `client/src/App.jsx`, `client/src/components/PrivateRoute.jsx`, `client/src/components/PublicRoute.jsx`, `client/src/api/axios.js`, `server/.env.example`, `client/.env.example`, docs |
| 2026-10-09 | — | Docs aligned with the real repo: paths, env var names (`DB_URL`, `GOOGLE_API_KEY`, `ENCRYPTION_KEY`), routes, data-model field names, folder layout. Free limit stays at 5; existing JWTs stay valid | `AGENTS.md`, `docs/context/project-overview.md`, `docs/context/progress-tracker.md` |
| 2026-10-08 | — | Audit completed; docs created (`AGENTS.md`, overview, tracker) | `AGENTS.md`, `docs/*` |
