# Memory — AI Italian Tutor: audit, docs alignment, branch 1 (security hardening)

Last updated: 2026-10-12

## What was built

**Audit (read-only, no code changed):** 30 findings saved in `docs/context/audit-2026-10.md`. Issue numbers `#1`–`#30` are used everywhere.

**Docs aligned to the real repo (already merged to `main` via PR #25):** `AGENTS.md` moved to `app/` (git root); `docs/context/{project-overview,progress-tracker,audit-2026-10}.md`; real env var names, routes, field names and folder layout.

**Also merged via PR #25:** `PrivateRoute.jsx` / `PublicRoute.jsx` extracted from `App.jsx`; axios fallback port 3000; `server/.env.example` fixed (uppercase `PORT`, `FRONTEND_URL`); new `client/.env.example` (#17 done).

**Branch `fix/security-hardening` (from `main`, NOT committed yet):**
- Server: global `ThrottlerGuard` + per-route limits, `trust proxy`, ownership check on message listing, Mongo-id validation on `:id` params, DTOs with `@IsIn`/`@MaxLength` (chat, register, login, users), JWT 7d for new tokens, anchored CORS regex without `credentials`, 409 on Mongo duplicate key.
- New files: `server/src/common/constants.ts`, `common/trim.transform.ts`, `users/dto/update-api-key.dto.ts`, `users/dto/update-language.dto.ts`, specs `common/throttling.spec.ts`, `common/dto-validation.spec.ts`.
- Rewritten specs: `chat/chat.service.spec.ts`, `auth/auth.service.spec.ts`.
- Client: `maxLength={80}` on the focus-area input in `Dashboard.jsx`.
- Docs: tracker (ticked, change log, "Found during work"), overview, AGENTS.md updated.

## Decisions made

- **Free tier stays at 5 AI calls per user** (opener counts as one). Reason: owner uses the free Gemini tier and must not incur cost. Do not raise without approval.
- Existing 30-day JWTs keep working until expiry; only newly issued tokens get 7 days.
- Env var names are NOT renamed (`DB_URL`, `GOOGLE_API_KEY`, `ENCRYPTION_KEY`): they are set in Railway/Vercel. Docs follow the code, not the other way round.
- Rate limits are per IP (global throttler runs before the JWT guard). Limits: signup 5/min, login 10/min, start-session 5/min, send-message 15/min, default 60/min.
- Login password cap is 128 (looser than signup's 72, bcrypt limit) so older accounts can still log in.
- Docs are tracked in git now (`.gitignore` only ignores `docs/syllabi.txt`).
- Dashboard.jsx split is deferred to Phase 2 (can't verify UI behaviour without running the app).
- Workflow rule: one branch at a time; only fix issues assigned to the current branch; log anything else under "Found during work" in the tracker.

## Problems solved

- `ParseMongoIdPipe` does not exist in Nest 11.1.9 → used a `SessionIdParamDto` with `@IsMongoId()` instead.
- Without `trust proxy`, all Railway traffic would share one IP and one rate-limit bucket → `app.set('trust proxy', 1)` in `main.ts`.
- Server `npm run lint` is broken (ESM config error) and uses `--fix`; run `npx eslint` directly once #25 is fixed; for now only `tsc --noEmit` is a reliable static check.
- Shell heredocs with nested quotes failed on Windows Git Bash; use script files (Write tool) instead.

## Current state

- `tsc --noEmit` passes. 29 new tests pass. Full server suite: 5 of 9 suites pass; 4 old scaffold specs still fail (`users.service`, `auth.controller`, `chat.controller`, `ai.service`), planned for branch 7 (#24).
- Not verified: live behaviour on Railway/Vercel, the trust-proxy hop count, any end-to-end run against Mongo/Gemini, server ESLint.
- Branch `fix/security-hardening` has uncommitted changes (about 20 server/client files plus docs).

## Next session starts with

1. Review and commit `fix/security-hardening` (commit message must end with the Claude co-author line), open the PR, merge.
2. Then start branch 2, `fix/ai-reliability`: #6 Gemini errors → 502/503 (not saved or counted, add timeout + one retry), #14 latest 20 messages, #5 count only successful calls and move the free limit (5) into one shared constant, #7 validate the user's API key on save, #13 prompt fixes (numbering, level vs focus_area, Italian-only scope, injection handling).

## Open questions

- How to share constants (levels, modes, languages, free limit) between the separate `client` and `server` packages? Needs a decision in branch 2.
- Is `trust proxy: 1` correct for Railway's setup? Verify after deploy that two clients are not throttled together.
- Is email verification (branch 5) in scope for the demo, or skip it and don't mention email in the LinkedIn post?
- Whether `AGENTS.md` should be re-read at session start: the harness once reported it "no longer present" after the move; it now lives at `app/AGENTS.md`.
