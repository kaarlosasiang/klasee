"use client"

import * as React from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { EllipsisVertical, Archive, GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import type { Course } from "@/lib/services/courses"
import { timeAgo } from "@/lib/utils/time"

interface CoursesDataTableProps {
  data: Course[]
  onArchive: (course: Course) => void
  onEdit: (course: Course) => void
}

export function CoursesDataTable({ data, onArchive, onEdit }: CoursesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])

  const columns = React.useMemo<ColumnDef<Course>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Course" />,
        cell: ({ row }) => {
          const course = row.original
          return (
            <Link href={`/courses/${course._id}`} className="flex items-center gap-3">
              <Avatar className="size-8 rounded-lg">
                {course.icon ? (
                  <AvatarImage src={course.icon} />
                ) : (
                  <AvatarFallback className="rounded-lg text-xs">
                    {course.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium">{course.name}</span>
            </Link>
          )
        },
        enableSorting: true,
      },
      {
        id: "code",
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Code" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("code")}</span>,
      },
      {
        id: "semester",
        accessorKey: "semester",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Semester" />,
        cell: ({ row }) => {
          const semester = row.getValue("semester") as string
          return (
            <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
              {semester === "1st" ? "1st Sem" : semester === "2nd" ? "2nd Sem" : "Summer"}
            </Badge>
          )
        },
      },
      {
        id: "sectionCount",
        accessorKey: "sectionCount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Sections" />,
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("sectionCount")}</div>
        ),
      },
      {
        id: "enrolledCount",
        accessorKey: "enrolledCount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Students" />,
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("enrolledCount")}</div>
        ),
      },
      {
        id: "assessmentCount",
        accessorKey: "assessmentCount",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Assessments" />,
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("assessmentCount")}</div>
        ),
      },
      {
        id: "lastActivity",
        accessorKey: "lastActivity",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Last Activity" />,
        cell: ({ row }) => {
          const val = row.getValue("lastActivity") as string | undefined
          return (
            <span className="text-xs text-muted-foreground">
              {val ? timeAgo(val) : "\u2014"}
            </span>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const course = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="size-7">
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(course)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(course)}>
                  <Archive className="mr-2 size-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [onArchive, onEdit]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  return <DataTable table={table} />
}
