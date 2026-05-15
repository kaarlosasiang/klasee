"use client"

import * as React from "react"
import { ClipboardList } from "lucide-react"
import { Card } from "@workspace/ui/components/card"

export default function MyAssessmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assessments</h1>
      <Card className="flex flex-col items-center gap-3 py-16">
        <ClipboardList className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Assessments coming soon.
        </p>
      </Card>
    </div>
  )
}
