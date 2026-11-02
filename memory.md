# Memory — AI Italian Tutor: Railway root-dir fix (fix/railway-root-dir)

Last updated: 2026-11-02

## What was built

Branch 4 `chore/deploy-config` is merged (PR #29): `client/vercel.json` SPA rewrite, real title/description/OG tags and `favicon.svg` in `client/index.html`, and `GET /health` (not throttled) in `server/src/app.controller.ts`.

Railway deploys #27, #28 and #29 had all failed because the service built from `/server` and could not see `shared/` (added in #27). Fix on branch `fix/railway-root-dir` (already pushed by the owner, PR not yet opened):
- `server/railway.json` moved to the repo root `railway.json`; start command is `cd server && npm run start:prod`; health check path `/health`.
- Root `package.json` got `engines.node >=22.0.0` (its build/start scripts already go into `server/`).
- Docs (AGENTS.md layout and Railway row, overview, tracker) updated; these doc edits are uncommitted.

Separate branch `chore/pr-template` (pushed, no PR yet): removed the Docs sections from `.github/pull_request_template.md`.

## Decisions made

- Railway must build from the repo root: Root Directory = repo root, Config file path = `/railway.json`. Owner made these dashboard changes and confirmed the deploy works.
- PR descriptions mention ONLY `client/` and `server/` files and changes: no docs, AGENTS.md, memory.md, tracker or change-log mentions. Root config changes may only be described in prose as deploy behaviour. Always create a branch before making changes.
- Earlier decisions still hold: free tier stays at 5, env var names are not renamed, `shared/constants.json` is the shared source, `AuthContext.loading` stays a constant `false`.

## Problems solved

- Railway "Failed" deploys with every stage "Not started": the build root was `/server`, so `../shared` was missing. Fixed by building from the repo root.
- Python doc edits on Windows must use `encoding='utf-8'` (default cp1252 crashed and emptied a file once).
- Locally, the server cannot be booted for a `/health` check without MongoDB; it waits on the DB at startup.

## Current state

- Railway deploys and passes the health check again.
- Not yet verified live: refresh on `/dashboard` on Vercel (no 404), and `trust proxy: 1` from two different networks (steps in the tracker's "Found during work").
- Still open from before: 3 old scaffold server specs fail (branch 7, #24); server ESLint config broken (#25); no friendly 502/503 send-error state on the client (#21, branch 6).

## Next session starts with

1. Commit the doc updates on `fix/railway-root-dir`, push, and open the PR (list only `client/` and `server/` files; describe the root config move only as deploy behaviour). Open a PR for `chore/pr-template` too if wanted.
2. Verify live: `/dashboard` refresh on Vercel and `trust proxy` from two networks; tick them in the tracker and mark branch 4 ✅.
3. Then decide on email verification (owner leans out): if skipped, start branch 6 `fix/voice-ux` (#19, #20, #21); if kept, branch 5 `feature/email-verification` (#3).

## Open questions

- Email verification in or out of the demo (owner leaning out; not confirmed).
- `og:image` for link previews: needs the final Vercel domain and an image.
