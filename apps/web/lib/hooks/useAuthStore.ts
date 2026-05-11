import { create } from "zustand"

export interface AuthUser{
  id: string
  email: string
  name?: string
  role: "student" | "instructor" | "admin"
  emailVerified: boolean
  createdAt: Date
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  setUser: (user: AuthUser | null) => void
  setAccessToken: (accessToken: string | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false, error: null })
  }
}))
