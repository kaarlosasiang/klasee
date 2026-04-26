"use client"

import { createContext, useContext } from "react"
import {
  authClient,
  useSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
} from "../config/auth-client"
import { User } from "better-auth"

const CALLBACK_URL = "/dashboard"

interface AuthContextValue {
  session: ReturnType<typeof useSession>
  user: User | null
  isLoading: boolean
  error: Error | null
  signIn: {
    email: (email: string, password: string) => Promise<any>
    social: (provider: "google" | "github") => Promise<any>
    // emailOtp: (email: string, otp: string) => Promise<any>
  }
  signUp: {
    email: (name: string, email: string, password: string) => Promise<any>
  }
  signOut: () => Promise<any>
  updateUser: (data: Record<string, unknown>) => Promise<any>
  refetchSession: () => Promise<any>
  emailVerification: {
    sendOtp: (email: string) => Promise<any>
    verifyEmail: (email: string, otp: string) => Promise<any>
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const session = useSession()

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.data?.user || null,
        isLoading: session?.isPending || false,
        error: session?.error || null,
        signIn: {
          email: (email, password) =>
            authSignIn.email({ email, password, callbackURL: CALLBACK_URL }),
          social: (provider) =>
            authSignIn.social({ provider, callbackURL: CALLBACK_URL })
        },
        signUp: {
          email: (name, email, password) =>
            authSignUp.email({ name, email, password, callbackURL: CALLBACK_URL }),
        },
        signOut: () => authSignOut(),
        updateUser: (data) => authClient.updateUser(data),
        refetchSession: () => session.refetch(),
        emailVerification: {
          sendOtp: async (_email) => {},
          verifyEmail: async (_email, _otp) => {},
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
