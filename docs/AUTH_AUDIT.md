# Auth Audit — What's Done & What's Not

## ✅ Implemented

- **Email/password signup** — Zod-validated form, better-auth `emailAndPassword`, role selection (student/instructor/admin)
- **Email/password login** — Form → `signIn.email()` → role-based redirect
- **Email verification (OTP)** — `emailOTP` plugin, 6-digit OTP via Resend, verify-email page with input + resend button
- **Logout** — `signOut()` → redirect to `/auth/login`
- **Session management** — 7-day expiry, 5-min cookie cache, `useSession` hook
- **Role-based authorization middleware** — `requireAuth` / `requireRole` on API routes
- **Email verification middleware** — `requireEmailVerification` / `checkEmailVerification`
- **Backend social config** — Google & GitHub client IDs/secrets wired in better-auth config
- **Email service** — Resend integration with `sendVerificationEmail` and `sendPasswordResetEmail`

## ❌ Not Implemented

### 1. Forgot password

- [ ] Enable `forgetPassword` plugin in `better-auth.ts` (currently commented out)
- [ ] Create `apps/web/app/(auth)/forgot-password/page.tsx`
- [ ] Create forgot-password form component
- [ ] Wire `sendPasswordResetEmail` into the plugin's `sendResetEmail` callback (function exists in `email.ts` but is never called)

### 2. Reset password

- [ ] Create `apps/web/app/(auth)/reset-password/page.tsx`
- [ ] Create reset-password form component (reads `token` from search params, calls `resetPassword`)

### 3. Social sign-in (UI wiring)

- [ ] Wire Google button `onClick` in login form
- [ ] Wire Google button `onClick` in signup form
- [ ] Wire Apple button `onClick` in login form
- [ ] Wire Apple button `onClick` in signup form
- [ ] Add "Continue with GitHub" button to login form
- [ ] Add "Continue with GitHub" button to signup form

### 4. `proxy.ts`

- [ ] Implement `apps/web/proxy.ts` (better-auth proxy route handler for Next.js)
- [ ] Currently a stub: `export function proxy() {}`

### 5. AuthGuard (client-side)

- [ ] Create a client-side auth guard component that wraps pages/routes and redirects unauthenticated or unauthorized users

### 6. Password complexity

- [ ] Uncomment/enable password validation rules in `better-auth.ts` (min length, uppercase, lowercase, number, special)

### 7. Refresh token / token rotation

- [ ] Configure or implement refresh token logic if needed

## 🐛 Minor Issues

- Typo: `apps/web/lib/config/contants.ts` should be `constants.ts`
- No `layout.tsx` in `apps/web/app/(auth)/` route group
- Run `npx @better-auth/cli@latest migrate` after enabling any plugins
