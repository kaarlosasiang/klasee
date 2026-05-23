"use client"

import * as React from "react"
import { FileQuestion, Loader2 } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import type { Enrollment } from "@/lib/services/enrollments"
import {
  getAssessments,
  getScores,
  type Assessment,
  type AssessmentScore,
} from "@/lib/services/assessments"

const TYPE_ICONS: Record<string, string> = {
  quiz: "border-blue-200 bg-blue-500/10 text-blue-600 dark:border-blue-800",
  exam: "border-purple-200 bg-purple-500/10 text-purple-600 dark:border-purple-800",
  assignment:
    "border-orange-200 bg-orange-500/10 text-orange-600 dark:border-orange-800",
}

interface ActivitiesTabProps {
  enrollment: Enrollment
}

type ActivityStatus = "graded" | "not-submitted"

const STATUS_BADGES: Record<ActivityStatus, { label: string; className: string }> =
  {
    graded: {
      label: "Graded",
      className:
        "border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800",
    },
    "not-submitted": {
      label: "Not Submitted",
      className:
        "border-gray-200 bg-gray-500/10 text-gray-600 dark:border-gray-700",
    },
  }

export function ActivitiesTab({ enrollment }: ActivitiesTabProps) {
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

  const scoredAssessmentIds = React.useMemo(
    () => new Set(scores.map((s) => s.assessmentId)),
    [scores]
  )

  const scoredMap = React.useMemo(
    () =>
      scores.reduce(
        (map, s) => {
          map[s.assessmentId] = s
          return map
        },
        {} as Record<string, AssessmentScore>
      ),
    [scores]
  )

  const items = React.useMemo(() => {
    return assessments
      .filter((a) => ["quiz", "assignment", "exam"].includes(a.type))
      .map((a) => {
        const isGraded = scoredAssessmentIds.has(a._id)
        return {
          assessment: a,
          status: (isGraded ? "graded" : "not-submitted") as ActivityStatus,
          score: isGraded ? scoredMap[a._id] : null,
        }
      })
  }, [assessments, scoredAssessmentIds, scoredMap])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
        <FileQuestion className="size-8" />
        <p className="text-sm">No assessments yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 p-4">
      {items.map((item) => (
        <div
          key={item.assessment._id}
          className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">
                {item.assessment.title}
              </p>
              <Badge
                variant="outline"
                className={`shrink-0 text-[10px] font-normal ${
                  TYPE_ICONS[item.assessment.type] ?? ""
                }`}
              >
                {item.assessment.type}
              </Badge>
            </div>
            {item.score && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Score: {item.score.score} / {item.assessment.totalPoints}
                {item.score.feedback && ` — ${item.score.feedback}`}
              </p>
            )}
            {item.assessment.dueDate && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Due:{" "}
                {new Date(item.assessment.dueDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 ml-3 ${
              STATUS_BADGES[item.status].className
            }`}
          >
            {STATUS_BADGES[item.status].label}
          </Badge>
        </div>
      ))}
    </div>
  )
}
