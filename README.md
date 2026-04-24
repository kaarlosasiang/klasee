# Klasee

Klasee is an offline-first classroom workflow platform being built in a Turborepo monorepo.

## Tech Stack

- Next.js 16 (App Router) in apps/web
- Shared UI package in packages/ui (shadcn/ui-based components)
- Tailwind CSS v4
- Turborepo + pnpm workspaces
- TypeScript + ESLint + Prettier

## Monorepo Structure

```
.
├── apps/
│   ├── web/                 # Next.js frontend
│   └── api/                 # API app scaffold
├── packages/
│   ├── ui/                  # Shared component library
│   ├── eslint-config/       # Shared lint config
│   └── typescript-config/   # Shared TS config
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Requirements

- Node.js >= 20
- pnpm 9+

## Getting Started

```bash
pnpm install
pnpm dev
```

This runs the monorepo dev pipeline via Turbo.

## Scripts

From the repository root:

- pnpm dev: run all dev tasks
- pnpm build: run all build tasks
- pnpm lint: run lint checks
- pnpm typecheck: run type checks
- pnpm format: run formatting

## Working with UI Components

Add a component to the shared UI package:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Import shared components in web:

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Current Status

- apps/web is active with App Router scaffold.
- packages/ui includes a large shared component set.
- apps/api is currently scaffolded and not implemented yet (server.ts is empty).

## Project Direction

Klasee v1 is focused on:

- Instructor and student role-based experiences
- Offline-first attendance and scoring workflows
- Sync-ready architecture for backend integration
- PWA readiness for field use in unstable connectivity
