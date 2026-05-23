# Klasee

## Project

Klasee is an offline-first classroom management LMS for educational institutions. Key domains: courses, sections, attendance, assessments (quizzes/assignments), enrollments, announcements, and file storage (Google Drive + Cloudinary).

**Monorepo:** pnpm workspaces — Node ≥20, pnpm ≥9.15.9 required.

```
klasee/
├── apps/
│   ├── api/        Express 5 backend (port 4000)
│   └── web/        Next.js 16 frontend (port 3000)
└── packages/
    ├── ui/         Shared shadcn/ui component library (Storybook)
    ├── validators/ Shared Zod schemas
    ├── eslint-config/
    └── typescript-config/
```

## Commands

Run from repo root unless noted.

| Command | What it does |
|---|---|
| `pnpm dev` | Start both api and web in parallel |
| `pnpm dev:api` | API only (hot reload via tsx watch) |
| `pnpm dev:web` | Web only |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all packages (Prettier) |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm seed` | Seed MongoDB (run inside apps/api) |
| `pnpm storybook:ui` | Launch Storybook for UI library |

## Architecture

### API (`apps/api`)

- Express 5, TypeScript, ESM
- MongoDB + Mongoose 8 via `src/config/db.ts`
- Auth: better-auth 1.6.9 — all `/api/auth/*` routes are owned by better-auth; do not add custom logic there
- Constants/env: always read from `src/config/index.ts`, never `process.env` directly
- Logging: Winston with daily rotation; use the logger from `src/config/logger.ts`

**Module pattern** — each feature has its own folder:

```
src/modules/{feature}/
├── {feature}Controller.ts   HTTP request handlers
├── {feature}Service.ts      Business logic + MongoDB queries
└── {feature}Routes.ts       Express Router + middleware
src/models/{feature}Model.ts Mongoose schema + model
```

**Auth middleware** (from `src/shared/middleware/`):
- `requireAuth` — validates session
- `requireRole("instructor" | "admin" | "student")` — RBAC

**Route registration:** `src/routes/index.ts` — all REST routes mount under `/api/v1/*`.

### Web (`apps/web`)

- Next.js 16 App Router, React 19, TypeScript
- API proxy: `app/api/[...all]/route.ts` forwards all `/api/*` calls to the Express backend

**Route groups:**

| Group | Purpose |
|---|---|
| `(auth)` | Login, signup, verify email |
| `(student)` | My courses, assessments, attendance, dashboard |
| `(instructor)` | Dashboard, courses, sections, students, grades, schedules, settings |
| `(public)` | Invite page, landing |

**Frontend layers:**

| Layer | Location |
|---|---|
| API service clients (Axios) | `lib/services/{feature}.ts` |
| Zustand stores | `lib/store/` |
| Custom hooks | `lib/hooks/` |
| React contexts | `lib/contexts/` |
| Shared components | `components/{feature}/` |

### Shared packages

| Package | Use |
|---|---|
| `@workspace/ui` | shadcn/ui primitives — add new UI components here |
| `@workspace/validators` | Zod schemas used by both API and web |
| `@workspace/eslint-config` | Shared lint rules |
| `@workspace/typescript-config` | Shared TS compiler options |

## Conventions

**Naming:**
- API modules: `{feature}Controller.ts` / `{feature}Service.ts` / `{feature}Routes.ts`
- Mongoose models: singular PascalCase schema name, `{ timestamps: true }` on every schema
- React components: PascalCase file + folder (e.g. `components/modules-manager/ModulesManager.tsx`)
- Everything else: camelCase

**Code style (Prettier enforced):**
- Double quotes, no semicolons, 2-space indent, trailing comma (ES5)
- Tailwind CSS v4 — there is no `tailwind.config.js`; all config lives in `globals.css`
- ESM only — API imports must use `.js` extensions even for `.ts` source files

**No comments** unless the WHY is non-obvious (hidden constraint, workaround, subtle invariant).

## Adding a new backend feature

1. Create `src/models/{feature}Model.ts` (Mongoose schema + model)
2. Create `src/modules/{feature}/` with controller, service, routes files
3. Register the router in `src/routes/index.ts` under `/api/v1/{feature}`

## Adding a new frontend page

1. Add the route file inside the correct route group in `app/`
2. Create `lib/services/{feature}.ts` (Axios wrapper for the new endpoints)
3. Add components in `components/{feature}/`
4. Wire Zustand store in `lib/store/` if state needs to persist across navigation

## Key constraints

- No test framework is configured — do not generate test files
- `BETTER_AUTH_SECRET` must be ≥32 characters in production
- `MONGODB_URI` is required — the API will crash on startup if missing
- `CORS_ORIGIN` must match `FRONTEND_URL` in production

## Workflow rules

- After every implementation phase: run `pnpm typecheck`, then cross-check what was implemented against the plan before moving to the next phase
- Never push to the remote repository without explicit user approval
