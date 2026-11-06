# Memory — AI Italian Tutor: fix/voice-ux (PR #35)

Last updated: 2026-11-06

## What was built

- `chore/ci` (PR #34) and `chore/og-image` (PR #33) are merged. CI is `.github/workflows/ci.yml`: build-only jobs for client and server on push to `main` and on PRs. Tests and lint were left out on purpose until `chore/tests-lint` (3 scaffold specs fail, server ESLint config broken).
- Branch `fix/voice-ux` is committed and pushed, PR #35 open (closes #19, #20, #21):
  - `client/src/components/ChatInterface.jsx`: inline voice errors, mic hidden when unsupported, recognizer aborted on unmount, voices loaded on `voiceschanged`, speech cancelled on unmount and session switch, failed send keeps its bubble as "Not sent" with Retry, stable keys.
  - `client/src/utils/speakableText.js` (new): reads only the text before the 💡 marker.
  - `client/src/i18n/translations.js`: 9 new keys in all 7 languages.
  - `server/src/ai/ai.service.ts`: prompt rule 7, corrections go in a final paragraph starting with "💡 ". `ai.service.spec.ts` updated (17 tests pass).

## Decisions made

- Corrections use the 💡 final-paragraph convention. If the model skips it, the whole reply is spoken as a fallback.
- The mic stays visible and clickable after a permission error, so the user can retry once they allow it.
- Email verification is still skipped for the demo, and the post must not mention email. Branch 5 is deferred.
- PR descriptions mention only `client/` and `server/` files: no docs, `AGENTS.md`, `memory.md` or tracker. Always branch first. Use `.github/pull_request_template.md`.
- Still in place: free tier stays at 5, env var names are not renamed, `shared/constants.json` is the shared source, Railway root directory = repo root with config file `/railway.json`.

## Problems solved

- A 400 on `send-message` locally meant the account's saved Gemini key was rejected (the server only returns 400 for the user-key path; the app key gives 502). Re-saving a valid key in Settings fixed it. Possible cause: the key was encrypted under a different `ENCRYPTION_KEY`.
- A Python or heredoc edit with many quotes failed in the Bash tool; use the Edit tool for large JSX edits.
- Python doc edits on Windows need `encoding='utf-8'`.

## Current state

- Manually verified in Chrome: blocked-mic message, Retry after a network failure, 💡 paragraph with Italian-only speech, speech stops on session switch, mic hidden in Firefox.
- Server tests: 57 of 60 pass; the 3 failing suites are old scaffolds (#24). Client lint and build are clean.
- Not tested: Edge, Safari, non-English UI languages. One unexplained, unreproduced case where a user bubble vanished after Retry; it worked correctly on the next try.
- Not yet verified: `trust proxy: 1` on live (owner will test: 11 wrong `POST /auth/login` in a minute from one network should give 429 on the 11th, and a second network should not be blocked). Leave unticked until the owner reports.
- Refreshing a chat returns to the new-chat screen (selected session is React state only). Logged in the tracker for `chore/cleanup`, not fixed.
- Still open: server ESLint config (#25), tests (#24).

## Next session starts with

1. Check PR #35's CI went green, merge it, then tick the branch 6 tasks in the tracker and mark it ✅ (#35).
2. Confirm `/og-image.png` serves an image on Vercel and check the LinkedIn Post Inspector preview.
3. Start branch 7 `chore/tests-lint` (#24, #25, #26) from an up-to-date `main`. After it, add test and lint steps to `ci.yml`.
4. When the owner reports the `trust proxy` result, tick it and mark branch 4 done.

## Open questions

- Fix the refresh-loses-chat issue before the demo, or leave it for `chore/cleanup`?
- `trust proxy` result is pending from the owner.
- Whether to revisit email verification after the demo.
