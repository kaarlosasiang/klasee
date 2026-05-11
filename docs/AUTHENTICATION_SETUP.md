# Authentication Module Implementation Guide

Complete setup for Better Auth with Resend email provider, password validation, and full frontend authentication flows.

## Table of Contents
1. [Backend Setup](#backend-setup)
2. [Frontend Setup](#frontend-setup)
3. [Implementation Steps](#implementation-steps)
4. [Testing](#testing)

---

## Backend Setup

### 1. Install Resend Dependency

```bash
cd apps/api
pnpm add resend
```

### 2. Update `.env` with Resend API Key

Add to `apps/api/.env`:

```env
# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here

# Auth Redirect URLs
VERIFY_EMAIL_REDIRECT=http://localhost:3000/auth/verify-email
RESET_PASSWORD_REDIRECT=http://localhost:3000/auth/reset-password
```

Get your Resend API key from: https://resend.com/api-keys

### 2. Create Email Service

Create `apps/api/src/shared/services/email.ts`:

```typescript
import { Resend } from "resend"
import { constants } from "../../config/index.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const SENDER_EMAIL = "noreply@klasee.com"

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${constants.frontEndUrl}/auth/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Verify your Klasee email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Welcome to Klasee! Please verify your email address by clicking the link below:</p>
          <p>
            <a href="${verificationUrl}" style="background-color: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${constants.frontEndUrl}/auth/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: "Reset your Klasee password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw error
  }
}
```

### 3. Update Better Auth Configuration

Replace `apps/api/src/modules/auth/better-auth.ts`:

```typescript
import "dotenv/config"
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { emailVerification } from "better-auth/plugins"
import { forgetPassword } from "better-auth/plugins"
import { MongoClient } from "mongodb"
import { constants } from "../../config/index.js"
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../shared/services/email.js"

const client = new MongoClient(constants.mongodbUri!, {
  maxPoolSize: 5,
  retryWrites: false,
})
const db = client.db(constants.dbName)

const dbProxy = new Proxy(db, {
  get(target, prop, receiver) {
    if (prop === "collection") {
      return function (name: string, options?: any) {
        let collectionName = name
        if (name === "user") collectionName = "users"
        if (name === "organization") collectionName = "company"
        if (name === "emailVerification") collectionName = "emailVerifications"
        if (name === "forgetPasswordToken") collectionName = "passwordResetTokens"
        return target.collection(collectionName, options)
      }
    }
    return Reflect.get(target, prop, receiver)
  },
})

export const auth = betterAuth({
  database: mongodbAdapter(dbProxy as any),
  appUrl: constants.frontEndUrl,
  baseURL: constants.betterAuthOrigin,
  basePath: "/api/v1/auth",
  secret: constants.betterAuthSecret,
  trustedOrigins: [constants.frontEndUrl, constants.betterAuthOrigin],

  emailAndPassword: {
    enabled: true,
    password: {
      minLength: 8,
      pattern: {
        uppercase: true,
        lowercase: true,
        number: true,
        special: true,
      },
    },
  },

  plugins: [
    emailVerification({
      sendVerificationEmail: async (user, token) => {
        await sendVerificationEmail(user.email, token)
      },
    }),
    forgetPassword({
      sendResetEmail: async (user, token) => {
        await sendPasswordResetEmail(user.email, token)
      },
    }),
  ],

  socialProviders: {
    google: {
      clientId: constants.googleClientId as string,
      clientSecret: constants.googleClientSecret as string,
    },
    github: {
      clientId: constants.githubClientId as string,
      clientSecret: constants.githubClientSecret as string,
    },
  },

  user: {
    additionalFields: {
      schoolId: { type: "string", required: false },
      role: { type: "string", required: false },
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      phoneNumber: { type: "string", required: false },
      isActive: { type: "boolean", required: false },
      onboardingCompleted: { type: "boolean", required: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
})
```

---

## Frontend Setup

### 1. Install Better Auth Client & Dependencies

```bash
cd apps/web
pnpm add better-auth
```

### 2. Create Constants File

Create `apps/web/lib/config/constants.ts`:

```typescript
export const constants = {
  BETTER_AUTH_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1/auth",
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
}
```

### 3. Create Auth Client

Create `apps/web/lib/config/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react"
import { constants } from "./constants"

export const authClient = createAuthClient({
  baseURL: constants.BETTER_AUTH_URL,
  baseURLType: "server",
})

export const { signUp, signIn, signOut, useSession } = authClient
```

### 4. Create Auth Store

Create `apps/web/lib/hooks/useAuthStore.ts`:

```typescript
"use client"

import React from "react"
import { create } from "zustand"

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: "student" | "instructor" | "admin"
  emailVerified: boolean
  createdAt: Date
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),
}))
```

### 5. Create Auth Hook

Create `apps/web/lib/hooks/useAuth.ts`:

```typescript
"use client"

import { useRouter } from "next/navigation"
import { signUp, signIn, signOut } from "@/lib/config/auth-client"
import { useAuthStore } from "./useAuthStore"
import { constants } from "@/lib/config/constants"

export function useAuth() {
  const router = useRouter()
  const { setUser, setLoading, setError, logout } = useAuthStore()

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn.email(
        { email, password },
        {
          onSuccess: (ctx: any) => {
            const user = ctx.data?.user || ctx.user
            setUser({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as "student" | "instructor" | "admin",
              emailVerified: user.emailVerified || false,
              createdAt: new Date(user.createdAt),
            })

            const dashboards: Record<string, string> = {
              student: "/student/dashboard",
              instructor: "/instructor/dashboard",
              admin: "/admin/dashboard",
            }
            const redirectUrl =
              dashboards[user.role || "student"] || "/dashboard"
            router.push(redirectUrl)
          },
          onError: (ctx: any) => {
            setError(ctx.error?.message || "Login failed")
          },
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "instructor"
  ) => {
    setLoading(true)
    setError(null)

    try {
      await signUp.email(
        {
          email,
          password,
          name,
          role,
        },
        {
          onSuccess: (ctx: any) => {
            setError(null)
          },
          onError: (ctx: any) => {
            setError(ctx.error?.message || "Signup failed")
          },
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const logout_user = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            logout()
            router.push("/auth/login")
          },
        },
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const forgotPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${constants.BETTER_AUTH_URL}/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${constants.BETTER_AUTH_URL}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      router.push("/auth/login?message=Password reset successfully")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    signup,
    logout: logout_user,
    forgotPassword,
    resetPassword,
  }
}
```

### 6. Create Login Form

Create `apps/web/components/auth/login-form.tsx`:

```typescript
"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Alert } from "@workspace/ui/components/alert"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/lib/hooks/useAuthStore"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { isLoading, error } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState("")

  const message = searchParams.get("message")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!email || !password) {
      setLocalError("Email and password are required")
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setLocalError(error || "Login failed. Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome to Klasee</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {message && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          {message}
        </Alert>
      )}

      {(localError || error) && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          {localError || error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <p>
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/auth/signup")}
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
        <p>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="text-primary hover:underline"
          >
            Forgot password?
          </button>
        </p>
      </div>
    </Card>
  )
}
```

### 7. Create Signup Form

Create `apps/web/components/auth/signup-form.tsx`:

```typescript
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Alert } from "@workspace/ui/components/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/lib/hooks/useAuthStore"

const PASSWORD_REQUIREMENTS = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "One uppercase letter", regex: /[A-Z]/ },
  { text: "One lowercase letter", regex: /[a-z]/ },
  { text: "One number", regex: /[0-9]/ },
  { text: "One special character", regex: /[!@#$%^&*]/ },
]

export function SignupForm() {
  const router = useRouter()
  const { signup } = useAuth()
  const { isLoading, error } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"student" | "instructor">("student")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [localError, setLocalError] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const passwordRequirements = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.regex.test(password),
  }))

  const allRequirementsMet = passwordRequirements.every((req) => req.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!email || !password || !confirmPassword || !name) {
      setLocalError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    if (!allRequirementsMet) {
      setLocalError("Password does not meet requirements")
      return
    }

    if (!agreeToTerms) {
      setLocalError("You must agree to the terms of service")
      return
    }

    try {
      await signup(email, password, name, role)
      setShowSuccessMessage(true)
      setTimeout(() => {
        router.push("/auth/login?message=Check your email to verify your account")
      }, 3000)
    } catch (err) {
      setLocalError(error || "Signup failed. Please try again.")
    }
  }

  if (showSuccessMessage) {
    return (
      <Card className="w-full max-w-md space-y-6 p-6">
        <div className="space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Account Created!</h2>
          <p className="text-sm text-muted-foreground">
            Check your email to verify your account. Redirecting to login...
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Join Klasee to get started
        </p>
      </div>

      {(localError || error) && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          {localError || error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value: any) => setRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <ul className="space-y-1 text-xs">
            {passwordRequirements.map((req) => (
              <li
                key={req.text}
                className={req.met ? "text-green-600" : "text-muted-foreground"}
              >
                {req.met ? "✓" : "○"} {req.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-xs">
            I agree to the terms of service and privacy policy
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !allRequirementsMet}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p>
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  )
}
```

### 8. Create Forgot Password Form

Create `apps/web/components/auth/forgot-password-form.tsx`:

```typescript
"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Alert } from "@workspace/ui/components/alert"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/lib/hooks/useAuthStore"

export function ForgotPasswordForm() {
  const router = useRouter()
  const { forgotPassword } = useAuth()
  const { isLoading, error } = useAuthStore()

  const [email, setEmail] = useState("")
  const [localError, setLocalError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!email) {
      setLocalError("Email is required")
      return
    }

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setLocalError(error || "Failed to send reset email. Please try again.")
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md space-y-6 p-6">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold">Check Your Email</h2>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            The link expires in 24 hours. Check your spam folder if you don't see it.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/auth/login")}
        >
          Back to Login
        </Button>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            setSent(false)
            setEmail("")
          }}
        >
          Try Another Email
        </Button>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link
        </p>
      </div>

      {(localError || error) && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          {localError || error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p>
          Remember your password?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  )
}
```

### 9. Create Reset Password Form

Create `apps/web/components/auth/reset-password-form.tsx`:

```typescript
"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card } from "@workspace/ui/components/card"
import { Alert } from "@workspace/ui/components/alert"
import { useAuth } from "@/lib/hooks/useAuth"
import { useAuthStore } from "@/lib/hooks/useAuthStore"

const PASSWORD_REQUIREMENTS = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "One uppercase letter", regex: /[A-Z]/ },
  { text: "One lowercase letter", regex: /[a-z]/ },
  { text: "One number", regex: /[0-9]/ },
  { text: "One special character", regex: /[!@#$%^&*]/ },
]

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()
  const { isLoading, error } = useAuthStore()

  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setLocalError("Invalid reset link. Please try again.")
    }
  }, [token])

  const passwordRequirements = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.regex.test(password),
  }))

  const allRequirementsMet = passwordRequirements.every((req) => req.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    if (!password || !confirmPassword) {
      setLocalError("Both password fields are required")
      return
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    if (!allRequirementsMet) {
      setLocalError("Password does not meet requirements")
      return
    }

    try {
      if (!token) throw new Error("Invalid token")
      await resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setLocalError(error || "Failed to reset password. Please try again.")
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md space-y-6 p-6">
        <div className="space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Password Reset Successfully</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been changed. You can now sign in with your new password.
          </p>
        </div>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md space-y-6 p-6">
        <Alert className="bg-red-50 text-red-800 border-red-200">
          {localError}
        </Alert>
        <Button
          className="w-full"
          onClick={() => router.push("/auth/forgot-password")}
        >
          Request New Link
        </Button>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Set New Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter a new password for your account
        </p>
      </div>

      {(localError || error) && (
        <Alert className="bg-red-50 text-red-800 border-red-200">
          {localError || error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <ul className="space-y-1 text-xs">
            {passwordRequirements.map((req) => (
              <li
                key={req.text}
                className={req.met ? "text-green-600" : "text-muted-foreground"}
              >
                {req.met ? "✓" : "○"} {req.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !allRequirementsMet}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <p>
          Remember your password?{" "}
          <button
            onClick={() => router.push("/auth/login")}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  )
}
```

### 10. Create Auth Pages

**Create `apps/web/app/(auth)/login/page.tsx`:**

```typescript
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Sign In | Klasee",
  description: "Sign in to your Klasee account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <LoginForm />
    </div>
  )
}
```

**Create `apps/web/app/(auth)/signup/page.tsx`:**

```typescript
import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Create Account | Klasee",
  description: "Sign up for a Klasee account",
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <SignupForm />
    </div>
  )
}
```

**Create `apps/web/app/(auth)/forgot-password/page.tsx`:**

```typescript
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Forgot Password | Klasee",
  description: "Reset your Klasee password",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <ForgotPasswordForm />
    </div>
  )
}
```

**Create `apps/web/app/(auth)/reset-password/page.tsx`:**

```typescript
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata = {
  title: "Reset Password | Klasee",
  description: "Reset your password",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <ResetPasswordForm />
    </div>
  )
}
```

---

## Implementation Steps - Quick Start

Follow these steps in order:

### Backend (10 minutes)
1. `cd apps/api && pnpm add resend`
2. Create `src/shared/services/email.ts` (copy from section above)
3. Update `.env` with Resend API key
4. Replace `src/modules/auth/better-auth.ts` with updated config
5. Restart API server

### Frontend (20 minutes)
1. `cd apps/web && pnpm add better-auth`
2. Create all files in sections 2-9 (constants, client, store, hook, 4 forms)
3. Create all 4 pages in section 10
4. Start web server

---

## Testing Checklist

- [ ] Sign up → receive verification email
- [ ] Login with valid credentials → redirected to role dashboard
- [ ] Forgot password → receive reset email
- [ ] Reset password link → set new password → login works
- [ ] Invalid password → shows requirements
- [ ] Session persists on refresh
- [ ] Logout → redirected to login
