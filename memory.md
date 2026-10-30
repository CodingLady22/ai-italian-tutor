# Memory — AI Italian Tutor: og:image (chore/og-image)

Last updated: 2026-11-02

## What was built

`fix/railway-root-dir` and `chore/pr-template` are both merged (PRs #31, #32), so Railway builds from the repo root and deploys again.

Branch `chore/og-image` (pushed, PR opened): `client/index.html` now has `og:image`, `og:image:width` (1200), `og:image:height` (568), `og:url`, `twitter:image`, and `twitter:card` is `summary_large_image`. The image is `client/public/og-image.png` (1200x568), added by the owner. Final domain: `https://ai-italian-tutor.vercel.app`. The commit was backdated to 2026-10-30 at the owner's request.

## Decisions made

- Email verification is SKIPPED for the demo (owner confirmed). Branch 5 `feature/email-verification` is deferred until the demo is ready; the post must not mention email.
- PR descriptions mention ONLY `client/` and `server/` files and changes: no docs, AGENTS.md, memory.md, tracker or change-log mentions. Always create a branch before making changes. Use `.github/pull_request_template.md`.
- Earlier decisions still hold: free tier stays at 5, env var names are not renamed, `shared/constants.json` is the shared source, Railway root directory = repo root with config file `/railway.json`.

## Problems solved

- `/dashboard` and `/login` return 200 on Vercel, so the SPA rewrite works.
- Python doc edits on Windows must use `encoding='utf-8'` (default cp1252 once emptied a file).
- Locally, the server cannot be booted for a `/health` check without MongoDB.

## Current state

- Verified live: `/dashboard` refresh (no 404).
- NOT yet verified: `trust proxy: 1`. Owner will test later, so leave it unticked in the tracker. Test: 11 wrong `POST /auth/login` calls in a minute from home wifi should give 429 on the 11th, then one call from phone data should not be blocked.
- After `chore/og-image` is merged and Vercel redeploys, `/og-image.png` should return `image/png` (it returned HTML before deploy). Then check the preview in LinkedIn Post Inspector.
- Still open: 3 old scaffold server specs fail (#24); server ESLint config broken (#25); no friendly 502/503 send-error state on the client (#21).

## Next session starts with

1. Confirm `chore/og-image` was merged and `/og-image.png` serves an image; check the LinkedIn preview.
2. Start branch 6 `fix/voice-ux` (#19, #20, #21) from an up-to-date `main`.
3. When the owner reports the `trust proxy` result, tick it in the tracker and mark branch 4 done.

## Open questions

- `trust proxy` result is pending from the owner.
- Whether to revisit email verification after the demo is ready.
