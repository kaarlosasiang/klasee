"use client"

import * as React from "react"
import { Loader2, Percent } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import type { Enrollment } from "@/lib/services/enrollments"
import {
  getAssessments,
  getScores,
  type Assessment,
  type AssessmentScore,
} from "@/lib/services/assessments"

interface GradesTabProps {
  enrollment: Enrollment
}

export function GradesTab({ enrollment }: GradesTabProps) {
  const [assessments, setAssessments] = React.useState<Assessment[]>([])
  const [scores, setScores] = React.useState<AssessmentScore[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    Promise.all([
      getAssessments(enrollment.courseId._id),
      getScores({ studentId: enrollment.studentId._id }),
    ])
      .then(([a, s]) => {
        setAssessments(a)
        setScores(s)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [enrollment.courseId._id, enrollment.studentId._id])

  const assessmentMap = React.useMemo(
    () =>
      assessments.reduce(
        (map, a) => {
          map[a._id] = a
          return map
        },
        {} as Record<string, Assessment>
      ),
    [assessments]
  )

  const summary = React.useMemo(() => {
    if (scores.length === 0) return null
    const totalEarned = scores.reduce((sum, s) => sum + s.score, 0)
    const totalPossible = scores.reduce((sum, s) => {
      const a = assessmentMap[s.assessmentId]
      return sum + (a?.totalPoints ?? 0)
    }, 0)
    const average =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => {
              const a = assessmentMap[s.assessmentId]
              return sum + (a ? (s.score / a.totalPoints) * 100 : 0)
            }, 0) / scores.length
          )
        : 0
    return { totalEarned, totalPossible, average, count: scores.length }
  }, [scores, assessmentMap])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (scores.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <Percent className="size-8" />
        <p className="text-sm">No grades yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {summary && (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {summary.totalEarned} / {summary.totalPossible}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-medium text-muted-foreground">
                Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-lg font-bold ${
                  summary.average >= 80
                    ? "text-emerald-600"
                    : summary.average >= 70
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {summary.average}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-medium text-muted-foreground">
                Graded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{summary.count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-1">
        {scores.map((score) => {
          const assessment = assessmentMap[score.assessmentId]
          const percentage = assessment
            ? Math.round((score.score / assessment.totalPoints) * 100)
            : null
          return (
            <div
              key={score._id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {assessment?.title ?? "Unknown assessment"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {score.score} / {assessment?.totalPoints ?? "?"}
                  {score.feedback && ` — ${score.feedback}`}
                </p>
              </div>
              {percentage !== null && (
                <Badge
                  variant="outline"
                  className={`shrink-0 ml-3 ${
                    percentage >= 80
                      ? "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800"
                      : percentage >= 70
                        ? "border-amber-200 bg-amber-500/10 text-amber-600 dark:border-amber-800"
                        : "border-red-200 bg-red-500/10 text-red-600 dark:border-red-800"
                  }`}
                >
                  {percentage}%
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
