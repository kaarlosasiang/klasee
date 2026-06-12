const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const constants = {
  BETTER_AUTH_URL: `${appUrl}/api/auth`,
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
}