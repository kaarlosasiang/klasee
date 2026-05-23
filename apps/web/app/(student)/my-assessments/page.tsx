"use client"

import * as React from "react"
import { ClipboardList, FileText, GraduationCap, PenLine, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useSession } from "@/lib/config/auth-client"
import { getEnrollmentsByStudent } from "@/lib/services/enrollments"
import { getAssessments, type Assessment } from "@/lib/services/assessments"
import Link from "next/link"

const TYPE_ICONS: Record<string, React.ElementType> = {
  quiz: FileText,
  exam: GraduationCap,
  assignment: PenLine,
}

const TYPE_BADGE: Record<string, string> = {
  quiz: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  exam: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  assignment: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
}

const TYPE_ICON_BG: Record<string, string> = {
  quiz: "bg-blue-500/10",
  exam: "bg-purple-500/10",
  assignment: "bg-amber-500/10",
}

interface AssessmentWithCourse extends Assessment {
  courseId: string
  courseName: string
  courseCode: string
}

function dueDateStatus(dueDate?: string): "overdue" | "upcoming" | "none" {
  if (!dueDate) return "none"
  const due = new Date(dueDate)
  const now = new Date()
  return due < now ? "overdue" : "upcoming"
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function AssessmentRow({ item }: { item: AssessmentWithCourse }) {
  const TypeIcon = TYPE_ICONS[item.type] ?? ClipboardList
  const status = dueDateStatus(item.dueDate)
  const href =
    item.type === "assignment"
      ? `/my-courses/${item.courseId}/assignments/${item._id}`
      : `/my-courses/${item.courseId}/quizzes/${item._id}`

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${TYPE_ICON_BG[item.type] ?? "bg-muted"}`}>
        <TypeIcon className={`size-5 ${TYPE_BADGE[item.type]?.split(" ")[1] ?? "text-muted-foreground"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{item.title}</span>
          <Badge
            variant="outline"
            className={`rounded-full text-[10px] font-normal ${TYPE_BADGE[item.type] ?? ""}`}
          >
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{item.courseName} · {item.courseCode}</span>
          <span>{item.totalPoints} pts</span>
          {item.dueDate && (
            <span className={`flex items-center gap-1 ${status === "overdue" ? "text-red-500" : ""}`}>
              {status === "overdue" ? (
                <AlertCircle className="size-3" />
              ) : (
                <Clock className="size-3" />
              )}
              {status === "overdue" ? "Overdue · " : "Due "}
              {formatDueDate(item.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-xs text-muted-foreground">
        View →
      </div>
    </Link>
  )
}

export default function MyAssessmentsPage() {
  const { data: session } = useSession()
  const [items, setItems] = React.useState<AssessmentWithCourse[]>([])
  const [loading, setLoading] = React.useState(true)

  const userId = session?.user?.id

  React.useEffect(() => {
    if (!userId) return

    async function load() {
      try {
        const enrollments = await getEnrollmentsByStudent(userId!)
        const active = enrollments.filter((e) => e.status === "active")

        const uniqueCourses = Array.from(
          new Map(active.map((e) => [e.courseId._id, e.courseId])).values()
        )

        const assessmentsByCourseParts = await Promise.all(
          uniqueCourses.map(async (course) => {
            const assessments: Assessment[] = await getAssessments(course._id).catch(() => [])
            return assessments
              .filter((a) => a.isPublished)
              .map((a) => ({
                ...a,
                courseId: course._id,
                courseName: course.name,
                courseCode: course.code,
              }))
          })
        )

        const all: AssessmentWithCourse[] = assessmentsByCourseParts.flat()
        all.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
        setItems(all)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const upcoming = items.filter((i) => dueDateStatus(i.dueDate) !== "overdue" || !i.dueDate)
  const overdue = items.filter((i) => dueDateStatus(i.dueDate) === "overdue")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Quizzes & Assignments</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <CheckCircle2 className="size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No assessments yet. Check your courses for new quizzes and assignments.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red-500">
                <AlertCircle className="size-4" />
                Overdue ({overdue.length})
              </h2>
              {overdue.map((item) => (
                <AssessmentRow key={item._id} item={item} />
              ))}
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Upcoming & Active ({upcoming.length})
              </h2>
              {upcoming.map((item) => (
                <AssessmentRow key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
