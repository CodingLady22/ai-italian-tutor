# AGENTS.md

Instructions for coding agents working on **AI Italian Tutor**. Read this first, then:

- `docs/context/project-overview.md`: what the app does, architecture, build plan
- `docs/context/progress-tracker.md`: current branch, open tasks, change log
- `docs/context/audit-2026-10.md`: full audit report (issues are referenced as `#1`–`#30`)

> This file lives at the git repository root (`app/`). All paths below are relative to it.

---

## Stack

| Part | Tech | Hosted on |
|---|---|---|
| Frontend | React 19 (Vite, JavaScript) + Tailwind 3 | Vercel |
| Backend | NestJS 11 (TypeScript) | Railway (Railpack builder) |
| Database | MongoDB (Mongoose) | — |
| AI | Google Gemini (`gemini-2.5-flash-lite`, via `@google/genai`) | — |
| Auth | JWT (bearer token) via Passport | — |
| Voice | Web Speech API (browser, Chrome/Edge only) | — |
| Email | Resend (not implemented yet, see tracker) | — |

## Folder layout

```
app/                       git repository root
  client/                  React app
    src/
      main.jsx, App.jsx    route table
      api/
        axios.js           axios instance + global 401 interceptor
        grammarTopics.js   grammar focus areas per level (A1–B1)
      context/AuthContext.jsx
      hooks/useTranslation.js
      i18n/translations.js all UI strings
      components/          ChatInterface.jsx, PrivateRoute.jsx, PublicRoute.jsx
      pages/               Dashboard.jsx, login.jsx, Register.jsx, LandingPage.jsx, ApiKeyGuide.jsx
    index.html
    .env.example
  server/                  NestJS API
    src/
      main.ts              bootstrap, CORS, global ValidationPipe
      app.module.ts
      app.controller.ts    root "Hello" stub
      auth/                auth.controller/service/module, jwt.strategy.ts, dto/, schema/user.schema.ts
      users/               users.controller/service/module, dto/
      chat/                chat.controller/service/module, dto/create-chat.dto.ts, schema/
      ai/                  ai.service.ts (Gemini calls + system prompt)
      common/utils/encryption.util.ts   AES-256-CBC for stored user API keys
    test/                  e2e tests
    .env.example
    railway.json
  docs/
    context/               project-overview.md, progress-tracker.md, audit-2026-10.md
    syllabi.txt
  README.md
  AGENTS.md                this file
```

> If a path here is wrong, fix this file in the same branch.

## Commands

```bash
# server
cd app/server
npm install
npm run start:dev      # dev server, default port 3000
npm test               # unit tests
npm run test:e2e       # e2e tests
npm run lint           # WARNING: currently runs with --fix and the config is broken (see #25).
                       # Until the split in branch 7, run: npx eslint "src/**/*.ts"

# client
cd app/client
npm install
npm run dev            # Vite dev server
npm run build
npm run lint
```

## Environment variables

Names below are the ones the code actually reads. Do not rename them: they are set in Railway and Vercel.

| Variable | Where | Purpose |
|---|---|---|
| `PORT` | server | API port (default 3000) |
| `DB_URL` | server | MongoDB connection string (falls back to `mongodb://localhost:27017/mydatabase`) |
| `JWT_SECRET` | server | JWT signing key (required) |
| `GOOGLE_API_KEY` | server | App-wide Gemini key for the free tier (required) |
| `ENCRYPTION_KEY` | server | 64-character hex key used to encrypt users' saved Gemini keys |
| `FRONTEND_URL` | server | Allowed CORS origin (used in `main.ts`) |
| `RESEND_API_KEY` | server | Email (only once email is implemented) |
| `RESEND_FROM_EMAIL` | server | Sender address for email (only once email is implemented) |
| `APP_URL` | server | In `.env.example` but not read by any code yet; intended for email links |
| `MAIL_PASS` | server | Stale, in the local `.env` only, unused; removed in branch 5 |
| `VITE_API_URL` | client | Backend base URL (axios falls back to `http://localhost:3000`). See `client/.env.example` |

Never commit `.env` files. Keep `.env.example` in sync whenever you add or rename a variable.

---

## Rules

### Security
- **Validate every request body with a DTO.** Use `@IsIn` for fixed choices (level, mode, language) and `@MaxLength` on every free-text field.
- **Check ownership on every resource.** Any route that reads or changes a session or message must confirm it belongs to the logged-in user (`findOne({ _id, user_id })`).
- **Rate-limit anything that calls Gemini or touches auth.** `ThrottlerModule` must stay registered globally.
- Never trust values from the client for limits or counts (quota, message count, level rules). The server decides.
- Never log or return API keys, tokens, or passwords.

### AI
- **Never save or count a failed AI reply.** If Gemini fails, throw an HTTP error (502/503) and let the client show an error state. Don't disguise errors as tutor messages.
- Send the **latest** 20 messages as history (sort descending, limit, reverse).
- Keep user input clearly separated from instructions in the prompt. Never insert unvalidated user text into the system prompt.
- The tutor only helps with learning Italian. Off-topic requests get a short, polite refusal.

### Free tier and cost
- The free limit is **5 AI calls per user** (`fallbackCount`; the session opener counts as one). This is deliberate: the app runs on the free Gemini tier and must not generate costs. **Do not raise it** without the owner's approval.
- Only successful Gemini calls on the app key count. Users with their own key are not counted.

### Shared constants
- Values used by both client and server (free message limit, levels, modes) live in one place and are imported, not hardcoded twice.

### Frontend
- All user-visible text goes through `client/src/i18n/translations.js` (via `useTranslation`). No hardcoded English strings.
- Every async action needs loading, error, and empty states.
- Voice features must fail visibly: show an inline message, not `alert()` or only a console log. Hide or disable the mic when the browser doesn't support it.

### Code quality
- Every bug fix comes with a test when practical (mock Mongoose models with `getModelToken`).
- Remove dead code and unused imports in files you touch. Don't refactor unrelated files.

---

## Workflow

1. Work on **one branch at a time**, as listed in `docs/context/progress-tracker.md`.
2. Only fix the audit issues assigned to the current branch. If you notice something else, add it to the tracker's "Found during work" section instead of fixing it.
3. Before finishing, run tests and lint for the parts you changed.
4. Update `docs/context/progress-tracker.md`: tick completed tasks and add a change-log entry (date, branch, what changed, files touched).
5. If you change architecture, endpoints, env vars, or commands, update `docs/context/project-overview.md` and this file.
