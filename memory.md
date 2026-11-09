# Memory — AI Italian Tutor: docs/readme

Last updated: 2026-11-09

## What was built

- `chore/tests-lint` is merged to main (owner confirmed). Branch 7 is done.
- Branch `docs/readme` (from up-to-date `main`), closes #27:
  - `README.md` rewritten: features, stack table, mermaid architecture and message flow, backend and frontend setup, env var tables, scripts, API table with rate limits, Vercel and Railway deployment notes, limitations, roadmap, screenshot, MIT license section.
  - `LICENSE` (MIT, 2026, Maye Jesuorobo) added; `server/package.json` license set to `MIT`.
  - `docs/screenshots/ai-italian-tutor.vercel.app.png` (added by the owner) is linked from the README.
  - `server/src/common/constants.ts`: owner changed `AI_MODEL` to `gemini-3.5-flash-lite`. It is committed in this branch as its own commit (owner's instruction).
  - Docs updated to `gemini-3.5-flash-lite`: `AGENTS.md`, `project-overview.md`, tracker. The audit report is left as is (historical). The deleted `GET /` stub row is removed from the overview.

## Decisions made

- Model is `gemini-3.5-flash-lite`. The code is the source of truth (`AI_MODEL`).
- License is MIT.
- The refresh-loses-chat bug stays in `chore/cleanup`. Email verification is revisited after the demo (still skipped for it; the post must not mention email).
- PR descriptions mention only `client/` and `server/` files: here that is `server/package.json` and `server/src/common/constants.ts`. Never mention docs, README, LICENSE, `AGENTS.md`, `memory.md` or the tracker. Use `.github/pull_request_template.md`.
- Still in place: free tier stays at 5, env var names are not renamed, `shared/constants.json` is the shared source, Railway root directory = repo root with config file `/railway.json`.

## Problems solved

- README claimed Gemini 1.5 Flash, and later the docs said 2.5. The code had already moved to 3.5, so check `server/src/common/constants.ts` before writing a model name anywhere.
- Python doc edits on Windows need `encoding='utf-8'`.

## Current state

- Docs and README are done. The tracker marks branch 8 ✅ (ready for PR).
- The README setup steps were not run end to end. `cp .env.example .env` works in Git Bash but not plain PowerShell. The Vercel setting "Include source files outside of the Root Directory" is mentioned in the README but not verified against the real project.
- Not verified: `trust proxy: 1` live (owner will test: 11 wrong `POST /auth/login` in a minute from one network should give 429 on the 11th, a second network should not be blocked). Leave unticked until the owner reports. Branch 4 stays 🟡 until then.
- Not yet checked: `/og-image.png` on Vercel and the LinkedIn Post Inspector preview.
- Known and unfixed: refreshing a chat returns to the new-chat screen. Edge, Safari and non-English UI languages are untested for voice.

## Next session starts with

1. Check the `docs/readme` PR's CI is green and merge it; mark branch 8 merged in the tracker.
2. Get the `trust proxy` result from the owner, tick it and close branch 4.
3. Check the `/og-image.png` and LinkedIn preview.
4. Work through the pre-recording checklist (wake Railway, test production with a throwaway account, console clean at 375 px, budget alert on the Gemini project), then record in Chrome or Edge.
5. Phase 2 afterwards, starting with `chore/cleanup` if the refresh bug matters.

## Open questions

- `trust proxy` result is pending from the owner.
- Whether to add a Phase 2 branch for a screenshot GIF or more screenshots.
