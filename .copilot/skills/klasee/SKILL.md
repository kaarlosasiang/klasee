---
name: klasee
description: >
  Klasee project skill. Use for ALL tasks in this monorepo. Covers Next.js App
  Router, TanStack Query/Table/Form, Dexie.js offline-first layer, sync queue,
  Node.js + Express backend, Mongoose schemas, Better Auth with organization
  plugin (multi-tenant, session-based), Tailwind CSS v4, shadcn/ui components,
  and Turborepo monorepo conventions. Triggers on: API routes, Express
  middleware, MongoDB/Mongoose, React components, useQuery, useMutation,
  DataTable, TanStack Form, Dexie, sync, offline, auth, Better Auth, sign-in,
  sign-up, sessions, protect routes, organization, multi-tenant, school,
  tenant, roles, permissions, student access, student dashboard, teacher,
  admin, invite member, active org, scope data, shadcn, Tailwind, Next.js
  pages, layouts, server components, client components, hooks, attendance,
  scores, grading, teachers, students, classes.
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
| Multi-tenancy | Better Auth Organization plugin | School isolation, roles, member management |
| Monorepo | Turborepo + pnpm | Build orchestration, workspace packages |
| Frontend host | Vercel | `apps/web` deployment |
| Backend host | Render | `apps/api` deployment |

---

## Monorepo Structure

```
klasee/
├── apps/
│   ├── web/          # Next.js frontend (Vercel)
│   └── api/          # Express backend  (Render)
├── packages/
│   ├── ui/           # Shared shadcn/ui components
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

### Auth Server (`lib/auth.ts`)

```ts
// apps/web/lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";

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
        // app-level role; org membership role is separate
        type: ["teacher", "admin", "student"],
        required: false,
        defaultValue: "teacher",
        input: false, // Users cannot self-assign roles
      },
      schoolId: {
        // Students: links to organization.id without org membership
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    organization({
      // Only teachers and admins can create schools (organizations)
      allowUserToCreateOrganization: async (user) =>
        (user as any).role !== "student",
      creatorRole: "owner",
      membershipLimit: 500,
    }),
    nextCookies(), // Must be last — enables cookie setting in Server Actions
  ],
});
```

### Route Handler (`app/api/auth/[...all]/route.ts`)

```ts
// apps/web/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Auth Client (`lib/auth-client.ts`)

```ts
// apps/web/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Omit baseURL if client and server are on the same domain
  plugins: [organizationClient()],
});

// Named exports for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
```

### `useSession` in Client Components

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export function UserMenu() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;
  if (!session) return <a href="/sign-in">Sign in</a>;

  return <span>Welcome, {session.user.name}</span>;
}
```

### Getting Session in Server Components / Server Actions

```tsx
// Server Component
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return <h1>Welcome, {session.user.name}</h1>;
}
```

```ts
// Server Action
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user;
}
```

### Route Protection — Proxy (`proxy.ts`)

Next.js 16 uses `proxy.ts` instead of `middleware.ts`. Use cookie presence for fast optimistic redirects; validate the full session in each protected page/route.

```ts
// apps/web/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  // Fast cookie check — NOT a security boundary, just UX redirect
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Match all dashboard routes
  matcher: ["/dashboard/:path*", "/classes/:path*", "/attendance/:path*"],
};
```

> **Security**: `getSessionCookie` only checks cookie existence. Always call `auth.api.getSession()` in protected Server Components for real authorization.

### Sign In / Sign Up (Client)

```tsx
"use client";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Sign up
await signUp.email({
  name: "Jane Teacher",
  email: "jane@school.edu",
  password: "securepassword",
  callbackURL: "/dashboard",
});

// Sign in
await signIn.email({
  email: "jane@school.edu",
  password: "securepassword",
  rememberMe: true,
});

// Sign out
await signOut({
  fetchOptions: { onSuccess: () => router.push("/sign-in") },
});
```

### Express API — Session Verification

Since Better Auth runs in `apps/web`, the Express API verifies sessions by calling Better Auth's session endpoint with the forwarded cookie.

```ts
// apps/api/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { id: string; name: string; email: string; role: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ message: "Unauthorized" });

  try {
    const response = await fetch(
      `${process.env.WEB_URL}/api/auth/get-session`,
      { headers: { cookie } }
    );
    if (!response.ok) return res.status(401).json({ message: "Unauthorized" });

    const session = await response.json();
    if (!session?.user) return res.status(401).json({ message: "Unauthorized" });

    req.user = session.user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
```

### Better Auth MongoDB Schema

Better Auth auto-creates these collections in MongoDB Atlas — **no manual migration needed**:

**Core:**
- `user` — id, name, email, emailVerified, image, role, schoolId, createdAt, updatedAt
- `session` — id, userId, token, expiresAt, ipAddress, userAgent, **activeOrganizationId**
- `account` — id, userId, providerId, accountId, password (scrypt hash)
- `verification` — id, identifier, value, expiresAt

**Organization (added by `organization` plugin):**
- `organization` — id, name, slug, logo, metadata, createdAt
- `member` — id, userId, organizationId, role (`owner`/`admin`/`member`), createdAt
- `invitation` — id, email, inviterId, organizationId, role, status, expiresAt

---

## Multi-Tenancy — School Organizations

### Tenant Model

Each **school is one Better Auth Organization**. All app data (classes, attendance, scores) is scoped to `organizationId`.

| User type | Better Auth org role | App `role` field | Data access |
|-----------|---------------------|-----------------|-------------|
| School creator | `owner` | `admin` | Full school management |
| Principal / coordinator | `admin` | `admin` | Full school management |
| Teacher | `member` | `teacher` | Classes they teach |
| Student | — (not an org member) | `student` | Own attendance + scores (read-only) |

> Students are **not** organization members. They are linked to a school via `user.schoolId`.

### School (Organization) Lifecycle

```tsx
// 1. Admin signs up — role defaults to "teacher", update server-side to "admin"
// 2. Admin creates their school
await authClient.organization.create({
  name: "Springfield Primary School",
  slug: "springfield-primary",
});

// 3. Set it as the active organization
await authClient.organization.setActive({ organizationSlug: "springfield-primary" });

// 4. Invite teachers (they receive an email, click link, accept)
await authClient.organization.inviteMember({
  email: "teacher@school.edu",
  role: "member", // = teacher in Klasee
});

// 5. Teacher accepts (on the /accept-invitation/[id] page)
await authClient.organization.acceptInvitation({ invitationId });
```

### Reading Active Org in Server Components

Always derive `organizationId` from the session — never trust the client:

```tsx
// Any protected Server Component
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ClassesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) redirect("/onboarding/select-school");

  // Pass organizationId as a prop — never expose it in URL params alone
  return <ClassList organizationId={organizationId} />;
}
```

### useActiveOrganization (Client)

```tsx
"use client";
import { authClient } from "@/lib/auth-client";

export function SchoolHeader() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  return <h1>{activeOrg?.name ?? "No school selected"}</h1>;
}
```

### Permission Check Helper (Server)

```ts
// lib/permissions.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const roleRank = { member: 1, admin: 2, owner: 3 } as const;
type OrgRole = keyof typeof roleRank;

export async function requireOrgRole(minRole: OrgRole) {
  const [session, member] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    auth.api.getActiveMember({ headers: await headers() }),
  ]);
  if (!session) throw new Error("Unauthorized");

  const memberRole = (member?.data?.role ?? "member") as OrgRole;
  if ((roleRank[memberRole] ?? 0) < roleRank[minRole]) {
    throw new Error("Insufficient permissions");
  }
  return { session, member: member?.data };
}

// Usage in a Server Action:
// await requireOrgRole("admin"); // only admins and owners may proceed
```

### Proxy — Role-Based Route Splitting

```ts
// apps/web/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const session = await getCookieCache(request);
  const { pathname } = request.nextUrl;

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const role = (session.user as any)?.role as string | undefined;

  // Redirect students away from teacher/admin routes
  if (role === "student" && !pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // Redirect non-students away from student-only routes
  if (role !== "student" && pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/classes/:path*", "/attendance/:path*"],
};
```

### Express API — Multi-Tenant Auth Middleware

Update `apps/api/middleware/auth.ts` to validate the active org and attach `organizationId` to every request:

```ts
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;        // app-level role: teacher | admin | student
    organizationId: string; // active school — required for all data queries
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const cookie = req.headers.cookie;
  if (!cookie) return res.status(401).json({ message: "Unauthorized" });

  try {
    const response = await fetch(
      `${process.env.WEB_URL}/api/auth/get-session`,
      { headers: { cookie } }
    );
    if (!response.ok) return res.status(401).json({ message: "Unauthorized" });

    const data = await response.json();
    if (!data?.user) return res.status(401).json({ message: "Unauthorized" });

    const role = data.user.role as string;
    // Students: scoped to schoolId, not activeOrganizationId
    const organizationId =
      role === "student"
        ? data.user.schoolId
        : data.session?.activeOrganizationId;

    if (!organizationId) {
      return res.status(403).json({ message: "No active school. Select a school first." });
    }

    req.user = { ...data.user, organizationId };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Guard: teachers and admins only (blocks students)
export const teacherOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role === "student") {
    return res.status(403).json({ message: "Students have read-only access via the student API" });
  }
  next();
};
```

> **Critical**: Every service query must filter by `organizationId`. Never query without it.

---

## Student Access

### Student User Model

Students are Better Auth users with `role: "student"` and `schoolId` linking them to a school. They do **not** join the organization as a `member` — this prevents them from accessing org management endpoints.

- Sign in with email + password
- Read-only access to **their own** attendance and scores
- Cannot modify any data
- Scoped to `user.schoolId` (set by admin, not user)

### Creating Student Accounts (Admin-only Server Action)

Students are created by school admins — never self-registered:

```ts
// Server Action — admin creates a student account
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { requireOrgRole } from "@/lib/permissions";

export async function createStudent(data: {
  name: string;
  email: string;
  temporaryPassword: string;
  classId: string;
}) {
  const { session } = await requireOrgRole("admin");
  const organizationId = session.session.activeOrganizationId!;

  // Create the Better Auth user with student role + schoolId
  await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.temporaryPassword,
      role: "student",
      schoolId: organizationId,
    },
  });

  // Also create the student record in your app DB (classId, etc.)
  // await db.students.create({ userId, classId, organizationId })
}
```

### Student Sign-In

```tsx
"use client";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function StudentSignInForm() {
  const router = useRouter();

  const handleSubmit = async (email: string, password: string) => {
    const { error } = await signIn.email({
      email,
      password,
      rememberMe: false,
      callbackURL: "/student/dashboard",
    });
    if (error) console.error(error.message);
  };
  // ...
}
```

### Student Dashboard — Server Component

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const role = (session.user as any).role as string;
  if (role !== "student") redirect("/dashboard"); // teachers go elsewhere

  const studentUserId = session.user.id; // stable identifier for this student
  // Fetch only this student's own data from Express API
  const [attendance, scores] = await Promise.all([
    fetchMyAttendance(studentUserId),
    fetchMyScores(studentUserId),
  ]);

  return (
    <>
      <AttendanceTable records={attendance} readOnly />
      <ScoreTable records={scores} readOnly />
    </>
  );
}
```

### Detecting Role in Client Components

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;

  if (role === "student") return <StudentLayout>{children}</StudentLayout>;
  return <TeacherLayout>{children}</TeacherLayout>;
}
```

### Express — Student-Scoped Routes

```ts
// routes/student.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// Students can only GET their own records; the service enforces userId scope
router.get("/attendance", async (req, res, next) => {
  try {
    // req.user.id is the student's Better Auth userId
    const records = await AttendanceService.findByStudent(
      req.user!.id,
      req.user!.organizationId
    );
    res.json(records);
  } catch (err) {
    next(err);
  }
});

export const studentRouter = router;
```

> **Never** allow students to pass an arbitrary `studentId` param. Always use `req.user.id` from the verified session.

---

## Backend (`apps/api`)

### Folder Structure

```
apps/api/
├── server.ts           # Entry point — listen
├── app.ts              # Express app setup — no listen
├── routes/             # Router per resource
├── controllers/        # req/res handlers
├── services/           # Business logic (no req/res)
├── models/             # Mongoose models
├── middleware/
│   ├── auth.ts         # Better Auth session verification
│   ├── errorHandler.ts # Global error handler
│   └── validate.ts     # Zod request validation
├── config/
│   └── db.ts           # MongoDB connection
└── utils/
```

### Express App Setup

```ts
// app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";
import { studentsRouter } from "./routes/students";
import { attendanceRouter } from "./routes/attendance";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Auth routes are handled by Better Auth in apps/web, not here
app.use("/api/students", studentsRouter);
app.use("/api/attendance", attendanceRouter);

app.use(errorHandler); // Must be last
export { app };
```

```ts
// server.ts
import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT ?? 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});
```

### MongoDB Connection

```ts
// config/db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB connected");
};
```

### Mongoose Schema Pattern

```ts
// models/Student.ts
import { Schema, model, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  classId: Schema.Types.ObjectId;
  createdAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
  },
  { timestamps: true }
);

export const Student = model<IStudent>("Student", studentSchema);
```

### Controller Pattern

```ts
// controllers/studentController.ts
import { Request, Response, NextFunction } from "express";
import { StudentService } from "../services/studentService";

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const students = await StudentService.findByClass(req.params.classId);
    res.json(students);
  } catch (err) {
    next(err);
  }
};
```

### Auth Middleware

See the `authenticate` middleware in the **Better Auth** section above. Import and apply it to protected routes:

```ts
// routes/students.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getStudents } from "../controllers/studentController";

const router = Router();
router.use(authenticate); // Protect all student routes
router.get("/:classId", getStudents);
export const studentsRouter = router;
```

### Global Error Handler

```ts
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status ?? 500;
  res.status(status).json({ message: err.message ?? "Internal Server Error" });
};
```

### Zod Request Validation Middleware

```ts
// middleware/validate.ts
import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      next(err);
    }
  };
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
- [ ] **Password hashing**: Better Auth uses `scrypt` by default — do not add bcrypt; do not implement custom hashing unless intentional
- [ ] **Never expose** the `account` collection's `password` field in any API response
- [ ] `input: false` on all sensitive `additionalFields` (`role`, `schoolId`) — users cannot self-assign
- [ ] Always call `auth.api.getSession()` in protected Server Components — never trust cookie existence alone
- [ ] Better Auth sets `httpOnly` + `secure` cookies automatically in production

**Multi-tenancy:**
- [ ] Every Express route handler must filter all DB queries by `req.user.organizationId` — never return cross-tenant data
- [ ] Students are **not** org members; scope student data by `req.user.id` (their own userId) + `organizationId` (their schoolId)
- [ ] `teacherOnly` middleware on all write routes — students must never mutate data
- [ ] Validate `organizationId` is present in `authenticate` middleware before any handler runs
- [ ] Server-side permission check (`requireOrgRole`) before any admin action — never rely on UI-only guards

**General:**
- [ ] Validate all Express request bodies with **Zod** via `validate()` middleware
- [ ] Use `helmet()` on all Express responses
- [ ] Rate-limit `apps/web` auth endpoints — Better Auth supports built-in rate limiting via plugins
- [ ] Store all secrets (`BETTER_AUTH_SECRET`, `MONGO_URI`, etc.) in environment variables — never hardcode
- [ ] Use HTTPS in production (handled by Vercel + Render)
- [ ] Sanitize MongoDB queries — use Mongoose schema types, never raw `$where`

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
