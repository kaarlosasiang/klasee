"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { StudentNavbar } from "@/components/common/student-navbar"
import { useSession } from "@/lib/config/auth-client"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  React.useEffect(() => {
    if (!isPending && session && (session.user as any)?.onboardingCompleted === false) {
      router.replace("/onboarding")
    }
  }, [isPending, session, router])

  return (
    <div className="flex min-h-screen flex-col">
      <StudentNavbar />
      <main className="flex-1 p-4 md:p-6 container mx-auto">{children}</main>
    </div>
  )
}
