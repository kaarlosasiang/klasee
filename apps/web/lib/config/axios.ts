import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { normalizeError, logError } from "../middlewares/errorHandler"
import { getAccessToken, refreshAccessToken } from "../middlewares/tokenManager"

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  withCredentials: true,
})

// Add auth token to every request
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    config.headers["X-Request-ID"] = Math.random().toString(36).substring(7)

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

client.interceptors.response.use(
  // Success - return response data
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If 401 and hasn't been retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Don't retry or refresh for FormData/multipart requests — the body
      // is already consumed and a refresh failure would redirect the user.
      if (originalRequest.data instanceof FormData) {
        const err = normalizeError(error)
        logError(err, "AxiosResponse")
        return Promise.reject(err)
      }

      const newToken = await refreshAccessToken()

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return client(originalRequest)
      }
    }

    // Normalize and log the error
    const apiError = normalizeError(error)
    logError(apiError, "AxiosResponse")

    // Reject with normalized error
    return Promise.reject(apiError)
  }
)

export default client
