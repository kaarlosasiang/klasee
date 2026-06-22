"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { CheckCircle2, Circle, Clock, FileText, Search, XCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import type { AttendanceStatus } from "@/lib/services/attendance"

export interface AttendanceRow {
  studentId: string
  name: string
  email: string
  status: AttendanceStatus | null
  note?: string
  isPending: boolean
}

interface AttendanceDataTableProps {
  rows: AttendanceRow[]
  saving: string | null
  onStatusChange: (
    studentId: string,
    status: AttendanceStatus | null,
    note?: string
  ) => void
  onOpenSheet?: (student: AttendanceRow) => void
}

const STATUS_CYCLE: (AttendanceStatus | null)[] = [null, "present", "late", "absent"]

function nextStatus(current: AttendanceStatus | null): AttendanceStatus | null {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] ?? null
}

const STATUS_ICON: Partial<Record<AttendanceStatus, React.ElementType>> = {
  present: CheckCircle2,
  late: Clock,
  absent: XCircle,
}

const STATUS_ICON_CLASS: Partial<Record<AttendanceStatus, string>> = {
  present: "text-emerald-500 hover:text-emerald-600",
  late: "text-amber-500 hover:text-amber-600",
  absent: "text-red-500 hover:text-red-600",
}

const NEXT_LABEL: Partial<Record<AttendanceStatus, string>> = {
  present: "Mark late",
  late: "Mark absent",
  absent: "Clear",
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
  onOpenSheet,
}: AttendanceDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const savingRef = React.useRef(saving)
  savingRef.current = saving

  const onStatusChangeRef = React.useRef(onStatusChange)
  onStatusChangeRef.current = onStatusChange
  const onOpenSheetRef = React.useRef(onOpenSheet)
  onOpenSheetRef.current = onOpenSheet

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
            <div className="flex items-center gap-2">
              <Avatar className="size-6 shrink-0 rounded-full">
                <AvatarFallback className="text-[10px] font-medium">
                  {initials(name) || "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-medium">{name}</span>
                  {isPending && (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-[10px] text-amber-600 dark:border-amber-700 dark:text-amber-400"
                    >
                      pending
                    </Badge>
                  )}
                </div>
                <span className="truncate text-[11px] text-muted-foreground">
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
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const { studentId, status } = row.original
          const isSaving = savingRef.current === studentId
          const Icon = (status && STATUS_ICON[status]) ?? Circle
          const iconClass =
            (status && STATUS_ICON_CLASS[status]) ??
            "text-muted-foreground/30 hover:text-muted-foreground/60"
          const tooltipLabel = (status && NEXT_LABEL[status]) ?? "Mark present"

          return (
            <div className="flex items-center justify-end gap-0.5">
              <TooltipProvider delayDuration={400}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isSaving}
                      className={iconClass}
                      onClick={() =>
                        onStatusChangeRef.current(
                          studentId,
                          nextStatus(status),
                          row.original.note
                        )
                      }
                    >
                      <Icon className="size-5" />
                      <span className="sr-only">{tooltipLabel}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{tooltipLabel}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isSaving}
                onClick={() => onOpenSheetRef.current?.(row.original)}
              >
                <FileText className="size-4" />
                <span className="sr-only">Details</span>
              </Button>
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const filteredRows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-8 w-48 pl-8 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredRows.length} student
          {filteredRows.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-xs text-muted-foreground"
                >
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
