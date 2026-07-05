"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table"
import { Search, ClipboardList, Download, Loader2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import { DataTableViewOptions } from "@workspace/ui/components/data-table/data-table-view-options"
import { toast } from "sonner"
import type { CourseGradebook, GradebookStudent, GradeEntry } from "@/lib/services/gradebook"
import { exportGradebook } from "@/lib/services/gradebook"
import { upsertScore } from "@/lib/services/assessments"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    cellClassName?: string
    headerClassName?: string
    cellStyle?: React.CSSProperties
    headerStyle?: React.CSSProperties
  }
}

export interface AttendanceStat {
  present: number
  late: number
  excused: number
  absent: number
  total: number
}

const GROUP_STYLES: React.CSSProperties[] = [
  { backgroundColor: "rgba(139, 92, 246, 0.07)" },
  { backgroundColor: "rgba(14, 165, 233, 0.07)" },
  { backgroundColor: "rgba(16, 185, 129, 0.07)" },
  { backgroundColor: "rgba(245, 158, 11, 0.07)" },
  { backgroundColor: "rgba(244, 63, 94, 0.07)" },
  { backgroundColor: "rgba(99, 102, 241, 0.07)" },
  { backgroundColor: "rgba(20, 184, 166, 0.07)" },
  { backgroundColor: "rgba(249, 115, 22, 0.07)" },
]

const ATTENDANCE_STYLE: React.CSSProperties = { backgroundColor: "rgba(34, 197, 94, 0.07)" }

interface GradebookDataTableProps {
  courseId: string
  gradebook: CourseGradebook
  attendanceStats: Map<string, AttendanceStat>
  onPaginationChange: (page: number, limit: number) => void
  onScoreSaved?: () => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// Hue based on first char so each student gets a consistent but varied color
const AVATAR_COLORS = [
  "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  "bg-orange-500/15 text-orange-700 dark:text-orange-400",
]

function StudentAvatar({ name }: { name: string }) {
  const colorClass = AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
  return (
    <div
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colorClass}`}
    >
      {getInitials(name)}
    </div>
  )
}

function gradeColor(grade: string) {
  const n = parseFloat(grade)
  if (n <= 1.25) return "border-emerald-200 bg-emerald-500/10 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
  if (n <= 1.75) return "border-green-200 bg-green-500/10 text-green-700 dark:border-green-800 dark:text-green-400"
  if (n <= 2.25) return "border-sky-200 bg-sky-500/10 text-sky-700 dark:border-sky-800 dark:text-sky-400"
  if (n <= 2.75) return "border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-800 dark:text-blue-400"
  if (n <= 3.0)  return "border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-800 dark:text-amber-400"
  if (n <= 4.0)  return "border-orange-200 bg-orange-500/10 text-orange-700 dark:border-orange-800 dark:text-orange-400"
  return "border-red-200 bg-red-500/10 text-red-700 dark:border-red-800 dark:text-red-400"
}

function GradeBadge({ entry }: { entry: GradeEntry | null }) {
  if (!entry) return <span className="text-muted-foreground/40">—</span>
  return (
    <div
      className={`inline-flex flex-col items-center rounded-lg border px-2.5 py-1 ${gradeColor(entry.grade)}`}
    >
      <span className="text-sm font-bold tabular-nums leading-none">{entry.grade}</span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide leading-none">
        {entry.remark}
      </span>
    </div>
  )
}

function finalScoreColor(score: number | null) {
  if (score === null) return "text-muted-foreground/40"
  if (score >= 80) return "text-emerald-700 dark:text-emerald-400"
  if (score >= 60) return "text-amber-700 dark:text-amber-400"
  return "text-red-700 dark:text-red-400"
}

function EditableScoreCell({
  earned,
  possible,
  assessmentId,
  studentId,
  onSaved,
}: {
  earned: number | null
  possible: number
  assessmentId: string
  studentId: string
  onSaved?: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [value, setValue] = React.useState(earned !== null ? String(earned) : "")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    setValue(earned !== null ? String(earned) : "")
  }, [earned])

  async function save() {
    const num = Number(value)
    if (value === "" || isNaN(num) || num < 0 || num > possible) {
      setValue(earned !== null ? String(earned) : "")
      setEditing(false)
      return
    }
    if (num === earned) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await upsertScore({ assessmentId, studentId, score: num })
      toast.success("Score saved")
      onSaved?.()
    } catch {
      toast.error("Failed to save score")
      setValue(earned !== null ? String(earned) : "")
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={0}
        max={possible}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save()
          if (e.key === "Escape") {
            setValue(earned !== null ? String(earned) : "")
            setEditing(false)
          }
        }}
        className="h-7 w-16 rounded-md border-2 border-primary bg-background px-2 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      disabled={saving}
      className="min-w-[56px] rounded-md border border-dashed border-border px-2 py-1 text-xs tabular-nums hover:border-primary hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
      title="Click to edit score"
    >
      {earned !== null ? (
        <span className="font-medium">{earned}/{possible}</span>
      ) : (
        <span className="text-muted-foreground">—/{possible}</span>
      )}
    </button>
  )
}

function PctCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground/40">—</span>
  return <span className="text-xs font-semibold tabular-nums">{Math.round(value)}%</span>
}

export function GradebookDataTable({
  courseId,
  gradebook,
  attendanceStats,
  onPaginationChange,
  onScoreSaved,
}: GradebookDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [exporting, setExporting] = React.useState(false)
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: gradebook.page - 1,
    pageSize: gradebook.limit,
  })

  async function handleExport() {
    setExporting(true)
    try {
      const blob = await exportGradebook(courseId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "gradebook.csv"
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Gradebook exported")
    } catch {
      toast.error("Failed to export gradebook")
    } finally {
      setExporting(false)
    }
  }

  const { assessments, students } = gradebook
  // Attendance-named groups always render last among grade groups
  const groups = [...gradebook.groups].sort((a, b) => {
    const aAttend = a.name.toLowerCase().includes("attendance")
    const bAttend = b.name.toLowerCase().includes("attendance")
    if (aAttend && !bAttend) return 1
    if (!aAttend && bAttend) return -1
    return 0
  })
  const ungrouped = assessments.filter((a) => !a.groupId)

  const columns = React.useMemo<ColumnDef<GradebookStudent>[]>(() => {
    const cols: ColumnDef<GradebookStudent>[] = [
      {
        id: "student",
        accessorFn: (row) => row.student.name,
        header: ({ column }) => <DataTableColumnHeader column={column} label="Student" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <StudentAvatar name={row.original.student.name} />
            <div className="flex flex-col">
              <span className="whitespace-nowrap font-medium">
                {row.original.student.name}
              </span>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {row.original.student.section ?? row.original.student.email}
              </span>
            </div>
          </div>
        ),
        enableSorting: true,
        enableHiding: false,
      },
    ]

    groups.forEach((group, groupIdx) => {
      const bgStyle = GROUP_STYLES[groupIdx % GROUP_STYLES.length]
      const groupAssessments = assessments.filter((a) => a.groupId === group._id)

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
                <EditableScoreCell
                  earned={score?.earned ?? null}
                  possible={a.totalPoints}
                  assessmentId={a._id}
                  studentId={row.original.student._id}
                  onSaved={onScoreSaved}
                />
              </div>
            )
          },
          enableSorting: true,
          meta: { cellStyle: bgStyle, headerStyle: bgStyle },
        })),
        group.name.toLowerCase().includes("attendance") && groupAssessments.length === 0
          ? {
              id: `sub-${group._id}`,
              accessorFn: (row) => {
                const s = attendanceStats.get(row.student._id)
                return s && s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : null
              },
              header: () => (
                <div className="text-center text-[10px] text-muted-foreground/70">Subtotal</div>
              ),
              cell: ({ row }) => {
                const s = attendanceStats.get(row.original.student._id)
                if (!s || s.total === 0) return <div className="flex justify-center"><span className="text-muted-foreground/40">—</span></div>
                const attended = s.present + s.late
                const pct = Math.round((attended / s.total) * 100)
                return (
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold tabular-nums">{attended}/{s.total}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{pct}%</span>
                  </div>
                )
              },
              enableSorting: true,
              meta: { cellStyle: bgStyle, headerStyle: bgStyle },
            }
          : {
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
              meta: { cellStyle: bgStyle, headerStyle: bgStyle },
            },
      ]

      cols.push({
        id: `group-${group._id}`,
        header: () => (
          <div className="text-center font-semibold">
            {group.name}{" "}
            <span className="font-normal text-muted-foreground/60">{group.weight}%</span>
          </div>
        ),
        columns: groupCols,
        meta: { headerStyle: bgStyle },
      } as ColumnDef<GradebookStudent>)
    })

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
              <EditableScoreCell
                earned={score?.earned ?? null}
                possible={a.totalPoints}
                assessmentId={a._id}
                studentId={row.original.student._id}
                onSaved={onScoreSaved}
              />
            </div>
          )
        },
        enableSorting: true,
      })
    }

    // Final %
    cols.push({
      id: "finalScore",
      accessorFn: (row) => row.finalScore,
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} label="Final" />
        </div>
      ),
      cell: ({ row }) => {
        const { finalScore, currentScore } = row.original
        return (
          <div className="flex flex-col items-center">
            <div className={`font-semibold tabular-nums ${finalScoreColor(finalScore)}`}>
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

    // Grade badge
    cols.push({
      id: "gradeEntry",
      accessorFn: (row) => row.gradeEntry?.grade ?? null,
      header: ({ column }) => (
        <div className="flex justify-center">
          <DataTableColumnHeader column={column} label="Grade" />
        </div>
      ),
      cell: ({ row }) => {
        const { gradeEntry, currentGradeEntry } = row.original
        return (
          <div className="flex flex-col items-center gap-1">
            <GradeBadge entry={gradeEntry} />
            {currentGradeEntry && currentGradeEntry.grade !== gradeEntry?.grade && (
              <span className="text-[10px] tabular-nums text-muted-foreground/60">
                now {currentGradeEntry.grade}
              </span>
            )}
          </div>
        )
      },
      enableSorting: true,
    })

    return cols
  }, [assessments, groups, ungrouped, attendanceStats, onScoreSaved])

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      setPagination(next)
      onPaginationChange(next.pageIndex + 1, next.pageSize)
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = row.original.student.name.toLowerCase()
      const email = row.original.student.email.toLowerCase()
      const search = (filterValue as string).toLowerCase()
      return name.includes(search) || email.includes(search)
    },
    pageCount: Math.ceil(gradebook.total / pagination.pageSize),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Export CSV
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </DataTable>
  )
}
