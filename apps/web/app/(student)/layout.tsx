"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Button } from "@workspace/ui/components/button"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { logout } = useAuth()
  return (
    <div>
      {children}
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}
