import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { constants } from "./contants"

type AuthCallbackOptions = {
  onSuccess?: (ctx: any) => void
  onError?: (ctx: any) => void
}

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

export const useSession = authClient.useSession
