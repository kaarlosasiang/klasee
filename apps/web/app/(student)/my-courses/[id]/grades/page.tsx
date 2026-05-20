"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  PenLine,
  CheckCircle2,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getCourseById, type Course } from "@/lib/services/courses"
import {
  getAssessments,
  type Assessment,
} from "@/lib/services/assessments"
import { getMyQuizAttempts, type QuizAttempt } from "@/lib/services/quiz-attempts"
import {
  getMyAssignmentSubmission,
  type AssignmentSubmission,
} from "@/lib/services/assignment-submissions"

interface AssessmentGrade {
  assessment: Assessment
  score?: number
  totalPoints: number
  status: "not_submitted" | "submitted" | "graded"
  label: string
}

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

export default function StudentGradesPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = React.useState<Course | null>(null)
  const [grades, setGrades] = React.useState<AssessmentGrade[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [courseData, assessments] = await Promise.all([
          getCourseById(courseId),
          getAssessments(courseId),
        ])
        setCourse(courseData)

        const gradePromises = assessments.map(async (assessment: Assessment) => {
          if (assessment.type === "quiz" || assessment.type === "exam") {
            try {
              const attempts: QuizAttempt[] = await getMyQuizAttempts(assessment._id)
              const completed = attempts.find((a) => a.status === "completed")
              if (completed) {
                return {
                  assessment,
                  score: completed.totalPointsEarned,
                  totalPoints: completed.totalPointsPossible,
                  status: "graded" as const,
                  label: `${completed.totalPointsEarned}/${completed.totalPointsPossible}`,
                }
              }
              const inProgress = attempts.find((a) => a.status === "in_progress")
              if (inProgress) {
                return {
                  assessment,
                  totalPoints: assessment.totalPoints,
                  status: "submitted" as const,
                  label: "In Progress",
                }
              }
            } catch {
              // ignore
            }
            return {
              assessment,
              totalPoints: assessment.totalPoints,
              status: "not_submitted" as const,
              label: "Not Taken",
            }
          }

          if (assessment.type === "assignment") {
            try {
              const submission: AssignmentSubmission = await getMyAssignmentSubmission(assessment._id)
              if (submission.grade !== undefined && submission.grade !== null) {
                return {
                  assessment,
                  score: submission.grade,
                  totalPoints: assessment.totalPoints,
                  status: "graded" as const,
                  label: `${submission.grade}/${assessment.totalPoints}`,
                }
              }
              return {
                assessment,
                totalPoints: assessment.totalPoints,
                status: "submitted" as const,
                label: "Submitted",
              }
            } catch {
              return {
                assessment,
                totalPoints: assessment.totalPoints,
                status: "not_submitted" as const,
                label: "Not Submitted",
              }
            }
          }

          return {
            assessment,
            totalPoints: assessment.totalPoints,
            status: "not_submitted" as const,
            label: "\u2014",
          }
        })

        const results = await Promise.all(gradePromises)
        setGrades(results)
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

  const scored = grades.filter((g) => g.score !== undefined)
  const totalEarned = scored.reduce((sum, g) => sum + (g.score ?? 0), 0)
  const totalPossible = grades.reduce((sum, g) => sum + g.totalPoints, 0)

  return (
    <div className="space-y-6">
      <Link
        href={`/my-courses/${courseId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <h1 className="text-xl font-bold">
          {course?.name ?? "Course"} — Grades
        </h1>
        {scored.length > 0 && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {totalEarned}/{totalPossible}
            </span>
            <span className="text-sm text-muted-foreground">
              ({totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0}%)
            </span>
          </div>
        )}
      </div>

      <Card>
        <div className="divide-y divide-border">
          {grades.map((grade) => {
            const Icon = assessmentIcon(grade.assessment.type)
            return (
              <div
                key={grade.assessment._id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${assessmentColor(grade.assessment.type)}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{grade.assessment.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {grade.assessment.type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{grade.label}</p>
                  <Badge
                    variant={
                      grade.status === "graded"
                        ? "default"
                        : grade.status === "submitted"
                          ? "secondary"
                          : "outline"
                    }
                    className="mt-0.5 rounded-full text-[10px] font-normal"
                  >
                    {grade.status === "graded"
                      ? "Graded"
                      : grade.status === "submitted"
                        ? "Submitted"
                        : "Pending"}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
        {grades.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12">
            <HelpCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No assessments found</p>
          </div>
        )}
      </Card>
    </div>
  )
}
