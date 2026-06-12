import { createAuthClient } from "better-auth/react"
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins"
import { dashClient, sentinelClient } from "@better-auth/infra/client"
import { constants } from "./contants"

type AuthCallbackOptions = {
  onSuccess?: (ctx: any) => void
  onError?: (ctx: any) => void
}

type EmailOtpType =
  | "sign-in"
  | "change-email"
  | "email-verification"
  | "forget-password"

type SignUpEmailInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: "student" | "instructor" | "admin"
}

type SignInEmailInput = {
  email: string
  password: string
}

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
      },
    }),
    emailOTPClient(),
    dashClient({
      resolveUserId: ({ userId, user, session }) => {
        const id = userId ?? user?.id ?? session?.user?.id
        return id ?? undefined
      },
    }),
    sentinelClient({
      autoSolveChallenge: true,
    }),
  ],
})

export const signUp = {
  email: (input: SignUpEmailInput, options?: AuthCallbackOptions) =>
    authClient.signUp.email(
      {
        ...input,
        name: `${input.firstName} ${input.lastName}`.trim(),
      },
      options
    ),
}

export const signIn = {
  email: (input: SignInEmailInput, options?: AuthCallbackOptions) =>
    authClient.signIn.email(input, options),
}

export const signInWithSocial = (provider: "google" | "github") =>
  authClient.signIn.social({ provider })

export const signOut = (options?: { fetchOptions?: AuthCallbackOptions }) =>
  authClient.signOut(options)

export const emailOtp = {
  sendVerificationOtp: (input: {
    email: string
    type: EmailOtpType
  }): Promise<unknown> => authClient.emailOtp.sendVerificationOtp(input),
}

export const verifyEmailOtp = (input: {
  email: string
  otp: string
}): Promise<unknown> => authClient.emailOtp.verifyEmail(input)

export const checkVerificationOtp = (input: {
  email: string
  type: EmailOtpType
  otp: string
}): Promise<unknown> => authClient.emailOtp.checkVerificationOtp(input)

export const useSession = authClient.useSession

export const updateUser = (
  data: {
    name?: string
    firstName?: string
    lastName?: string
    phoneNumber?: string
    onboardingCompleted?: boolean
  },
  options?: AuthCallbackOptions
) => authClient.updateUser(data, options)

export const changePassword = (
  data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean },
  options?: AuthCallbackOptions
) => authClient.changePassword(data, options)

export const linkGoogleDrive = (
  callbackURL?: string
) =>
  authClient.linkSocial({
    provider: "google",
    callbackURL,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  })
