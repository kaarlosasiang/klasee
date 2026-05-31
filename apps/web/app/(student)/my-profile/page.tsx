"use client"

import * as React from "react"
import { User, Mail, ShieldCheck } from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"

export default function StudentProfilePage() {
  const { data: session, isPending } = useSession()
  const user = session?.user

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-10">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="size-7 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold">{user?.name ?? "—"}</h1>
            <Badge variant="secondary" className="mt-1 text-xs font-normal capitalize">
              {user?.role ?? "student"}
            </Badge>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Email</span>
            <span className="ml-auto font-medium">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Role</span>
            <span className="ml-auto font-medium capitalize">{user?.role ?? "—"}</span>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Profile editing coming soon.
        </p>
      </div>
    </div>
  )
}
