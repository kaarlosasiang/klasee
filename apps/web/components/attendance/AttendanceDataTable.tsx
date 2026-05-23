"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import { DataTablePagination } from "@workspace/ui/components/data-table/data-table-pagination"
import type { AttendanceStatus } from "@/lib/services/attendance"

export interface AttendanceRow {
  studentId: string
  name: string
  email: string
  status: AttendanceStatus | null
  isPending: boolean
}

interface AttendanceDataTableProps {
  rows: AttendanceRow[]
  saving: string | null
  onStatusChange: (studentId: string, status: AttendanceStatus) => void
}

const STATUS_OPTIONS: AttendanceStatus[] = ["present", "absent", "late", "excused"]

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present:
    "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800",
  absent: "border-red-200 bg-red-500/10 text-red-600 dark:border-red-800",
  late: "border-amber-200 bg-amber-500/10 text-amber-600 dark:border-amber-800",
  excused: "border-gray-200 bg-gray-500/10 text-gray-600 dark:border-gray-700",
}

const STATUS_DOTS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  excused: "bg-gray-400",
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AttendanceDataTable({
  rows,
  saving,
  onStatusChange,
}: AttendanceDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const savingRef = React.useRef(saving)
  savingRef.current = saving

  const onStatusChangeRef = React.useRef(onStatusChange)
  onStatusChangeRef.current = onStatusChange

  const columns = React.useMemo<ColumnDef<AttendanceRow>[]>(
    () => [
      {
        id: "student",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Student" />
        ),
        cell: ({ row }) => {
          const { name, email, isPending } = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8 shrink-0 rounded-full">
                <AvatarFallback className="text-xs font-medium">
                  {initials(name) || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{name}</span>
                  {isPending && (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-[10px] text-amber-600 dark:border-amber-700 dark:text-amber-400"
                    >
                      pending
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Status"
            className="flex justify-end"
          />
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const { studentId, status } = row.original
          const isSaving = savingRef.current === studentId
          return (
            <div className="flex justify-end">
              <Select
                value={status ?? ""}
                onValueChange={(v) =>
                  onStatusChangeRef.current(
                    studentId,
                    v as AttendanceStatus
                  )
                }
                disabled={isSaving}
              >
                <SelectTrigger
                  className={`w-32 h-8 ${
                    status ? STATUS_COLORS[status] : ""
                  }`}
                >
                  <SelectValue placeholder="Mark…" />
                </SelectTrigger>
                <SelectContent align="end">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${STATUS_DOTS[s]}`}
                        />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _id, value) => {
      const search = (value as string).toLowerCase()
      return (
        row.original.name.toLowerCase().includes(search) ||
        row.original.email.toLowerCase().includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 w-56 pl-8"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} student
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </span>
      </div>
      <DataTablePagination table={table} />
    </DataTable>
  )
}
