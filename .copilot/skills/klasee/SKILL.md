---
name: klasee
description: >
  Klasee project skill. Use for ALL tasks in this monorepo. Covers Next.js App
  Router, TanStack Query/Table/Form, Dexie.js offline-first layer, sync queue,
  Node.js + Express backend, Mongoose schemas, Better Auth (session-based),
  PWA (@ducanh2912/next-pwa), Tailwind CSS v4, shadcn/ui components, and
  Turborepo monorepo conventions. Triggers on: API routes, Express middleware,
  MongoDB/Mongoose, React components, useQuery, useMutation, DataTable,
  TanStack Form, Dexie, sync, offline, PWA, service worker, manifest, auth,
  Better Auth, sign-in, sign-up, sessions, protect routes, instructor, student,
  roles, attendance, scores, assessments, grading, courses, sections,
  enrollment, at-risk, analytics, topic difficulty, shadcn, Tailwind, Next.js
  pages, layouts, server components, client components, hooks.
---

# Klasee — Project Skill

## Stack Overview

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 16 (App Router) + React 19 | UI, routing, server components |
| Styling | Tailwind CSS v4 (new engine) + shadcn/ui | Utility-first + component primitives |
| Async State | TanStack Query v5 | Server ↔ UI bridge, cache, mutations |
| Data Grids | TanStack Table v8 | Attendance + score grids |
| Forms | TanStack Form v0 + Zod | Add/edit modals, schema validation |
| Offline DB | Dexie.js (IndexedDB) | Local DB, offline-first writes |
| Sync Engine | Custom sync queue | Write → queue → flush to server |
| Client IDs | `crypto.randomUUID()` | Stable offline IDs before server sync |
| Backend | Node.js + Express | REST API server |
| ODM | Mongoose | MongoDB schemas + validation |
| Database | MongoDB Atlas | Cloud sync target |
| Auth | Better Auth | Session-based auth, email+password, scrypt hashing |
| PWA | @ducanh2912/next-pwa | Service worker, app shell caching, installable |
| Monorepo | Turborepo + pnpm | Build orchestration, workspace packages |
| Frontend host | Vercel | `apps/web` deployment |
| Backend host | Render | `apps/api` deployment |

> **v1 scope**: Single-tenant (one instructor = one account). Better Auth Organization plugin is ready for v2 multi-tenant but NOT activated in v1.

---

## Monorepo Structure

```
klasee/
├── apps/
│   ├── web/                  # Next.js frontend (Vercel)
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Page-specific composite components
│   │   ├── hooks/            # Custom hooks (use-*.ts)
│   │   ├── lib/
│   │   │   ├── auth/         # Better Auth client config
│   │   │   ├── dexie/        # Local IndexedDB schema + helpers
│   │   │   └── sync/         # Sync queue engine + flush functions
│   │   └── package.json
│   └── api/                  # Express REST API (Render)
│       ├── src/
│       │   ├── models/       # Mongoose schemas
│       │   ├── routes/       # Express route handlers
│       │   ├── controllers/  # req/res handlers
│       │   ├── services/     # Business logic (no req/res)
│       │   ├── middleware/   # Auth guards, validation, error handler
│       │   └── lib/          # DB connection, utilities
│       ├── server.ts         # Entry point
│       └── package.json
├── packages/
│   ├── ui/                   # Shared shadcn/ui component library
│   ├── eslint-config/
│   └── typescript-config/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Workspace Package Aliases

| Alias | Resolves to |
|-------|------------|
| `@workspace/ui/components/*` | `packages/ui/src/components/*.tsx` |
| `@workspace/ui/lib/*` | `packages/ui/src/lib/*.ts` |
| `@workspace/ui/hooks/*` | `packages/ui/src/hooks/*.ts` |
| `@/*` | `apps/web/*` (within the web app) |

### Turbo Tasks

- `dev` — persistent, no cache
- `build` — depends on `^build`, outputs `.next/**`
- `lint` / `typecheck` — depend on `^lint` / `^typecheck`

---

## Data Model

All Mongoose documents use `{ timestamps: true }` for `createdAt`/`updatedAt`.

```
User (Better Auth managed)
  _id, name, email, role ("instructor" | "student"), createdAt

Course
  _id, instructorId (ref User), name, code, semester, createdAt

Section
  _id, courseId (ref Course), name, schedule, createdAt

Student
  _id, userId (ref User), firstName, lastName,
  email, studentId (school-issued ID), status ("active" | "dropped")

Enrollment
  _id, studentId (ref Student), sectionId (ref Section)
  <- flexible: irregular students can enroll in multiple sections

ClassSession  <- named ClassSession to avoid collision with Better Auth "session"
  _id, courseId (ref Course), sectionId (ref Section),
  date (ISO string), topic, learningOutcome, remarks

Attendance
  _id, sessionId (ref ClassSession), studentId (ref Student),
  status ("present" | "absent" | "late"), updatedAt

Assessment
  _id, sessionId (ref ClassSession), type ("quiz" | "lab" | "exam" | "other"),
  title, maxScore

AssessmentScore
  _id, assessmentId (ref Assessment), studentId (ref Student),
  score, updatedAt
```

### At-Risk Logic (computed server-side, never trust client)

```
attendancePercentage = presents / totalSessions * 100
averageScore        = mean of all AssessmentScore.score for student in section

at_risk         -> attendancePercentage < 70 AND averageScore < 75
needs_follow_up -> attendancePercentage < 80 OR averageScore < 80
doing_well      -> all other cases
```

Computed on the fly in `/api/students/:studentId/status` and `/api/sections/:sectionId/overview`. Never stored as a field.

---

## Route Structure (`apps/web/app`)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (instructor)/
│   ├── layout.tsx           <- session guard: redirect if role !== "instructor"
│   ├── dashboard/page.tsx
│   ├── courses/
│   │   └── [courseId]/
│   │       └── sections/
│   │           └── [sectionId]/
│   │               ├── sessions/
│   │               │   └── [sessionId]/page.tsx  <- attendance + assessments + scores
│   │               └── students/
│   │                   └── [studentId]/page.tsx  <- student detail + analytics
│   └── analytics/page.tsx
└── (student)/
    ├── layout.tsx           <- session guard: redirect if role !== "student"
    ├── dashboard/page.tsx
    ├── scores/page.tsx
    └── attendance/page.tsx
```

---

## API Endpoints (`apps/api`)

Better Auth handles `/api/auth/*` in `apps/web` — not in Express.
All routes require `authenticate`. Write routes also require `instructorOnly`.

```
# Courses
GET  /api/courses
POST /api/courses
GET  /api/courses/:courseId
PUT  /api/courses/:courseId

# Sections
GET  /api/courses/:courseId/sections
POST /api/courses/:courseId/sections
GET  /api/sections/:sectionId

# Students
GET  /api/sections/:sectionId/students
POST /api/sections/:sectionId/students
GET  /api/students/:studentId
PUT  /api/students/:studentId

# Class Sessions
GET  /api/sections/:sectionId/sessions
POST /api/sections/:sectionId/sessions
GET  /api/sessions/:sessionId

# Attendance (batch upsert — last-write-wins on updatedAt)
GET  /api/sessions/:sessionId/attendance
POST /api/sessions/:sessionId/attendance

# Assessments & Scores
GET  /api/sessions/:sessionId/assessments
POST /api/sessions/:sessionId/assessments
GET  /api/assessments/:assessmentId/scores
POST /api/assessments/:assessmentId/scores

# Analytics
GET  /api/sections/:sectionId/overview
GET  /api/students/:studentId/summary?sectionId=
GET  /api/students/:studentId/status?sectionId=
GET  /api/courses/:courseId/topic-difficulty

# Student self-access (read-only — always scoped to req.user.id)
GET  /api/me/attendance?sectionId=
GET  /api/me/scores?sectionId=
GET  /api/me/status?sectionId=
```

---

## Frontend (`apps/web`)

### Folder Structure

```
apps/web/
├── app/
│   ├── layout.tsx          # Root layout — ThemeProvider, fonts
│   ├── page.tsx            # Home / dashboard
│   ├── (auth)/             # Auth route group (login, register)
│   ├── (dashboard)/        # Protected route group
│   │   ├── classes/
│   │   ├── attendance/
│   │   └── scores/
│   └── api/                # Next.js Route Handlers (if needed)
├── components/             # App-level components (NOT in packages/ui)
├── hooks/                  # Custom hooks (use-*.ts)
├── lib/
│   ├── api.ts              # Axios/fetch client config
│   ├── queryClient.ts      # TanStack QueryClient singleton
│   └── db.ts               # Dexie database instance
└── providers.tsx           # Composed client providers
```

### RSC vs Client Components

- **Default to Server Components** — fetch data server-side, no `"use client"` unless needed
- **Add `"use client"`** only when using: hooks, event handlers, browser APIs, TanStack Query, Dexie, forms
- **Never** put `QueryClientProvider`, `useState`, `useEffect` in Server Components

```tsx
// Server Component (default) — no directive needed
export default async function ClassesPage() {
  // Direct data fetch, no useQuery
  return <ClassesTable />;
}

// Client Component — interactive
"use client";
export function AttendanceGrid() {
  const { data } = useQuery({ queryKey: ['attendance'], queryFn: fetchAttendance });
  return <DataTable columns={columns} data={data ?? []} />;
}
```

### Providers Setup

```tsx
// app/providers.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## TanStack Query

### QueryClient Singleton

```ts
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});
```

### useQuery Pattern

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/lib/api";

export function useStudents(classId: string) {
  return useQuery({
    queryKey: ["students", classId],
    queryFn: () => getStudents(classId),
    enabled: !!classId,
  });
}
```

### useMutation Pattern (with cache invalidation)

```tsx
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStudent } from "@/lib/api";

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
```

### Optimistic Updates (offline-first mutations)

```tsx
const mutation = useMutation({
  mutationFn: updateAttendance,
  onMutate: async (newRecord) => {
    await queryClient.cancelQueries({ queryKey: ["attendance"] });
    const previous = queryClient.getQueryData(["attendance"]);
    queryClient.setQueryData(["attendance"], (old) => [...old, newRecord]);
    return { previous };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(["attendance"], context?.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
  },
});
```

---

## TanStack Table

### Column Definition Pattern

```tsx
// components/columns/student-columns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Student } from "@/lib/types";

export const studentColumns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "attendance",
    header: "Attendance",
    cell: ({ row }) => `${row.original.attendance}%`,
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions student={row.original} />,
  },
];
```

### DataTable Component

```tsx
// components/data-table.tsx
"use client";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## TanStack Form

### Form with Zod Validation

```tsx
"use client";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";

const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
});

type StudentForm = z.infer<typeof studentSchema>;

export function AddStudentForm({ onSubmit }: { onSubmit: (data: StudentForm) => void }) {
  const form = useForm({
    defaultValues: { name: "", email: "" } satisfies StudentForm,
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{ onChange: studentSchema.shape.name }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Name</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors && (
              <p className="text-destructive text-sm">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />
      <Button type="submit" disabled={form.state.isSubmitting}>
        Add Student
      </Button>
    </form>
  );
}
```

---

## Offline-First Layer (Dexie.js)

### Database Definition

```ts
// lib/db.ts
import Dexie, { Table } from "dexie";

export interface AttendanceRecord {
  id: string;           // crypto.randomUUID() — stable offline
  studentId: string;
  classId: string;
  date: string;         // ISO date string
  status: "present" | "absent" | "late";
  synced: boolean;      // false until flushed to server
}

export interface ScoreRecord {
  id: string;
  studentId: string;
  classId: string;
  assessmentId: string;
  score: number;
  synced: boolean;
}

class KlaseeDB extends Dexie {
  attendance!: Table<AttendanceRecord>;
  scores!: Table<ScoreRecord>;

  constructor() {
    super("klasee");
    this.version(1).stores({
      attendance: "id, studentId, classId, date, synced",
      scores: "id, studentId, classId, assessmentId, synced",
    });
  }
}

export const db = new KlaseeDB();
```

### Writing Offline Records

```ts
// Always generate IDs client-side with crypto.randomUUID()
import { db } from "@/lib/db";

export async function markAttendance(record: Omit<AttendanceRecord, "id" | "synced">) {
  const id = crypto.randomUUID();
  await db.attendance.add({ ...record, id, synced: false });
  return id;
}
```

### Sync Queue Pattern

```ts
// lib/sync.ts — flush unsynced records to the server
import { db } from "./db";
import { api } from "./api";

export async function flushAttendance() {
  const unsynced = await db.attendance.where("synced").equals(0).toArray();
  if (!unsynced.length) return;

  try {
    await api.post("/attendance/bulk", { records: unsynced });
    const ids = unsynced.map((r) => r.id);
    await db.attendance.where("id").anyOf(ids).modify({ synced: true });
  } catch {
    // Stay offline — retry on next online event
  }
}

// Hook into online events
if (typeof window !== "undefined") {
  window.addEventListener("online", flushAttendance);
}
```

### Dexie + TanStack Query Bridge

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

export function useLocalAttendance(classId: string, date: string) {
  return useQuery({
    queryKey: ["attendance", "local", classId, date],
    queryFn: () =>
      db.attendance
        .where({ classId, date })
        .toArray(),
  });
}
```

---

## Better Auth (`apps/web`)

### Installation

```bash
# In apps/web
pnpm add better-auth
```

### Auth Server (`lib/auth/auth.ts`)

```ts
// apps/web/lib/auth/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";

const client = new MongoClient(process.env.MONGO_URI!);

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true,
    // Better Auth uses scrypt by default — no bcrypt needed
  },
  user: {
    additionalFields: {
      role: {
        type: ["instructor", "student"],
        required: false,
        defaultValue: "instructor",
        input: false, // Users cannot self-assign roles
      },
    },
  },
  plugins: [
    nextCookies(), // Must be last — enables cookie setting in Server Actions
    // NOTE: Better Auth Organization plugin is NOT activated in v1.
    // For v2 multi-tenant: import { organization } from "better-auth/plugins"
    // and add organization({...}) to plugins[] BEFORE nextCookies().
  ],
});
```

### Route Handler (`app/api/auth/[...all]/route.ts`)

```ts
// apps/web/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Auth Client (`lib/auth/auth-client.ts`)

```ts
// apps/web/lib/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

// Named exports for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
```

### `useSession` in Client Components

```tsx
"use client";
import { useSession } from "@/lib/auth/auth-client";

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;
  if (!session) return <a href="/login">Sign in</a>;

  return <span>Welcome, {session.user.name}</span>;
}
```

### Session in Server Components / Server Actions

```tsx
// Server Component
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <h1>Welcome, {session.user.name}</h1>;
}
```

```ts
// Server Action
"use server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function requireInstructor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role !== "instructor") throw new Error("Forbidden");
  return session.user;
}
```

### Route Group Layouts (Session Guards)

```tsx
// app/(instructor)/layout.tsx
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if ((session.user as any).role !== "instructor") redirect("/student/dashboard");
  return <>{children}</>;
}
```

```tsx
// app/(student)/layout.tsx
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if ((session.user as any).role !== "student") redirect("/instructor/dashboard");
  return <>{children}</>;
}
```

### Proxy (`proxy.ts`) — Fast UX Redirect

```ts
// apps/web/proxy.ts
// NOTE: Next.js 16 uses proxy.ts, NOT middleware.ts. Function must be named `proxy`.
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/instructor/:path*", "/student/:path*", "/login", "/register"],
};
```

### Sign In / Sign Up (Client)

```tsx
"use client";
import { signIn, signUp, signOut } from "@/lib/auth/auth-client";

// Register (role defaults to "instructor" server-side)
await signUp.email({
  name: "Maria Santos",
  email: "maria@dorsu.edu.ph",
  password: "securepassword",
  callbackURL: "/instructor/dashboard",
});

// Sign in
const { error } = await signIn.email({
  email: "maria@dorsu.edu.ph",
  password: "securepassword",
  rememberMe: true,
  callbackURL: "/instructor/dashboard",
});

// Sign out
await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
```

### Better Auth MongoDB Collections

Better Auth auto-creates these collections — **no manual migration needed**:

| Collection | Key fields |
|-----------|----------|
| user | id, name, email, emailVerified, image, role, createdAt, updatedAt |
| session | id, userId, token, expiresAt, ipAddress, userAgent |
| account | id, userId, providerId, accountId, password (scrypt) |
| verification | id, identifier, value, expiresAt |

---

## Multi-Tenancy — v2 Only

The Better Auth Organization plugin is **not activated in v1**. See the v2 Considerations section at the end. When ready:

```ts
// Add to auth.ts plugins[] BEFORE nextCookies():
import { organization } from "better-auth/plugins";
organization({ allowUserToCreateOrganization: ..., creatorRole: "owner" })

// Add to auth-client.ts plugins[]:
import { organizationClient } from "better-auth/client/plugins";
organizationClient()
```

---

## Backend (`apps/api`)

### Express App Setup

```ts
// apps/api/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { coursesRouter } from "./routes/courses";
import { sectionsRouter } from "./routes/sections";
import { studentsRouter } from "./routes/students";
import { sessionsRouter } from "./routes/sessions";
import { attendanceRouter } from "./routes/attendance";
import { assessmentsRouter } from "./routes/assessments";
import { analyticsRouter } from "./routes/analytics";
import { meRouter } from "./routes/me";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/courses", coursesRouter);
app.use("/api", sectionsRouter);
app.use("/api", studentsRouter);
app.use("/api", sessionsRouter);
app.use("/api", attendanceRouter);
app.use("/api", assessmentsRouter);
app.use("/api", analyticsRouter);
app.use("/api/me", meRouter);
app.use(errorHandler);

export { app };
```

```ts
// apps/api/server.ts
import { app } from "./src/app";
import { connectDB } from "./src/lib/db";

const PORT = process.env.PORT ?? 4000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)));
```

### MongoDB Connection

```ts
// src/lib/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB connected");
};
```

### Auth Middleware

```ts
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { id: string; name: string; email: string; role: "instructor" | "student" };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ message: "Unauthorized" });

  try {
    const response = await fetch(`${process.env.WEB_URL}/api/auth/get-session`, {
      headers: { cookie },
    });
    if (!response.ok) return res.status(401).json({ message: "Unauthorized" });

    const data = await response.json();
    if (!data?.user) return res.status(401).json({ message: "Unauthorized" });

    req.user = { id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const instructorOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "instructor") {
    return res.status(403).json({ message: "Instructors only." });
  }
  next();
};
```

### Mongoose Schema Patterns

```ts
// src/models/Course.ts
import { Schema, model, Document, Types } from "mongoose";

export interface ICourse extends Document {
  instructorId: Types.ObjectId;
  name: string; code: string; semester: string;
}

const courseSchema = new Schema<ICourse>(
  {
    instructorId: { type: Schema.Types.ObjectId, required: true, index: true },
    name:         { type: String, required: true, trim: true },
    code:         { type: String, required: true, trim: true },
    semester:     { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Course = model<ICourse>("Course", courseSchema);
```

```ts
// src/models/Attendance.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IAttendance extends Document {
  sessionId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: "present" | "absent" | "late";
}

const attendanceSchema = new Schema<IAttendance>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ClassSession", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student",      required: true, index: true },
    status:    { type: String, enum: ["present", "absent", "late"], required: true },
  },
  { timestamps: true }
);

// Compound unique index: one record per student per session (enables upsert)
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
```

### Batch Upsert Pattern (Last-Write-Wins)

```ts
// controllers/attendanceController.ts
export const batchUpsertAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { records } = req.body as { records: { studentId: string; status: string }[] };

    const ops = records.map((r) => ({
      updateOne: {
        filter: { sessionId, studentId: r.studentId },
        update: { $set: { status: r.status }, $setOnInsert: { sessionId, studentId: r.studentId } },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
```

### At-Risk Service

```ts
// src/services/analyticsService.ts
type AtRiskStatus = "at_risk" | "needs_follow_up" | "doing_well";

export async function computeStudentStatus(studentId: string, sectionId: string) {
  const sessionIds = await ClassSession.find({ sectionId }).distinct("_id");
  const total = sessionIds.length;

  const presents = await Attendance.countDocuments({
    sessionId: { $in: sessionIds }, studentId, status: "present",
  });
  const attendancePercentage = total > 0 ? (presents / total) * 100 : 100;

  const assessmentIds = await Assessment.find({ sessionId: { $in: sessionIds } }).distinct("_id");
  const scores = await AssessmentScore.find({ assessmentId: { $in: assessmentIds }, studentId });
  const averageScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    : 100;

  const reasons: string[] = [];
  if (attendancePercentage < 70) reasons.push(`Attendance ${attendancePercentage.toFixed(1)}% (below 70%)`);
  if (averageScore < 75) reasons.push(`Average score ${averageScore.toFixed(1)} (below 75)`);

  let status: AtRiskStatus = "doing_well";
  if (attendancePercentage < 70 && averageScore < 75) status = "at_risk";
  else if (attendancePercentage < 80 || averageScore < 80) status = "needs_follow_up";

  return { status, attendancePercentage, averageScore, reasons };
}
```

### Controller + Route Pattern

```ts
// src/controllers/courseController.ts
export const getCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Always scope by instructorId - never return another instructor's data
    const courses = await CourseService.findByInstructor(req.user!.id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
};
```

```ts
// src/routes/courses.ts
import { Router } from "express";
import { authenticate, instructorOnly } from "../middleware/auth";
import { getCourses, createCourse, getCourse, updateCourse } from "../controllers/courseController";

const router = Router();
router.use(authenticate);
router.get("/", getCourses);
router.post("/", instructorOnly, createCourse);
router.get("/:courseId", getCourse);
router.put("/:courseId", instructorOnly, updateCourse);

export const coursesRouter = router;
```

### Global Error Handler

```ts
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status ?? 500;
  res.status(status).json({ message: err.message ?? "Internal Server Error" });
};
```

### Zod Validation Middleware

```ts
// src/middleware/validate.ts
import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (err) {
      if (err instanceof ZodError) return res.status(400).json({ errors: err.errors });
      next(err);
    }
  };
```

---

## PWA (`apps/web`)

### Installation

```bash
pnpm add @ducanh2912/next-pwa --filter web
```

### `next.config.mjs`

```js
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: { disableDevLogs: true },
});

/** @type {import("next").NextConfig} */
const nextConfig = {};
export default withPWA(nextConfig);
```

### `public/manifest.json`

```json
{
  "name": "Klasee",
  "short_name": "Klasee",
  "description": "Offline-first attendance and grading for instructors",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Link Manifest in Root Layout

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  themeColor: "#1a1a2e",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Klasee" },
};
```

### Online / Offline Banner

```tsx
// components/connectivity-banner.tsx
"use client";
import { useEffect, useState } from "react";

export function ConnectivityBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  if (online) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-yellow-950 text-center py-2 text-sm font-medium z-50">
      You are offline — changes are saved locally and will sync when reconnected.
    </div>
  );
}
```

---

## Shared UI (`packages/ui`)

- All shared components live in `packages/ui/src/components/`
- Import in `apps/web` via `@workspace/ui/components/<name>`
- **Do not** copy components into `apps/web/components` — use the workspace alias
- `apps/web/components/` is only for app-specific composite components
- `cn()` utility from `@workspace/ui/lib/utils` — always use for conditional classes
- Style: `radix-luma`, Tailwind CSS v4 with oklch color variables

```ts
// Example import in apps/web
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
```

---

## Tailwind CSS v4 Notes

- **No `tailwind.config.ts`** — config lives in `globals.css` via `@import "tailwindcss"`
- **No `theme.extend`** — use CSS variables and `@theme` in the CSS file instead
- `postcss.config.mjs` in `apps/web` delegates to `packages/ui/postcss.config`
- Dark mode is class-based (`.dark` selector), toggled via `next-themes`
- Always use `cn()` for conditional Tailwind classes — never string concatenation

---

## Security Checklist

**Auth:**
- [ ] Better Auth uses `scrypt` by default — do not add bcrypt
- [ ] `input: false` on `role` additionalField — users cannot self-assign roles
- [ ] Always call `auth.api.getSession()` in route group layouts and Server Actions
- [ ] Better Auth sets `httpOnly` + `secure` cookies automatically in production
- [ ] Never expose `account.password` in any API response

**Data Scoping:**
- [ ] All instructor routes scope queries by `req.user.id` as `instructorId`
- [ ] Student `/me/*` routes always scope by `req.user.id` — never accept a `userId` param for self-access
- [ ] `instructorOnly` middleware on all write routes (POST/PUT/DELETE)

**General:**
- [ ] Validate all Express request bodies with **Zod** via `validate()` middleware
- [ ] Use `helmet()` on all Express responses
- [ ] Rate-limit `apps/web` auth endpoints — Better Auth supports built-in rate limiting via plugins
- [ ] Store all secrets (`BETTER_AUTH_SECRET`, `MONGO_URI`, etc.) in environment variables — never hardcode
- [ ] Use HTTPS in production (handled by Vercel + Render)
- [ ] Sanitize MongoDB queries — use Mongoose schema types, never raw `$where`
- [ ] MongoDB Atlas: whitelist only Render's outbound IPs; add indexes on `instructorId`, `sessionId`, `studentId`

---

## Environment Variables

```env
# apps/web (.env.local)
BETTER_AUTH_SECRET=<min-32-char-random-secret>  # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000            # Base URL of the Next.js app
MONGO_URI=mongodb+srv://...                      # Shared Atlas connection
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# apps/api (.env)
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb+srv://...                      # Same Atlas cluster
WEB_URL=http://localhost:3000                    # For session verification calls
CLIENT_URL=http://localhost:3000
```

---

## Deployment

| App | Platform | Trigger |
|-----|----------|---------|
| `apps/web` | Vercel | Push to `main` |
| `apps/api` | Render | Push to `main` |

- Vercel detects Next.js automatically — set root to `apps/web`
- Render: set build command `pnpm install && pnpm --filter api build`, start `node apps/api/server.js`
- Set all environment variables in each platform's dashboard
- MongoDB Atlas: add Render's outbound IPs to the Atlas IP Access List

---

## Sprint Reference

| Sprint | Weeks | Deliverable |
|--------|-------|-------------|
| 0 | 1-2 | Monorepo setup, skeleton deploy, Dexie schema, PWA manifest |
| 1 | 3-4 | Better Auth, roles (instructor/student), Dexie hydration on login |
| 2 | 5-6 | Courses, sections, students, enrollment, sync queue engine |
| 3 | 7-8 | Class sessions, attendance grid (offline), online/offline banner |
| 4 | 9-10 | Assessments, score sheet (offline), LWW conflict resolution |
| 5 | 11-12 | Analytics, at-risk engine, topic difficulty aggregation |
| 6 | 13 | Student portal — dashboard, scores, attendance (read-only) |
| 7 | 14 | PWA audit, seed script, production env, MongoDB indexes |

---

## v2 Considerations (Not in v1)

| Feature | Notes |
|---------|-------|
| Multi-tenant | Better Auth org plugin ready — add `organization()` to `plugins[]` in `lib/auth/auth.ts` |
| Mobile (Expo) | `apps/api` already serves it; build the React Native client |
| CSV student import | Class lists from registrar |
| Grade export (PDF/Excel) | Department submission |
| Weighted grade computation | Quizzes 30%, midterm 30%, final 40% |
| Email notifications | At-risk alerts to students |
