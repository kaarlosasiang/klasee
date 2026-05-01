"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Layers,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { useCourse, type Section, type Assessment } from "@/hooks/use-course"
import { useBreadcrumbLabel } from "@/lib/contexts/breadcrumb-context"
import { apiClient } from "@/lib/config/api-client"
import { NewCourseDialog } from "@/components/common/new-course-dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  deleting,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  deleting: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Section Dialog (Add / Edit) ───────────────────────────────────────────────

function SectionDialog({
  courseId,
  section,
  open,
  onOpenChange,
  onSaved,
}: {
  courseId: string
  section?: Section
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const isEdit = !!section
  const [name, setName] = React.useState(section?.name ?? "")
  const [schedule, setSchedule] = React.useState(section?.schedule ?? "")
  const [room, setRoom] = React.useState(section?.room ?? "")
  const [maxStudents, setMaxStudents] = React.useState(section?.maxStudents ?? 40)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(section?.name ?? "")
      setSchedule(section?.schedule ?? "")
      setRoom(section?.room ?? "")
      setMaxStudents(section?.maxStudents ?? 40)
      setError(null)
    }
  }, [open, section])

  async function handleSave() {
    if (!name.trim()) { setError("Section name is required."); return }
    setSaving(true); setError(null)
    try {
      if (isEdit) {
        await apiClient.put(`/sections/${section!._id}`, { name, schedule, room, maxStudents })
      } else {
        await apiClient.post("/sections", { courseId, name, schedule, room, maxStudents })
      }
      onSaved(); onOpenChange(false)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Section" : "Add Section"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Section Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Section A" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Schedule</label>
              <Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g. MWF 8–9 AM" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Room</label>
              <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Room 101" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Max Students</label>
            <Input type="number" min={1} value={maxStudents} onChange={(e) => setMaxStudents(Math.max(1, Number(e.target.value)))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assessment Dialog (Add / Edit) ────────────────────────────────────────────

function AssessmentDialog({
  courseId,
  assessment,
  open,
  onOpenChange,
  onSaved,
}: {
  courseId: string
  assessment?: Assessment
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
}) {
  const isEdit = !!assessment
  const [title, setTitle] = React.useState(assessment?.title ?? "")
  const [type, setType] = React.useState<"quiz" | "exam" | "assignment">(assessment?.type ?? "quiz")
  const [totalPoints, setTotalPoints] = React.useState(assessment?.totalPoints ?? 100)
  const [dueDate, setDueDate] = React.useState(assessment?.dueDate?.slice(0, 10) ?? "")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setTitle(assessment?.title ?? "")
      setType(assessment?.type ?? "quiz")
      setTotalPoints(assessment?.totalPoints ?? 100)
      setDueDate(assessment?.dueDate?.slice(0, 10) ?? "")
      setError(null)
    }
  }, [open, assessment])

  async function handleSave() {
    if (!title.trim()) { setError("Title is required."); return }
    setSaving(true); setError(null)
    try {
      const payload = { courseId, title, type, totalPoints, dueDate: dueDate || undefined }
      if (isEdit) {
        await apiClient.put(`/assessments/${assessment!._id}`, payload)
      } else {
        await apiClient.post("/assessments", payload)
      }
      onSaved(); onOpenChange(false)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Assessment" : "Add Assessment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Exam" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Total Points</label>
              <Input type="number" min={1} value={totalPoints} onChange={(e) => setTotalPoints(Math.max(1, Number(e.target.value)))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Due Date (optional)</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = "sections" | "assessments"

export default function CoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { course, sections, assessments, loading, error, refetch } = useCourse(id)
  const [activeTab, setActiveTab] = React.useState<Tab>("sections")
  const { setLeafLabel } = useBreadcrumbLabel()

  // Course-level dialogs
  const [editCourseOpen, setEditCourseOpen] = React.useState(false)
  const [deleteCourseOpen, setDeleteCourseOpen] = React.useState(false)
  const [deletingCourse, setDeletingCourse] = React.useState(false)

  // Section dialogs
  const [addSectionOpen, setAddSectionOpen] = React.useState(false)
  const [editSection, setEditSection] = React.useState<Section | null>(null)
  const [deleteSection, setDeleteSection] = React.useState<Section | null>(null)
  const [deletingSection, setDeletingSection] = React.useState(false)

  // Assessment dialogs
  const [addAssessmentOpen, setAddAssessmentOpen] = React.useState(false)
  const [editAssessment, setEditAssessment] = React.useState<Assessment | null>(null)
  const [deleteAssessment, setDeleteAssessment] = React.useState<Assessment | null>(null)
  const [deletingAssessment, setDeletingAssessment] = React.useState(false)

  React.useEffect(() => {
    if (course) setLeafLabel(course.name, `/courses/${id}`)
  }, [course, id])

  async function handleDeleteCourse() {
    setDeletingCourse(true)
    try {
      await apiClient.delete(`/courses/${id}`)
      router.push("/courses")
    } catch {
      setDeletingCourse(false)
    }
  }

  async function handleDeleteSection() {
    if (!deleteSection) return
    setDeletingSection(true)
    try {
      await apiClient.delete(`/sections/${deleteSection._id}`)
      setDeleteSection(null)
      refetch()
    } catch {
      // keep dialog open
    } finally {
      setDeletingSection(false)
    }
  }

  async function handleDeleteAssessment() {
    if (!deleteAssessment) return
    setDeletingAssessment(true)
    try {
      await apiClient.delete(`/assessments/${deleteAssessment._id}`)
      setDeleteAssessment(null)
      refetch()
    } catch {
      // keep dialog open
    } finally {
      setDeletingAssessment(false)
    }
  }

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

  const totalCapacity = sections.reduce((sum, s) => sum + s.maxStudents, 0)

  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Top: cover image or decorative banner */}
        <div className="relative h-40 w-full sm:h-48">
          {course.cover ? (
            <img
              src={course.cover}
              alt={`${course.name} cover`}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-linear-to-br from-blue-400 via-indigo-500 to-violet-600" />
              {/* Geometric decoration */}
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

        {/* Bottom: info */}
        <div className="flex flex-col p-6">
          {/* Semester badge + actions */}
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditCourseOpen(true)}>
                  <Pencil className="size-4" />
                  Edit Course
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteCourseOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.name}</h1>

          {/* Pill tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-md border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              {course.code}
            </span>
            <span className="rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
              {SEMESTER_LABELS[course.semester] ?? course.semester}
            </span>
          </div>

          {/* Meta row */}
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
              Started{" "}
              {new Date(course.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Stats row */}
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

      {/* Tabs */}
      <div>
        <div className="flex items-center justify-between border-b border-border">
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
          {activeTab === "sections" ? (
            <Button size="sm" variant="outline" onClick={() => setAddSectionOpen(true)}>
              <Plus className="size-3.5" />
              Add Section
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAddAssessmentOpen(true)}>
              <Plus className="size-3.5" />
              Add Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "sections" ? (
        sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Layers className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 font-medium">No sections yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a section to get students enrolled.</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setAddSectionOpen(true)}>
              <Plus className="size-3.5" />
              Add Section
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {sections.map((section, idx) => (
              <li
                key={section._id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditSection(section)}>
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteSection(section)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )
      ) : assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <ClipboardList className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 font-medium">No assessments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create a quiz, exam, or assignment for this course.</p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => setAddAssessmentOpen(true)}>
            <Plus className="size-3.5" />
            Add Assessment
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {assessments.map((assessment, idx) => (
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
                      <span className="flex items-center gap-1">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditAssessment(assessment)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteAssessment(assessment)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      {/* ── Dialogs ── */}
      {course && (
        <NewCourseDialog
          course={course}
          open={editCourseOpen}
          onOpenChange={(o) => {
            setEditCourseOpen(o)
            if (!o) refetch()
          }}
        />
      )}

      <DeleteConfirmDialog
        open={deleteCourseOpen}
        onOpenChange={setDeleteCourseOpen}
        title="Delete Course"
        description="This will permanently delete the course and cannot be undone. All associated sections and assessments will remain but become orphaned."
        onConfirm={handleDeleteCourse}
        deleting={deletingCourse}
      />

      <SectionDialog
        courseId={id}
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
        onSaved={refetch}
      />

      <SectionDialog
        courseId={id}
        section={editSection ?? undefined}
        open={!!editSection}
        onOpenChange={(o) => { if (!o) setEditSection(null) }}
        onSaved={refetch}
      />

      <DeleteConfirmDialog
        open={!!deleteSection}
        onOpenChange={(o) => { if (!o) setDeleteSection(null) }}
        title="Delete Section"
        description={`Delete "${deleteSection?.name}"? Students enrolled in this section will be affected.`}
        onConfirm={handleDeleteSection}
        deleting={deletingSection}
      />

      <AssessmentDialog
        courseId={id}
        open={addAssessmentOpen}
        onOpenChange={setAddAssessmentOpen}
        onSaved={refetch}
      />

      <AssessmentDialog
        courseId={id}
        assessment={editAssessment ?? undefined}
        open={!!editAssessment}
        onOpenChange={(o) => { if (!o) setEditAssessment(null) }}
        onSaved={refetch}
      />

      <DeleteConfirmDialog
        open={!!deleteAssessment}
        onOpenChange={(o) => { if (!o) setDeleteAssessment(null) }}
        title="Delete Assessment"
        description={`Delete "${deleteAssessment?.title}"? This cannot be undone.`}
        onConfirm={handleDeleteAssessment}
        deleting={deletingAssessment}
      />
    </div>
  )
}
