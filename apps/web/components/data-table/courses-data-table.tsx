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
  type RowSelectionState,
} from "@tanstack/react-table"
import { EllipsisVertical, GraduationCap, RotateCcw, Trash2, Archive, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
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
  onEdit: (course: Course) => void
  showArchived?: boolean
  onUnarchive?: (course: Course) => void
  onDelete?: (course: Course) => void
  onBulkArchive?: (courseIds: string[]) => void
  onBulkUnarchive?: (courseIds: string[]) => void
  onBulkDelete?: (courseIds: string[]) => void
}

export function CoursesDataTable({ data, onEdit, showArchived, onUnarchive, onDelete, onBulkArchive, onBulkUnarchive, onBulkDelete }: CoursesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const selectedIds = React.useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection]
  )

  const columns = React.useMemo<ColumnDef<Course>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Quizzes & Assign." />,
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
              <DropdownMenuContent align="end" className="w-40">
                {showArchived ? (
                  <DropdownMenuItem onClick={() => onUnarchive?.(course)}>
                    <RotateCcw className="mr-2 size-4" />
                    Unarchive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onEdit(course)}>Edit</DropdownMenuItem>
                )}
                {showArchived && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(course)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [onEdit, showArchived, onUnarchive, onDelete]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
  })

  const actionBar = selectedIds.length > 0 && (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/80 px-3 py-2 backdrop-blur-sm">
      <span className="text-xs font-medium text-muted-foreground">
        {selectedIds.length} selected
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        {showArchived ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkUnarchive?.(selectedIds)}
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Unarchive
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDelete?.(selectedIds)}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkArchive?.(selectedIds)}
          >
            <Archive className="mr-1.5 size-3.5" />
            Archive
          </Button>
        )}
      </div>
    </div>
  )

  return <DataTable table={table} actionBar={actionBar} />
}
