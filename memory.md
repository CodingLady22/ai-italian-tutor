# Memory — AI Italian Tutor: branch 2 (fix/ai-reliability)

Last updated: 2026-10-12

## What was built

`fix/security-hardening` is merged (PR #26). Branch `fix/ai-reliability` (from `main`) has #5, #6, #7, #13, #14 done and is committed with the PR open (see Current state).

- `shared/constants.json` (repo root): free-call limit (5), levels, modes, support languages. Imported by `server/src/common/constants.ts` and the new `client/src/constants.js`. `Register.jsx`, `Dashboard.jsx`, `ChatInterface.jsx` use it instead of hardcoded lists and `5`.
- `server/src/ai/ai.service.ts` rewritten: errors become 502/503 (user key rejected = 400), 20 s timeout, one retry, `validateApiKey()`, new system prompt (`buildSystemPrompt`).
- `server/src/chat/chat.service.ts`: Gemini is called before anything is saved; only successful app-key calls count; history = latest 20.
- `PUT /users/api-key` validates the key first (`users.controller.ts`, `users.module.ts` imports `AiModule`).
- New/replaced specs: `ai/ai.service.spec.ts`, `chat/chat-reliability.spec.ts`, `users/users.controller.spec.ts`.
- Docs: tracker, overview, AGENTS.md updated; AGENTS.md now has a PR-files rule.

## Decisions made

- Shared constants live in `shared/constants.json`, imported by both sides (owner's decision).
- Server TypeScript `rootDir` is `..`, so build output is `server/dist/server/src/main.js`; `start:prod` and `nest-cli.json` `entryFile` were updated.
- Free tier stays at 5; opener counts as one; env var names are not renamed; existing 30-day JWTs stay valid; limits are per IP.
- PR descriptions list only files inside `client/` and `server/`; anything else (shared/, docs, AGENTS.md) is described in prose under Docs / Major changes.
- Email verification (branch 5): owner leans towards skipping it and not mentioning email in the post. Not confirmed.

## Problems solved

- Git Bash heredocs with nested quotes fail: use the Write tool for files with quotes/backticks.
- `jest.resetAllMocks()` wipes a `jest.fn()` constructor mock: mock `GoogleGenAI` as a plain class.
- Importing JSON from outside `server/` requires `resolveJsonModule` and `rootDir: ".."` (and the dist path change above).
- Vite needs `server.fs.allow: ['..']` to import `../shared/constants.json`.

## Current state

- Server `tsc` clean, client build clean. Server tests: 55 pass, 3 old scaffold specs fail (`users.service`, `auth.controller`, `chat.controller`; branch 7, #24).
- Not verified: live Gemini calls, Mongo end to end, Railway start command with the new dist path, Vercel building with `shared/` outside the client folder, server ESLint (broken, #25).
- The client has no friendly error state yet for 502/503 on send (#21, branch 6).

## Next session starts with

1. Check the PR for `fix/ai-reliability` is merged, then update the tracker (mark branch 2 ✅ merged).
2. Start branch 3 `fix/auth-ux`: #2 no redirect on 401 from `/auth/login` (keep "Invalid credentials"), #10 try/catch around `JSON.parse(storedUser)` and provide `loading` from `AuthContext`.

## Open questions

- `trust proxy: 1` on Railway: verify by calling a limited endpoint (e.g. `/auth/login`) from two different networks after deploy, or log `req.ip` and compare with your public IP.
- Does Railway/Vercel deploy still work with `shared/` and the new `dist/server/src/main` path? Check on first deploy (`chore/deploy-config`).
- Email verification in or out of the demo (leaning out).
