## Summary

<!-- 2–4 sentences: what this PR does and why. Mention the audit issues, e.g. "closes #1, #4". Do not mention docs, memory.md or tracker updates. -->

## Type of change

<!-- Tick all that apply. -->

- [ ] Bug fix
- [ ] Security fix
- [ ] New feature
- [ ] Refactor (no behaviour change)
- [ ] Tests only
- [ ] Config / deployment
- [ ] Breaking change (existing behaviour, API or env vars change)

## Audit issues / tasks addressed

<!-- Issue numbers from docs/context/audit-2026-10.md and tracker tasks. Delete the row if not applicable. -->

| Issue | What was done |
|---|---|
| #  | |

## Major changes

<!-- Group by area. Say what changed in behaviour, not a line-by-line diff. -->

### Server
-

### Client
-

## Files affected

<!-- Only files in `server/` and `client/`. Mark each as added / modified / deleted. Never list or mention docs, AGENTS.md, memory.md or root config. -->

**Server**
- `server/src/...` (modified)

**Client**
- `client/src/...` (modified)

## How it was tested

- [ ] `npx tsc --noEmit` passes (server)
- [ ] Server unit tests pass for the parts I changed (`npm test`)
- [ ] New or updated tests added for bug fixes
- [ ] Client lint passes (`npm run lint`)
- [ ] Tried manually in the browser (describe below)

<!-- Test results, e.g. "29 new tests pass; full suite 5/9, the 4 failing are old scaffolds (#24)". Say honestly what was NOT tested. -->

## Security and cost checklist

<!-- Delete items that do not apply. -->

- [ ] Every new request body uses a DTO with `@IsIn` / `@MaxLength` where relevant
- [ ] Every route that reads or changes a session or message checks ownership
- [ ] Anything that calls Gemini or touches auth is rate-limited
- [ ] No secrets, keys or tokens in code, logs or responses; no `.env` committed
- [ ] The free-tier limit (5) is unchanged, or the owner approved the change
- [ ] A failed Gemini call is never saved or counted

## Environment and deployment

- [ ] No new or renamed env vars
- [ ] If there are: `.env.example` is updated, and Railway / Vercel need the new value before deploy

<!-- Anything to do after merge: set an env var, wake Railway, check the live site, etc. -->

## Breaking changes / migration

<!-- Write "None" if there are none. -->

None

## Notes for reviewers

<!-- Known limitations, follow-ups logged under "Found during work" in the tracker, things you are unsure about. -->

## Screenshots / recordings

<!-- For UI changes. Delete if not applicable. -->
