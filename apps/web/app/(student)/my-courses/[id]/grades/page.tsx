"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  PenLine,
  HelpCircle,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getCourseById, type Course } from "@/lib/services/courses"
import {
  getMyGradebook,
  type StudentGradebook,
  type StudentAssessmentScoreEntry,
} from "@/lib/services/gradebook"

function assessmentIcon(type: string) {
  if (type === "quiz") return FileText
  if (type === "exam") return GraduationCap
  return PenLine
}

function assessmentColor(type: string) {
  if (type === "quiz") return "bg-blue-500/10 text-blue-600"
  if (type === "exam") return "bg-purple-500/10 text-purple-600"
  return "bg-amber-500/10 text-amber-600"
}

function statusBadge(entry: StudentAssessmentScoreEntry) {
  if (entry.isGraded)
    return (
      <Badge variant="default" className="mt-0.5 rounded-full text-[10px] font-normal">
        Graded
      </Badge>
    )
  return (
    <Badge variant="outline" className="mt-0.5 rounded-full text-[10px] font-normal">
      Pending
    </Badge>
  )
}

function ScoreDisplay({ entry }: { entry: StudentAssessmentScoreEntry }) {
  if (entry.earned === null) return <span className="text-sm font-medium">—</span>
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-sm font-medium">
        {entry.earned}/{entry.possible}
      </span>
      {entry.latePenalty > 0 && (
        <span className="text-[10px] text-destructive">
          −{entry.latePenalty} late
        </span>
      )}
    </div>
  )
}

export default function StudentGradesPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = React.useState<Course | null>(null)
  const [gradebook, setGradebook] = React.useState<StudentGradebook | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [courseData, gb] = await Promise.all([
          getCourseById(courseId),
          getMyGradebook(courseId),
        ])
        setCourse(courseData)
        setGradebook(gb)
      } catch {
        toast.error("Failed to load grades")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const hasGroups = (gradebook?.groups.length ?? 0) > 0
  const ungrouped =
    gradebook?.assessments.filter((a) => !a.groupId || !gradebook.groups.find((g) => g.groupId === a.groupId)) ?? []

  return (
    <div className="space-y-6">
      <Link
        href={`/my-courses/${courseId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      {/* Score summary card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h1 className="text-xl font-bold">{course?.name ?? "Course"} — Grades</h1>

        {hasGroups && gradebook ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Current grade</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {gradebook.currentScore !== null
                    ? `${Math.round(gradebook.currentScore)}%`
                    : "—"}
                </p>
                {gradebook.currentGradeEntry && (
                  <span className="text-lg font-semibold tabular-nums text-muted-foreground">
                    {gradebook.currentGradeEntry.grade}
                  </span>
                )}
              </div>
              {gradebook.currentGradeEntry && (
                <p className="mt-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                  {gradebook.currentGradeEntry.remark.toLowerCase()}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground">Based on graded work only</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Final grade</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {gradebook.finalScore !== null
                    ? `${Math.round(gradebook.finalScore)}%`
                    : "—"}
                </p>
                {gradebook.gradeEntry && (
                  <span className="text-lg font-semibold tabular-nums text-muted-foreground">
                    {gradebook.gradeEntry.grade}
                  </span>
                )}
              </div>
              {gradebook.gradeEntry && (
                <p className="mt-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                  {gradebook.gradeEntry.remark.toLowerCase()}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground">Unsubmitted counted as 0</p>
            </div>
          </div>
        ) : gradebook ? (
          (() => {
            const scored = gradebook.assessments.filter((a) => a.earned !== null)
            const totalEarned = scored.reduce((s, a) => s + (a.earned ?? 0), 0)
            const totalPossible = gradebook.assessments.reduce((s, a) => s + a.possible, 0)
            return scored.length > 0 ? (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {totalEarned}/{totalPossible}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0}%)
                </span>
              </div>
            ) : null
          })()
        ) : null}
      </div>

      {/* Group sections */}
      {hasGroups && gradebook ? (
        <div className="space-y-4">
          {gradebook.groups.map((group) => {
            const groupAssessments = gradebook.assessments.filter(
              (a) => a.groupId === group.groupId
            )
            return (
              <Card key={group.groupId}>
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div>
                    <span className="font-medium">{group.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{group.weight}% of grade</span>
                    {group.dropLowest > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        · lowest {group.dropLowest} dropped
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {group.currentPct !== null && (
                      <span className="text-sm font-semibold">
                        {Math.round(group.currentPct)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {groupAssessments.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-muted-foreground">
                      No assessments in this group
                    </p>
                  ) : (
                    groupAssessments.map((entry) => {
                      const Icon = assessmentIcon(entry.type)
                      return (
                        <div key={entry.assessmentId} className="flex items-center gap-4 px-5 py-3.5">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${assessmentColor(entry.type)}`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{entry.title}</p>
                            <p className="text-xs capitalize text-muted-foreground">{entry.type}</p>
                          </div>
                          <div className="text-right">
                            <ScoreDisplay entry={entry} />
                            {statusBadge(entry)}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            )
          })}

          {/* Ungrouped assessments */}
          {ungrouped.length > 0 && (
            <Card>
              <div className="border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Other assessments (unweighted)</span>
              </div>
              <div className="divide-y divide-border">
                {ungrouped.map((entry) => {
                  const Icon = assessmentIcon(entry.type)
                  return (
                    <div key={entry.assessmentId} className="flex items-center gap-4 px-5 py-3.5">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${assessmentColor(entry.type)}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{entry.title}</p>
                        <p className="text-xs capitalize text-muted-foreground">{entry.type}</p>
                      </div>
                      <div className="text-right">
                        <ScoreDisplay entry={entry} />
                        {statusBadge(entry)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Flat list (no groups configured) */
        <Card>
          <div className="divide-y divide-border">
            {(gradebook?.assessments ?? []).map((entry) => {
              const Icon = assessmentIcon(entry.type)
              return (
                <div key={entry.assessmentId} className="flex items-center gap-4 px-5 py-4">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${assessmentColor(entry.type)}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{entry.type}</p>
                  </div>
                  <div className="text-right">
                    <ScoreDisplay entry={entry} />
                    {statusBadge(entry)}
                  </div>
                </div>
              )
            })}
          </div>
          {(gradebook?.assessments.length ?? 0) === 0 && (
            <div className="flex flex-col items-center gap-3 py-12">
              <HelpCircle className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No assessments found</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
