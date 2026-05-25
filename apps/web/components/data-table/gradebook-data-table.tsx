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
import { Search, ClipboardList } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import { DataTableViewOptions } from "@workspace/ui/components/data-table/data-table-view-options"
import type { CourseGradebook, GradebookStudent } from "@/lib/services/gradebook"
import type { AssignmentGroup } from "@/lib/services/assignment-groups"

interface GradebookDataTableProps {
  gradebook: CourseGradebook
}

function ScoreCell({ earned, possible }: { earned: number | null; possible: number }) {
  if (earned === null) return <span className="text-muted-foreground/40">—</span>
  return (
    <Badge variant="secondary" className="font-mono text-xs">
      {earned}/{possible}
    </Badge>
  )
}

function PctCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground/40">—</span>
  return <span className="text-xs font-semibold tabular-nums">{Math.round(value)}%</span>
}

export function GradebookDataTable({ gradebook }: GradebookDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const { assessments, groups, students } = gradebook
  const ungrouped = assessments.filter((a) => !a.groupId)

  const columns = React.useMemo<ColumnDef<GradebookStudent>[]>(() => {
    const cols: ColumnDef<GradebookStudent>[] = [
      {
        id: "student",
        accessorFn: (row) => row.student.name,
        header: ({ column }) => <DataTableColumnHeader column={column} label="Student" />,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="whitespace-nowrap font-medium">{row.original.student.name}</span>
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {row.original.student.email}
            </span>
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ]

    // One column group per assignment group
    for (const group of groups) {
      const groupAssessments = assessments.filter((a) => a.groupId === group._id)
      if (groupAssessments.length === 0) continue

      const groupCols: ColumnDef<GradebookStudent>[] = [
        ...groupAssessments.map<ColumnDef<GradebookStudent>>((a) => ({
          id: `a-${a._id}`,
          accessorFn: (row) =>
            row.assessmentScores.find((s) => s.assessmentId === a._id)?.earned ?? null,
          header: () => (
            <div className="text-center">
              <div className="max-w-[90px] truncate text-xs">{a.title}</div>
              <div className="text-[10px] text-muted-foreground/60">/{a.totalPoints}</div>
            </div>
          ),
          cell: ({ row }) => {
            const score = row.original.assessmentScores.find((s) => s.assessmentId === a._id)
            return (
              <div className="flex justify-center">
                <ScoreCell earned={score?.earned ?? null} possible={a.totalPoints} />
              </div>
            )
          },
          enableSorting: true,
        })),
        {
          id: `sub-${group._id}`,
          accessorFn: (row) =>
            row.groupSummaries.find((s) => s.groupId === group._id)?.currentPct ?? null,
          header: () => (
            <div className="text-center text-[10px] text-muted-foreground/70">Subtotal</div>
          ),
          cell: ({ row }) => {
            const summary = row.original.groupSummaries.find((s) => s.groupId === group._id)
            return (
              <div className="flex justify-center">
                <PctCell value={summary?.currentPct ?? null} />
              </div>
            )
          },
          enableSorting: true,
        },
      ]

      cols.push({
        id: `group-${group._id}`,
        header: () => (
          <span className="font-semibold">
            {group.name}{" "}
            <span className="font-normal text-muted-foreground/60">{group.weight}%</span>
          </span>
        ),
        columns: groupCols,
      } as ColumnDef<GradebookStudent>)
    }

    // Ungrouped assessments (no parent header)
    for (const a of ungrouped) {
      cols.push({
        id: `a-${a._id}`,
        accessorFn: (row) =>
          row.assessmentScores.find((s) => s.assessmentId === a._id)?.earned ?? null,
        header: () => (
          <div className="text-center">
            <div className="max-w-[90px] truncate text-xs">{a.title}</div>
            <div className="text-[10px] text-muted-foreground/60">/{a.totalPoints}</div>
          </div>
        ),
        cell: ({ row }) => {
          const score = row.original.assessmentScores.find((s) => s.assessmentId === a._id)
          return (
            <div className="flex justify-center">
              <ScoreCell earned={score?.earned ?? null} possible={a.totalPoints} />
            </div>
          )
        },
        enableSorting: true,
      })
    }

    // Final grade column
    cols.push({
      id: "finalScore",
      accessorFn: (row) => row.finalScore,
      header: ({ column }) => <DataTableColumnHeader column={column} label="Final" />,
      cell: ({ row }) => {
        const { finalScore, currentScore } = row.original
        return (
          <div className="text-right">
            <div className="font-semibold tabular-nums">
              {finalScore !== null ? `${Math.round(finalScore)}%` : "—"}
            </div>
            {currentScore !== null && currentScore !== finalScore && (
              <div className="text-[10px] text-muted-foreground tabular-nums">
                now {Math.round(currentScore)}%
              </div>
            )}
          </div>
        )
      },
      enableSorting: true,
    })

    return cols
  }, [assessments, groups, ungrouped])

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = row.original.student.name.toLowerCase()
      const email = row.original.student.email.toLowerCase()
      const search = (filterValue as string).toLowerCase()
      return name.includes(search) || email.includes(search)
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14">
        <ClipboardList className="size-9 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No enrolled students yet</p>
      </div>
    )
  }

  return (
    <DataTable table={table}>
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9 w-60 pl-8"
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </DataTable>
  )
}
