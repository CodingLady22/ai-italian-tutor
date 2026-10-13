# Memory — AI Italian Tutor: branch 4 (chore/deploy-config)

Last updated: 2026-10-13

## What was built

Branch 3 `fix/auth-ux` is merged (PR #28). Branch 4 `chore/deploy-config` (from `main`) is coded; being committed with a PR (PR number not yet known).

- #16: `client/vercel.json` SPA rewrite (`/(.*)` to `/index.html`).
- #23: `client/index.html` has a real title, meta description, Open Graph and Twitter tags; new `client/public/favicon.svg` (Italian flag colours); `client/public/vite.svg` deleted. No `og:image` yet (needs an absolute URL once the Vercel domain is final).
- #29: `GET /health` in `server/src/app.controller.ts` returns `{status:'ok'}` and is `@SkipThrottle()`; `server/railway.json` sets `healthcheckPath: /health` with a 60 s timeout; test added in `app.controller.spec.ts`.
- Docs updated: tracker (branch 3 ✅, branch 4 🟡, change-log entry), overview (`/health` live), AGENTS.md (vercel.json in the layout, new PR rule).
- #17 was already done earlier.

## Decisions made

- PR descriptions mention ONLY files and changes inside `client/` and `server/`, in "Files affected" and in prose. Never mention docs, `AGENTS.md`, `memory.md`, tracker or change-log updates, or root config. Recorded in AGENTS.md workflow rule 5.
- Always create a branch before making changes.
- `loading` in `AuthContext` stays a constant `false` (sync storage read; effect-based version fails the `react-hooks/set-state-in-effect` lint rule).
- Earlier decisions still hold: free tier stays at 5, env var names are not renamed, `shared/constants.json` is the shared source.

## Problems solved

- Editing docs with Python on Windows: the default encoding is cp1252 and crashed on emoji, which left `project-overview.md` empty. Always use `encoding='utf-8'`. Restored with `git checkout` and redone.

## Current state

- Server `tsc` clean, `app.controller` spec passes, client build and lint clean.
- Nothing verified live yet. Railway and Vercel build from GitHub, so the branch must be pushed first. Vercel gives a preview URL per branch; Railway only deploys its tracked branch (usually `main`).
- Still open from before: 3 old scaffold server specs fail (branch 7, #24); server ESLint config broken (#25); no friendly 502/503 send-error state on the client (#21, branch 6).

## Next session starts with

1. Confirm the `chore/deploy-config` PR is merged and deployed, then verify live: refresh on `/dashboard` (no 404), Railway health check passes, and `trust proxy: 1` from two networks (steps are in the tracker's "Found during work"). Tick those items and mark branch 4 ✅.
2. Then decide on email verification (owner leans out). If skipped, go to branch 6 `fix/voice-ux` (#19, #20, #21); if kept, branch 5 `feature/email-verification` (#3).

## Open questions

- Email verification in or out of the demo (owner leaning out; not confirmed).
- `og:image` for link previews: needs the final Vercel domain and an image.
