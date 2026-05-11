import { create } from "zustand"

export interface AuthState {
  user: any | null
  accessToken: string | null 
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  setUser: (user: any) => void
  setAccessToken: (token: string) => void
  setIsAuthenticated: (value: boolean) => void
  setLoading: (value: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    }),
}))
