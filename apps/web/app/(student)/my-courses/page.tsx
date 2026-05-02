"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Hash,
  Layers,
  LogOut,
  Plus,
} from "lucide-react"
import { useSession } from "@/lib/config/auth-client"
import { apiClient } from "@/lib/config/api-client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "1st Semester",
  "2nd": "2nd Semester",
  summer: "Summer",
}

const COVER_GRADIENTS = [
  "from-blue-400 via-indigo-500 to-violet-600",
  "from-rose-400 via-pink-500 to-fuchsia-600",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-amber-400 via-orange-500 to-red-500",
  "from-violet-400 via-purple-500 to-indigo-600",
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface PopulatedCourse {
  _id: string
  name: string
  code: string
  cover?: string
  semester: string
}

interface PopulatedSection {
  _id: string
  name: string
  schedule?: string
  room?: string
}

interface EnrolledCourse {
  enrollmentId: string
  course: PopulatedCourse
  section: PopulatedSection
  status: "active" | "dropped" | "completed"
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useMyEnrollments(studentId: string | undefined) {
  const [enrollments, setEnrollments] = React.useState<EnrolledCourse[]>([])
  const [loading, setLoading] = React.useState(true)

  async function fetchAll() {
    if (!studentId) return
    setLoading(true)
    try {
      const res = await apiClient.get<
        {
          _id: string
          courseId: PopulatedCourse
          sectionId: PopulatedSection
          status: "active" | "dropped" | "completed"
        }[]
      >(`/enrollments?studentId=${studentId}`)
      setEnrollments(
        res.data
          .filter((e) => e.status === "active")
          .map((e) => ({
            enrollmentId: e._id,
            course: e.courseId,
            section: e.sectionId,
            status: e.status,
          }))
      )
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (studentId) {
      fetchAll()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  return { enrollments, loading, refetch: fetchAll }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-32 animate-pulse bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const studentId = session?.user?.id
  const { enrollments, loading, refetch } = useMyEnrollments(studentId)

  const [joinOpen, setJoinOpen] = React.useState(false)
  const [code, setCode] = React.useState("")
  const [joining, setJoining] = React.useState(false)
  const [dropping, setDropping] = React.useState<string | null>(null)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setJoining(true)
    try {
      await apiClient.post("/enrollments/join", { code: code.trim().toUpperCase() })
      toast.success("You've been enrolled!")
      setCode("")
      setJoinOpen(false)
      refetch()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Invalid code or enrollment failed."
      toast.error(msg)
    } finally {
      setJoining(false)
    }
  }

  async function handleDrop(enrollmentId: string, courseName: string) {
    setDropping(enrollmentId)
    try {
      await apiClient.delete(`/enrollments/${enrollmentId}`)
      toast.success(`Dropped from ${courseName}`)
      refetch()
    } catch {
      toast.error("Failed to drop. Please try again.")
    } finally {
      setDropping(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your enrolled courses. Use a code from your instructor to join a new one.
          </p>
        </div>
        <Button onClick={() => setJoinOpen(true)} className="border-0 border-b-4 border-l-3 border-blue-800 font-bold">
          <Plus className="size-4" />
          Join Course
        </Button>
      </div>

      {/* Join by code dialog */}
      <Dialog open={joinOpen} onOpenChange={(o) => { setJoinOpen(o); if (!o) setCode("") }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Hash className="size-5" />
            </div>
            <DialogTitle>Join a Course</DialogTitle>
            <DialogDescription>
              Enter the 6-character code provided by your instructor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoin} className="mt-2 flex flex-col gap-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="font-mono text-center text-xl tracking-[0.4em]"
              disabled={joining}
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={joining || code.trim().length < 6}>
              {joining ? "Joining…" : "Join Course"}
              {!joining && <ArrowRight className="size-4" />}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enrolled courses */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Enrolled Courses
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({enrollments.length})
            </span>
          </h2>
        </div>

        {loading || sessionPending ? (
          <Skeleton />
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <GraduationCap className="size-7 text-muted-foreground" />
            </div>
            <p className="mt-4 font-semibold text-foreground">No courses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask your instructor for a join code to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map(({ enrollmentId, course, section }, idx) => (
              <div
                key={enrollmentId}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
              >
                {/* Cover */}
                <Link href={`/my-courses/${course._id}`} className="relative block h-32 w-full overflow-hidden">
                  {course.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.cover}
                      alt={course.name}
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={cn(
                        "absolute inset-0 bg-linear-to-br",
                        COVER_GRADIENTS[idx % COVER_GRADIENTS.length]
                      )}
                    />
                  )}
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white shadow">
                    <CheckCircle2 className="size-3" />
                    Enrolled
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-col gap-3 p-5">
                  <div>
                    <Link
                      href={`/my-courses/${course._id}`}
                      className="line-clamp-2 font-semibold leading-snug text-foreground hover:underline"
                    >
                      {course.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span className="font-mono">{course.code}</span>
                      <span className="text-border">·</span>
                      <span>{SEMESTER_LABELS[course.semester] ?? course.semester}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3" />
                      {section.name}
                    </span>
                    {section.schedule && (
                      <>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {section.schedule}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/my-courses/${course._id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        <BookOpen className="size-3.5" />
                        View Course
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                      disabled={dropping === enrollmentId}
                      onClick={() => handleDrop(enrollmentId, course.name)}
                    >
                      {dropping === enrollmentId ? "…" : <LogOut className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
