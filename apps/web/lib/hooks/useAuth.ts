import { useRouter } from "next/navigation"
import { signUp, signIn, signOut, emailOtp } from "@/lib/config/auth-client"
import { useAuthStore } from "./useAuthStore"
import { constants } from "../config/contants"
import { use } from "react"
import { emailOTP } from "better-auth/plugins/email-otp"

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
              emailVerified: user.emailVerified,
              createdAt: new Date(user.createdAt),
            })
            console.log("Logged in user:", user)

            if (!user.emailVerified) {
              router.push(
                `/verify-email?email=${encodeURIComponent(user.email)}`
              )
              return
            }

            const dashboards: Record<string, string> = {
              student: "/my-dashboard",
              instructor: "/dashboard",
              admin: "/admin-dashboard",
            }

            const redirectUrl =
              dashboards[user.role || "student"] || "/my-dashboard"
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
    role: "student" | "instructor" | "admin"
  ) => {
    setLoading(true)
    setError(null)

    try {
      await signUp.email(
        { email, password, name, role },
        {
          onSuccess: async (ctx: any) => {
            setError(null)

            await emailOtp.sendVerificationOtp({
              email,
              type: "email-verification",
            })

            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
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
