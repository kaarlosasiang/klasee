"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/config/auth-client"

export default function RootPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  React.useEffect(() => {
    if (isPending) return
    if (!session) {
      router.replace("/login")
      return
    }
    const role = (session.user as { role?: string })?.role
    if (role === "student") {
      router.replace("/my-dashboard")
    } else {
      router.replace("/dashboard")
    }
  }, [session, isPending, router])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  )
}
