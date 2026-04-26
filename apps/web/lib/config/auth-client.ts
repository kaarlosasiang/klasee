import { oneTapClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: `${API_URL}/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    // you can add plugins here
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
    }),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
