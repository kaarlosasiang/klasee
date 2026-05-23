"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Clock } from "lucide-react"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

const DAY_ABBR_MAP: Record<string, string> = {
  m: "Mon",
  mon: "Mon",
  t: "Tue",
  tue: "Tue",
  w: "Wed",
  wed: "Wed",
  th: "Thu",
  thu: "Thu",
  f: "Fri",
  fri: "Fri",
  s: "Sat",
  sat: "Sat",
  su: "Sun",
  sun: "Sun",
}

function parseSchedule(value: string): {
  days: string[]
  startTime: string
  endTime: string
} {
  const days: string[] = []
  let startTime = ""
  let endTime = ""

  if (!value) return { days, startTime, endTime }

  const timeMatch = value.match(
    /(\d{1,2}):(\d{2})\s*(?:-|–|to)\s*(\d{1,2}):(\d{2})/i
  )
  if (timeMatch) {
    const to24 = (h: number) => h
    startTime = `${String(to24(Number(timeMatch[1]))).padStart(2, "0")}:${timeMatch[2]}`
    endTime = `${String(to24(Number(timeMatch[3]))).padStart(2, "0")}:${timeMatch[4]}`
  }

  const tokens = value.split(/[\s,]+/)
  for (const token of tokens) {
    const key = token.replace(/[^a-zA-Z]/g, "").toLowerCase()
    if (key && DAY_ABBR_MAP[key]) {
      const full = DAY_ABBR_MAP[key]
      if (!days.includes(full)) days.push(full)
    }
  }

  return { days, startTime, endTime }
}

function serialize(days: string[], startTime: string, endTime: string): string {
  const sorted = DAYS.filter((d) => days.includes(d))
  if (sorted.length === 0 && !startTime && !endTime) return ""
  const dayStr = sorted.join(" ")
  const timeStr = startTime && endTime ? `${startTime}-${endTime}` : ""
  return [dayStr, timeStr].filter(Boolean).join(" ")
}

interface SchedulePickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
}

export function SchedulePicker({ value, onChange, id }: SchedulePickerProps) {
  const parsed = React.useMemo(() => parseSchedule(value), [value])
  const [selectedDays, setSelectedDays] = React.useState(parsed.days)
  const [startTime, setStartTime] = React.useState(parsed.startTime)
  const [endTime, setEndTime] = React.useState(parsed.endTime)

  React.useEffect(() => {
    setSelectedDays(parsed.days)
    setStartTime(parsed.startTime)
    setEndTime(parsed.endTime)
  }, [parsed.days, parsed.startTime, parsed.endTime])

  function toggleDay(day: string) {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    setSelectedDays(next)
    onChange(serialize(next, startTime, endTime))
  }

  function handleStartTime(t: string) {
    setStartTime(t)
    onChange(serialize(selectedDays, t, endTime))
  }

  function handleEndTime(t: string) {
    setEndTime(t)
    onChange(serialize(selectedDays, startTime, t))
  }

  return (
    <div className="space-y-2" id={id}>
      <div className="flex flex-wrap gap-1.5">
        {DAYS.map((day) => {
          const active = selectedDays.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={cn(
                "flex h-7 min-w-9 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <Clock className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="time"
          value={startTime}
          onChange={(e) => handleStartTime(e.target.value)}
          className="h-7 w-28 rounded-md border border-border bg-transparent px-2 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => handleEndTime(e.target.value)}
          className="h-7 w-28 rounded-md border border-border bg-transparent px-2 text-xs text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}
