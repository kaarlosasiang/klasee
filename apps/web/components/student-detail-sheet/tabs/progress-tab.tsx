"use client"

import * as React from "react"
import { Progress } from "@workspace/ui/components/progress"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { StudentDetail } from "@/lib/services/student-activity"

interface ProgressTabProps {
  data: StudentDetail | null
  loading: boolean
}

export function ProgressTab({ data, loading }: ProgressTabProps) {
  const percent = data?.overallProgressPercent ?? 0

  return (
    <div className="p-4">
      <div className="rounded-lg border p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Overall Progress</p>
          {loading ? (
            <Skeleton className="h-4 w-10" />
          ) : (
            <span className="text-sm font-semibold">{percent}%</span>
          )}
        </div>
        {loading ? (
          <Skeleton className="h-2 w-full rounded-full" />
        ) : (
          <Progress value={percent} className="h-2" />
        )}
        <p className="text-xs text-muted-foreground">
          Detailed analytics coming soon
        </p>
      </div>
    </div>
  )
}
