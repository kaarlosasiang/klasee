"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  MapPin,
  Users,
} from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { useCourse } from "@/hooks/use-course"
import { apiClient } from "@/lib/config/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "First Semester",
  "2nd": "Second Semester",
  summer: "Summer",
}

const ASSESSMENT_TYPE_LABELS: Record<string, string> = {
  quiz: "Quiz",
  exam: "Exam",
  assignment: "Assignment",
}

const ASSESSMENT_TYPE_COLORS: Record<string, string> = {
  quiz: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  exam: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  assignment: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

type Tab = "sections" | "assessments"

// ─── Syllabus Viewer Dialog ───────────────────────────────────────────────────

function SyllabusViewerDialog({
  url,
  open,
  onOpenChange,
}: {
  url: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  // Cloudinary raw uploads are served with Content-Disposition: attachment, so
  // direct iframe embedding always triggers a download. Default to Google Docs
  // viewer which proxies the file and renders it inline.
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92dvh] w-[92vw] max-w-[92vw] flex-col gap-0 p-0 sm:max-w-[92vw] lg:max-w-6xl">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border px-5 py-3">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-primary" />
            Course Syllabus
          </DialogTitle>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Download className="size-3" />
              Download
            </a>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="size-3" />
              Open
            </a>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden bg-muted/30">
          <iframe
            src={googleViewerUrl}
            className="size-full border-0"
            title="Course Syllabus"
            allow="fullscreen"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentCoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const studentId = session?.user?.id

  const { course, sections, assessments, loading, error } = useCourse(id)
  const [activeTab, setActiveTab] = React.useState<Tab>("sections")
  const [syllabusOpen, setSyllabusOpen] = React.useState(false)

  // My enrollment for this course
  const [enrolledSectionId, setEnrolledSectionId] = React.useState<string | null>(null)
  // Map of assessmentId → { score, feedback }
  const [scoreMap, setScoreMap] = React.useState<
    Record<string, { score: number; feedback?: string }>
  >({})

  React.useEffect(() => {
    if (!studentId) return
    async function fetchStudentData() {
      try {
        const [enrollRes, scoresRes] = await Promise.all([
          apiClient.get<
            { _id: string; sectionId: string | { _id: string }; courseId: string | { _id: string }; status: string }[]
          >(`/enrollments?studentId=${studentId}`),
          apiClient.get<{ assessmentId: string; score: number; feedback?: string }[]>(
            `/assessments/scores?studentId=${studentId}`
          ),
        ])

        // Find the active enrollment for this specific course
        const activeForCourse = enrollRes.data.find((e) => {
          if (e.status !== "active") return false
          const cId = typeof e.courseId === "string" ? e.courseId : (e.courseId as { _id: string })._id
          return cId === id
        })
        if (activeForCourse) {
          const sid =
            typeof activeForCourse.sectionId === "string"
              ? activeForCourse.sectionId
              : (activeForCourse.sectionId as { _id: string })._id
          setEnrolledSectionId(sid)
        }

        // Build score lookup
        const map: Record<string, { score: number; feedback?: string }> = {}
        for (const s of scoresRes.data) {
          map[s.assessmentId] = { score: s.score, feedback: s.feedback }
        }
        setScoreMap(map)
      } catch {
        // non-critical — continue showing course without personal data
      }
    }
    fetchStudentData()
  }, [studentId, id])

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-5 w-52 animate-pulse rounded-md bg-muted" />
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <GraduationCap className="size-7 text-muted-foreground" />
        </div>
        <p className="mt-4 font-semibold">Course not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error ?? "This course doesn't exist or you don't have access."}
        </p>
        <Button className="mt-5" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
          Go back
        </Button>
      </div>
    )
  }

  const syllabus = (course as typeof course & { syllabus?: string }).syllabus
  const totalCapacity = sections.reduce((sum, s) => sum + s.maxStudents, 0)

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href="/my-courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Course Catalog
      </Link>

      {/* ── Hero card ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Cover */}
        <div className="relative h-40 w-full sm:h-48">
          {course.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.cover}
              alt={`${course.name} cover`}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-indigo-500 to-violet-600" />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -right-8 -top-8 size-40 rounded-full border-24 border-white" />
                <div className="absolute -bottom-10 -left-6 size-32 rounded-full border-16 border-white" />
                <div className="absolute bottom-12 right-8 size-20 rounded-full border-12 border-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <GraduationCap className="size-10 text-white" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-6">
          {/* Top row: enrollment status + syllabus */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {enrolledSectionId ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Enrolled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                  Not enrolled
                </span>
              )}
            </div>
            {syllabus && (
              <button
                type="button"
                onClick={() => setSyllabusOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FileText className="size-3.5" />
                View Syllabus
              </button>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.name}</h1>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              {course.code}
            </span>
            <span className="rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
              {SEMESTER_LABELS[course.semester] ?? course.semester}
            </span>
          </div>

          {/* Description */}
          {course.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
              Course
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Layers className="size-3.5" />
              {sections.length} section{sections.length !== 1 ? "s" : ""}
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Since{" "}
              {new Date(course.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-8 border-t border-border pt-5">
            {[
              { label: "Sections", value: sections.length },
              { label: "Assessments", value: assessments.length },
              { label: "Max Students", value: totalCapacity },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1">
          {(["sections", "assessments"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                activeTab === tab
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  activeTab === tab
                    ? "bg-foreground/10 text-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab === "sections" ? sections.length : assessments.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sections tab ── */}
      {activeTab === "sections" && (
        sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Layers className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 font-medium">No sections yet</p>
            <p className="mt-1 text-sm text-muted-foreground">This course doesn't have sections yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sections.map((section, idx) => {
              const isMySection = section._id === enrolledSectionId
              return (
                <li
                  key={section._id}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border bg-card px-5 py-4 transition-colors",
                    isMySection
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30"
                      : "border-border hover:bg-muted/30"
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      isMySection
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                    )}
                  >
                    <Layers className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{section.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      {section.schedule && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {section.schedule}
                        </span>
                      )}
                      {section.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {section.room}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        Max {section.maxStudents} students
                      </span>
                    </div>
                  </div>
                  {isMySection && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      <CheckCircle2 className="size-3" />
                      My Section
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )
      )}

      {/* ── Assessments tab ── */}
      {activeTab === "assessments" && (
        assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <ClipboardList className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 font-medium">No assessments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">No quizzes, exams, or assignments have been added.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {assessments.map((assessment, idx) => {
              const result = scoreMap[assessment._id]
              const isGraded = result !== undefined
              const pct = isGraded ? Math.round((result.score / assessment.totalPoints) * 100) : null
              const isOverdue =
                !isGraded &&
                assessment.dueDate &&
                new Date(assessment.dueDate) < new Date()

              return (
                <li
                  key={assessment._id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium",
                      ASSESSMENT_TYPE_COLORS[assessment.type]
                    )}
                  >
                    {ASSESSMENT_TYPE_LABELS[assessment.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{assessment.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      <span>{assessment.totalPoints} pts</span>
                      {assessment.dueDate && (
                        <>
                          <span className="text-border">·</span>
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isOverdue && "text-red-500"
                            )}
                          >
                            <CalendarDays className="size-3" />
                            Due{" "}
                            {new Date(assessment.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score badge */}
                  {isGraded ? (
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          pct! >= 75
                            ? "text-emerald-600 dark:text-emerald-400"
                            : pct! >= 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {result.score}/{assessment.totalPoints}
                      </p>
                      <p className="text-xs text-muted-foreground">{pct}%</p>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        isOverdue
                          ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isOverdue ? "Overdue" : "Pending"}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )
      )}

      {/* ── Syllabus viewer ── */}
      {syllabus && (
        <SyllabusViewerDialog
          url={syllabus}
          open={syllabusOpen}
          onOpenChange={setSyllabusOpen}
        />
      )}
    </div>
  )
}
