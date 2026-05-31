"use client"

import { Settings } from "lucide-react"

export default function StudentSettingsPage() {
  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Settings className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Settings coming soon</p>
        <p className="text-xs text-muted-foreground">
          Notification preferences, password change, and more will be available here.
        </p>
      </div>
    </div>
  )
}
