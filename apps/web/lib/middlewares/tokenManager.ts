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
      // If refresh failed - user needs to log in again
      useAuthStore.getState().logout()
      window.location.href = "/login"

      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
