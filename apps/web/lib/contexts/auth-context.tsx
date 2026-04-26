"use client"

import { createContext, useContext } from "react"
import { useSession } from "../config/auth-client"
import { User } from "better-auth"

interface AuthContextValue {
  session: ReturnType<typeof useSession>
  user: User | null
  isLoading: boolean
  error: Error | null

  signIn: {
    email: () => Promise<any>
    social: () => Promise<any>
    emailOtp: () => Promise<any>
  }

  signUp: {
    email: () => Promise<any>
  }

  signOut: () => Promise<any>
  updateUser: () => Promise<any>
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
          email: async () => {},
          social: async () => {},
          emailOtp: async () => {},
        },
        signUp: {
          email: async () => {},
        },
        signOut: async () => {},
        updateUser: async () => {},
        refetchSession: async () => {},
        emailVerification: {
          sendOtp: async (email: string) => {},
          verifyEmail: async (email: string, otp: string) => {},
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
