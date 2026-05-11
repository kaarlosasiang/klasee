"use client"

import VerifyEmailForm from "@/components/forms/verify-email"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")

  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get("email") || ""
    setEmail(email)
  }, [searchParams])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <VerifyEmailForm email={email} />
    </div>
  )
}
