# Memory — AI Italian Tutor: branch 3 (fix/auth-ux)

Last updated: 2026-10-12

## What was built

Branch 2 `fix/ai-reliability` is merged (PR #27). Branch 3 `fix/auth-ux` (from `main`) is coded and manually tested by the owner; it is being committed with a PR.

- #2: `client/src/api/axios.js` — the 401 interceptor only clears storage and redirects to `/login` when a token was stored and the request is not to `/auth/*`. A wrong password now keeps the "Invalid credentials" message on the login form.
- #10: `client/src/context/AuthContext.jsx` — stored user is parsed safely (corrupt or non-object `user_data` is dropped, the user keeps their token); context now provides `loading`.
- `docs/context/progress-tracker.md` updated: branch 2 marked merged, branch 3 ticked, change-log entry added.

## Decisions made

- `loading` from `AuthContext` is a constant `false`: storage is read synchronously in the `useState` initializer. An effect-based version fails the client lint rule `react-hooks/set-state-in-effect`. Switch to real state only if auth becomes async.
- Workflow rule from the owner: ALWAYS create a branch before making any changes, unless told otherwise.
- Earlier decisions still hold: free tier stays at 5, env var names are not renamed, `shared/constants.json` is the shared source, PR "Files affected" lists only `client/` and `server/` files.

## Problems solved

- Client ESLint (`react-hooks/set-state-in-effect`) rejects `setState` inside `useEffect`; use a lazy `useState` initializer for synchronous storage reads.

## Current state

- Client lint and build clean. The client has no test runner, so branch 3 was verified manually (wrong-password login, corrupted `user_data`).
- Owner confirmed Railway and Vercel deploys currently work (this resolves the earlier worry about `shared/` outside the deploy root and the new `dist/server/src/main` path).
- Still open from before: 3 old scaffold server specs fail (branch 7, #24); server ESLint config broken (#25); no friendly 502/503 send-error state on the client (#21, branch 6).

## Next session starts with

1. Confirm the `fix/auth-ux` PR is merged, then mark branch 3 ✅ in the tracker.
2. Create branch 4 `chore/deploy-config` first, then: #16 `client/vercel.json` SPA rewrite (verify refresh on `/dashboard` live), #23 real title/favicon/meta description/OG tags, #29 `GET /health` plus Railway health-check path. #17 is already done.

## Open questions

- `trust proxy: 1` on Railway: verify from two different networks (or log `req.ip`) after deploy; planned for `chore/deploy-config`.
- Email verification in or out of the demo (owner leaning out; not confirmed).
