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
  type GlobalFilterTableState,
} from "@tanstack/react-table"
import { Search, Trash2, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import { DataTableFacetedFilter } from "@workspace/ui/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@workspace/ui/components/data-table/data-table-view-options"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import type { Enrollment } from "@/lib/services/enrollments"
import { timeAgo } from "@/lib/utils/time"
import { dropEnrollment } from "@/lib/services/enrollments"
import { toast } from "sonner"

interface StudentsDataTableProps {
  data: Enrollment[]
  onDrop?: (enrollmentId: string) => void
  onRowClick?: (enrollment: Enrollment) => void
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  dropped: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Dropped", value: "dropped" },
  { label: "Completed", value: "completed" },
]

export function StudentsDataTable({ data, onDrop, onRowClick }: StudentsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }])
  const [globalFilter, setGlobalFilter] = React.useState<GlobalFilterTableState["globalFilter"]>("")
  const [dropping, setDropping] = React.useState<string | null>(null)
  const [dropConfirm, setDropConfirm] = React.useState<Enrollment | null>(null)

  const handleDrop = async (enrollment: Enrollment) => {
    setDropping(enrollment._id)
    try {
      await dropEnrollment(enrollment._id)
      toast.success(`${enrollment.studentId.name} has been dropped`)
      onDrop?.(enrollment._id)
    } catch {
      toast.error("Failed to drop student")
    } finally {
      setDropping(null)
      setDropConfirm(null)
    }
  }

  const columns = React.useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        accessorKey: "studentId.name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Student" />,
        cell: ({ row }) => {
          const student = row.original.studentId
          const initials = student.name
            ?.split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8 rounded-full">
                <AvatarFallback className="text-xs">{initials ?? "??"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{student.name}</span>
                <span className="text-xs text-muted-foreground">{student.email}</span>
              </div>
            </div>
          )
        },
        enableSorting: true,
      },
      {
        id: "section",
        accessorKey: "sectionId.name",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Section" />,
        cell: ({ row }) => {
          const section = row.original.sectionId
          return (
            <div className="flex flex-col">
              <span className="text-sm">{section.name}</span>
              {section.schedule && (
                <span className="text-xs text-muted-foreground">{section.schedule}</span>
              )}
            </div>
          )
        },
      },
      {
        id: "status",
        accessorKey: "status",
        enableColumnFilter: true,
        header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge className={`rounded-full text-[10px] font-normal ${statusStyles[status] ?? ""}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
        meta: {
          variant: "select" as const,
          options: statusOptions,
        },
      },
      {
        id: "enrolledAt",
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Enrolled" />,
        cell: ({ row }) => {
          const val = row.getValue("enrolledAt") as string
          return <span className="text-xs text-muted-foreground">{val ? timeAgo(val) : "—"}</span>
        },
      },
      {
        id: "actions",
        enableSorting: false,
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const enrollment = row.original
          if (enrollment.status !== "active") return null
          return (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              disabled={dropping === enrollment._id}
              onClick={(e) => { e.stopPropagation(); setDropConfirm(enrollment) }}
            >
              <Trash2 className="size-4" />
            </Button>
          )
        },
      },
    ],
    [dropping]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const student = row.original.studentId?.name?.toLowerCase() ?? ""
      const section = row.original.sectionId?.name?.toLowerCase() ?? ""
      const search = (filterValue as string).toLowerCase()
      return student.includes(search) || section.includes(search)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <Users className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No students enrolled yet</p>
      </div>
    )
  }

  return (
    <>
      <DataTable table={table} onRowClick={onRowClick}>
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={(globalFilter as string) ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-60 pl-8"
            />
          </div>
          <div className="flex items-center gap-2">
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statusOptions}
            />
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </DataTable>

      <AlertDialog
        open={!!dropConfirm}
        onOpenChange={(open) => { if (!open) setDropConfirm(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drop student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark{" "}
              <span className="font-medium text-foreground">
                {dropConfirm?.studentId.name}
              </span>{" "}
              as dropped from{" "}
              <span className="font-medium text-foreground">
                {dropConfirm?.sectionId.name}
              </span>
              . This cannot be undone from here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={dropping === dropConfirm?._id}
              onClick={() => dropConfirm && handleDrop(dropConfirm)}
            >
              {dropping === dropConfirm?._id ? "Dropping..." : "Drop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
