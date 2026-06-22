"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { CalendarCheck, Pencil } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import type { Section } from "@/lib/services/sections"
import type { Course } from "@/lib/services/courses"
import type { FlatSection } from "./ScheduleCalendarView"

function formatSchedule(value: string | undefined): string {
  return value?.trim() || "—"
}

interface ScheduleTableViewProps {
  items: FlatSection[]
  onEdit: (section: Section, course: Course) => void
  onAttendance: (section: Section, course: Course, date: string) => void
}

export function ScheduleTableView({ items, onEdit, onAttendance }: ScheduleTableViewProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns = React.useMemo<ColumnDef<FlatSection>[]>(
    () => [
      {
        id: "course",
        accessorFn: (row) => row.course.name,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Course" />
        ),
        cell: ({ row }) => {
          const { course } = row.original
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{course.name}</span>
              <Badge
                variant="secondary"
                className="rounded-full text-[10px] font-normal"
              >
                {course.code}
              </Badge>
            </div>
          )
        },
      },
      {
        id: "section",
        accessorFn: (row) => row.section.name,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Section" />
        ),
        cell: ({ row }) => <span>{row.original.section.name}</span>,
      },
      {
        id: "students",
        accessorFn: (row) => row.section.enrolledCount,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Students" />
        ),
        cell: ({ row }) => (
          <div className="text-center">{row.original.section.enrolledCount}</div>
        ),
      },
      {
        id: "room",
        accessorFn: (row) => row.section.room ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Room" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.section.room || "—"}
          </span>
        ),
      },
      {
        id: "lecture",
        accessorFn: (row) => row.section.schedule ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Lecture" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatSchedule(row.original.section.schedule)}
          </span>
        ),
      },
      {
        id: "lab",
        accessorFn: (row) => row.section.labSchedule ?? "",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Lab" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">
            {formatSchedule(row.original.section.labSchedule)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const { section, course } = row.original
          const today = format(new Date(), "yyyy-MM-dd")
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title="Take attendance"
                onClick={() => onAttendance(section, course, today)}
              >
                <CalendarCheck className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                title="Edit schedule"
                onClick={() => onEdit(section, course)}
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onEdit, onAttendance]
  )

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => row.section._id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return <DataTable table={table} />
}
