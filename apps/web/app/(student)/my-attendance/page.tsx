"use client"

import * as React from "react"
import { CalendarCheck } from "lucide-react"
import { Card } from "@workspace/ui/components/card"

export default function MyAttendancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <Card className="flex flex-col items-center gap-3 py-16">
        <CalendarCheck className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Attendance coming soon.
        </p>
      </Card>
    </div>
  )
}
