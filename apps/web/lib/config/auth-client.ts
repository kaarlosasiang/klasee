import { createAuthClient } from "better-auth/react"
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins"
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
  name: string
  role?: "student" | "instructor" | "admin"
}

type SignInEmailInput = {
  email: string
  password: string
}

const betterAuthBaseURL = new URL(constants.BETTER_AUTH_URL).origin

const authClient = createAuthClient({
  baseURL: betterAuthBaseURL, // API origin (no path)
  basePath: "/api/v1/auth", // Auth route prefix
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
  ],
})

export const signUp = {
  email: (input: SignUpEmailInput, options?: AuthCallbackOptions) =>
    authClient.signUp.email(input, options),
}

export const signIn = {
  email: (input: SignInEmailInput, options?: AuthCallbackOptions) =>
    authClient.signIn.email(input, options),
}

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
