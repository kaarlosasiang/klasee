"use client"

import * as React from "react"
import {
  format,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { cn } from "@workspace/ui/lib/utils"
import type { Section } from "@/lib/services/sections"
import type { Course } from "@/lib/services/courses"

export interface FlatSection {
  section: Section
  course: Course
  bgClass: string
}

type ViewMode = "month" | "week" | "day"

// ─── Schedule parsing ────────────────────────────────────────────────────────

interface ParsedSchedule {
  days: string[]
  startMin: number
  endMin: number
}

const DAY_MAP: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
  fri: "Fri", sat: "Sat", sun: "Sun",
  m: "Mon", t: "Tue", w: "Wed", th: "Thu",
  f: "Fri", s: "Sat", su: "Sun",
}

const DAY_INDEX_TO_ABBR: Record<number, string> = {
  0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat",
}

function parseScheduleString(value: string): ParsedSchedule | null {
  if (!value.trim()) return null
  const timeMatch = value.match(/(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})/i)
  if (!timeMatch) return null
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  const startMin = toMin(timeMatch[1]!)
  const endMin = toMin(timeMatch[2]!)
  const dayPart = value.replace(timeMatch[0]!, "").trim()
  const tokens = dayPart.split(/[\s,]+/).filter(Boolean)
  const days = tokens
    .map((tk) => DAY_MAP[tk.toLowerCase()])
    .filter((d): d is string => !!d)
  if (days.length === 0 || startMin >= endMin) return null
  return { days, startMin, endMin }
}

// ─── Time grid constants ─────────────────────────────────────────────────────

const GRID_START = 7 * 60
const GRID_END = 21 * 60
const GRID_MINUTES = GRID_END - GRID_START
const HOUR_HEIGHT = 64
const GRID_HEIGHT = (GRID_MINUTES / 60) * HOUR_HEIGHT

const HOURS: number[] = []
for (let h = 7; h <= 21; h++) HOURS.push(h)

function formatHour(h: number) {
  if (h === 12) return "12pm"
  return h > 12 ? `${h - 12}pm` : `${h}am`
}

// ─── Event type ──────────────────────────────────────────────────────────────

interface GridEvent {
  top: number
  height: number
  label: string
  room?: string
  bgClass: string
  isLab: boolean
  section: Section
  course: Course
  date: string
}

function buildGridEvents(
  items: FlatSection[],
  dayAbbrToDate: Record<string, string>
): Record<string, GridEvent[]> {
  const map: Record<string, GridEvent[]> = {}
  Object.keys(dayAbbrToDate).forEach((d) => { map[d] = [] })

  for (const { section, course, bgClass } of items) {
    const label = `${course.code} · ${section.name}`
    for (const [schedStr, isLab] of [
      [section.schedule, false],
      [section.labSchedule, true],
    ] as [string | undefined, boolean][]) {
      if (!schedStr) continue
      const parsed = parseScheduleString(schedStr)
      if (!parsed) continue
      const s = Math.max(parsed.startMin, GRID_START)
      const e = Math.min(parsed.endMin, GRID_END)
      if (s >= e) continue
      const top = ((s - GRID_START) / GRID_MINUTES) * GRID_HEIGHT
      const height = ((e - s) / GRID_MINUTES) * GRID_HEIGHT
      for (const day of parsed.days) {
        const date = dayAbbrToDate[day]
        if (date === undefined) continue
        map[day]?.push({ top, height, label, room: section.room, bgClass, isLab, section, course, date })
      }
    }
  }
  return map
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function TimeColumn() {
  return (
    <div className="relative w-14 shrink-0 border-r border-border" style={{ height: GRID_HEIGHT }}>
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute right-2 -translate-y-2.5"
          style={{ top: (h - 7) * HOUR_HEIGHT }}
        >
          <span className="text-[10px] leading-none text-muted-foreground">{formatHour(h)}</span>
        </div>
      ))}
    </div>
  )
}

function EventBlock({
  evt,
  onAttendance,
  onEdit,
  wide,
}: {
  evt: GridEvent
  onAttendance: (s: Section, c: Course, date: string) => void
  onEdit: (s: Section, c: Course) => void
  wide?: boolean
}) {
  return (
    <button
      className={cn(
        "group absolute overflow-hidden rounded px-1.5 py-1 text-left text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        wide ? "inset-x-2 rounded-lg px-3" : "inset-x-0.5",
        evt.bgClass,
        evt.isLab && "opacity-75"
      )}
      style={{ top: evt.top, height: Math.max(evt.height, 24) }}
      onClick={() => onAttendance(evt.section, evt.course, evt.date)}
    >
      <p className={cn("truncate font-semibold leading-tight", wide ? "text-sm" : "text-[10px]")}>
        {evt.label}
      </p>
      {evt.height >= 36 && evt.room && (
        <p className={cn("truncate leading-tight opacity-80", wide ? "text-xs" : "text-[9px]")}>
          {evt.room}
        </p>
      )}
      {evt.height >= 28 && evt.isLab && (
        <p className={cn("leading-tight opacity-70", wide ? "text-xs" : "text-[9px]")}>Lab</p>
      )}
      {/* Edit icon — visible on hover */}
      <button
        className="absolute right-1 top-1 hidden size-4 items-center justify-center rounded bg-black/20 text-white group-hover:flex"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(evt.section, evt.course)
        }}
      >
        <Pencil className="size-2.5" />
      </button>
    </button>
  )
}

function DayEventsColumn({
  events,
  onAttendance,
  onEdit,
  wide,
}: {
  events: GridEvent[]
  onAttendance: (s: Section, c: Course, date: string) => void
  onEdit: (s: Section, c: Course) => void
  wide?: boolean
}) {
  return (
    <div
      className="relative flex-1 border-r border-border last:border-r-0"
      style={{ height: GRID_HEIGHT, minWidth: wide ? undefined : 80 }}
    >
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute inset-x-0 border-t border-border/40"
          style={{ top: (h - 7) * HOUR_HEIGHT }}
        />
      ))}
      {events.map((evt, i) => (
        <EventBlock key={i} evt={evt} onAttendance={onAttendance} onEdit={onEdit} wide={wide} />
      ))}
    </div>
  )
}

// ─── Month view ──────────────────────────────────────────────────────────────

function buildEventsByDayAbbr(items: FlatSection[]) {
  const map: Record<string, Array<{
    section: Section; course: Course; bgClass: string; isLab: boolean
  }>> = {}
  for (const { section, course, bgClass } of items) {
    for (const [schedStr, isLab] of [
      [section.schedule, false],
      [section.labSchedule, true],
    ] as [string | undefined, boolean][]) {
      if (!schedStr) continue
      const parsed = parseScheduleString(schedStr)
      if (!parsed) continue
      for (const day of parsed.days) {
        if (!map[day]) map[day] = []
        map[day]!.push({ section, course, bgClass, isLab })
      }
    }
  }
  return map
}

function MonthView({
  currentDate,
  items,
  onDayClick,
  onAttendance,
  onEdit,
}: {
  currentDate: Date
  items: FlatSection[]
  onDayClick: (date: Date) => void
  onAttendance: (section: Section, course: Course, date: string) => void
  onEdit: (section: Section, course: Course) => void
}) {
  const eventsByDay = React.useMemo(() => buildEventsByDayAbbr(items), [items])

  const weeks = React.useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const days: Date[] = []
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i))
    const result: Date[][] = []
    for (let i = 0; i < 6; i++) result.push(days.slice(i * 7, i * 7 + 7))
    return result
  }, [currentDate])

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
          {week.map((day, di) => {
            const abbr = DAY_INDEX_TO_ABBR[getDay(day)]!
            const events = eventsByDay[abbr] ?? []
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            const dateStr = format(day, "yyyy-MM-dd")

            return (
              <div
                key={di}
                className={cn(
                  "relative min-h-[96px] cursor-pointer border-r border-border last:border-r-0 p-1.5 transition-colors hover:bg-muted/30",
                  !inMonth && "bg-muted/20"
                )}
                onClick={() => onDayClick(day)}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    today && "bg-primary text-white",
                    !today && inMonth && "text-foreground",
                    !today && !inMonth && "text-muted-foreground/40"
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {events.slice(0, 2).map((evt, i) => (
                    <button
                      key={i}
                      className={cn(
                        "w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium text-white",
                        evt.bgClass,
                        evt.isLab && "opacity-75"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAttendance(evt.section, evt.course, dateStr)
                      }}
                    >
                      {evt.course.code} · {evt.section.name}
                    </button>
                  ))}
                  {events.length > 2 && (
                    <p className="pl-1 text-[10px] text-muted-foreground">
                      +{events.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Week view ───────────────────────────────────────────────────────────────

function WeekView({
  currentDate,
  items,
  onAttendance,
  onEdit,
}: {
  currentDate: Date
  items: FlatSection[]
  onAttendance: (section: Section, course: Course, date: string) => void
  onEdit: (section: Section, course: Course) => void
}) {
  const weekDays = React.useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end: endOfWeek(currentDate, { weekStartsOn: 0 }) })
  }, [currentDate])

  const dayAbbrToDate = React.useMemo(() => {
    const m: Record<string, string> = {}
    weekDays.forEach((d) => {
      const abbr = DAY_INDEX_TO_ABBR[getDay(d)]!
      m[abbr] = format(d, "yyyy-MM-dd")
    })
    return m
  }, [weekDays])

  const eventsByDay = React.useMemo(
    () => buildGridEvents(items, dayAbbrToDate),
    [items, dayAbbrToDate]
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div style={{ minWidth: 560 }}>
        <div className="flex border-b border-border bg-muted/40">
          <div className="w-14 shrink-0 border-r border-border" />
          {weekDays.map((day) => {
            const abbr = DAY_INDEX_TO_ABBR[getDay(day)]!
            const today = isToday(day)
            return (
              <div
                key={abbr}
                className="min-w-[80px] flex-1 border-r border-border px-2 py-2 last:border-r-0"
              >
                <p className={cn("text-xs font-semibold", today ? "text-primary" : "text-muted-foreground")}>
                  {abbr}
                </p>
                <p className={cn("text-base font-bold", today ? "text-primary" : "text-foreground")}>
                  {format(day, "d")}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex">
          <TimeColumn />
          {weekDays.map((day) => {
            const abbr = DAY_INDEX_TO_ABBR[getDay(day)]!
            return (
              <DayEventsColumn
                key={abbr}
                events={eventsByDay[abbr] ?? []}
                onAttendance={onAttendance}
                onEdit={onEdit}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Day view ────────────────────────────────────────────────────────────────

function DayView({
  currentDate,
  items,
  onAttendance,
  onEdit,
}: {
  currentDate: Date
  items: FlatSection[]
  onAttendance: (section: Section, course: Course, date: string) => void
  onEdit: (section: Section, course: Course) => void
}) {
  const abbr = DAY_INDEX_TO_ABBR[getDay(currentDate)]!
  const dateStr = format(currentDate, "yyyy-MM-dd")
  const eventsByDay = React.useMemo(
    () => buildGridEvents(items, { [abbr]: dateStr }),
    [items, abbr, dateStr]
  )
  const events = eventsByDay[abbr] ?? []

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex border-b border-border bg-muted/40">
        <div className="w-14 shrink-0 border-r border-border" />
        <div className="flex-1 px-3 py-2.5">
          <p className={cn("text-sm font-semibold", isToday(currentDate) && "text-primary")}>
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </p>
          <p className="text-xs text-muted-foreground">
            {events.length === 0
              ? "No classes scheduled"
              : `${events.length} class${events.length !== 1 ? "es" : ""} scheduled`}
          </p>
        </div>
      </div>

      <div className="flex">
        <TimeColumn />
        <DayEventsColumn
          events={events}
          onAttendance={onAttendance}
          onEdit={onEdit}
          wide
        />
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

interface ScheduleCalendarViewProps {
  items: FlatSection[]
  onAttendance: (section: Section, course: Course, date: string) => void
  onEdit: (section: Section, course: Course) => void
}

export function ScheduleCalendarView({ items, onAttendance, onEdit }: ScheduleCalendarViewProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("month")
  const [currentDate, setCurrentDate] = React.useState(() => new Date())

  function navigate(dir: -1 | 1) {
    setCurrentDate((d) => {
      if (viewMode === "month") return dir === 1 ? addMonths(d, 1) : subMonths(d, 1)
      if (viewMode === "week") return dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)
      return dir === 1 ? addDays(d, 1) : subDays(d, 1)
    })
  }

  function getTitle() {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy")
    if (viewMode === "week") {
      const s = startOfWeek(currentDate, { weekStartsOn: 0 })
      const e = endOfWeek(currentDate, { weekStartsOn: 0 })
      return s.getMonth() === e.getMonth()
        ? `${format(s, "MMM d")} – ${format(e, "d, yyyy")}`
        : `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`
    }
    return format(currentDate, "EEEE, MMMM d, yyyy")
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-2 text-sm font-semibold">{getTitle()}</span>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
        >
          <ToggleGroupItem value="month" className="px-3 text-xs">Month</ToggleGroupItem>
          <ToggleGroupItem value="week" className="px-3 text-xs">Week</ToggleGroupItem>
          <ToggleGroupItem value="day" className="px-3 text-xs">Day</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "month" && (
        <MonthView
          currentDate={currentDate}
          items={items}
          onDayClick={(date) => { setCurrentDate(date); setViewMode("day") }}
          onAttendance={onAttendance}
          onEdit={onEdit}
        />
      )}
      {viewMode === "week" && (
        <WeekView currentDate={currentDate} items={items} onAttendance={onAttendance} onEdit={onEdit} />
      )}
      {viewMode === "day" && (
        <DayView currentDate={currentDate} items={items} onAttendance={onAttendance} onEdit={onEdit} />
      )}
    </div>
  )
}
