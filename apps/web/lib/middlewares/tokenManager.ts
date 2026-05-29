import { useAuthStore } from "../hooks/useAuthStore"
import client from "../config/axios"

let refreshPromise: Promise<string | null> | null = null

export const getAccessToken = (): string | null => {
  const { accessToken } = useAuthStore.getState()
  return accessToken
}

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const response = await client.post("/auth/refresh")
      const { token } = response.data

      if (token) {
        useAuthStore.getState().setAccessToken(token)
        return token
      }

      return null
    } catch (e) {
      useAuthStore.getState().logout()

      try {
        const { toast } = await import("sonner")
        toast.error("Session expired. Please log in again.")
        await new Promise((r) => setTimeout(r, 800))
      } catch {
        // toast may fail if React context not available — redirect anyway
      }

      window.location.href = "/login"
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
