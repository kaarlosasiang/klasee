import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends session cookie automatically
  headers: {
    "Content-Type": "application/json",
  },
})

// Redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)