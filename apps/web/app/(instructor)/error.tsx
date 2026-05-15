"use client"

import { Button } from "@workspace/ui/components/button"
import { AlertTriangle } from "lucide-react"

export default function InstructorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertTriangle className="size-10 text-destructive" />
      <h2 className="text-lg font-semibold">Failed to load</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {error.message || "An error occurred while loading this page."}
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Retry
      </Button>
    </div>
  )
}
