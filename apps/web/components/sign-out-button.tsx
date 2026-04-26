"use client"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { signOut } from "@/lib/config/auth-client"

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login"
        },
        onError: () => {
          setIsLoading(false)
        },
      },
    })
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  )
}
