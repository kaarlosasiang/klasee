"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  Loader2,
  AlertTriangle,
  FileText,
  GraduationCap,
  PenLine,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "sonner"
import {
  getAssessments,
  updateAssessment,
  deleteAssessment,
  type Assessment,
} from "@/lib/services/assessments"

const TYPE_ICONS: Record<string, React.ElementType> = {
  quiz: FileText,
  exam: GraduationCap,
  assignment: PenLine,
}

const TYPE_COLORS: Record<string, string> = {
  quiz: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  exam: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  assignment: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
}

interface AssessmentsManagerProps {
  courseId: string
}

export function AssessmentsManager({ courseId }: AssessmentsManagerProps) {
  const router = useRouter()
  const [assessments, setAssessments] = React.useState<Assessment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"quiz" | "exam" | "assignment">("quiz")
  const [totalPoints, setTotalPoints] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const fetchAssessments = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getAssessments(courseId)
      setAssessments(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  React.useEffect(() => {
    fetchAssessments()
  }, [fetchAssessments])

  function resetForm() {
    setTitle("")
    setType("quiz")
    setTotalPoints("")
    setDueDate("")
  }

  async function handleUpdate(assessment: Assessment) {
    if (!title.trim()) {
      toast.error("Assessment title is required")
      return
    }
    const points = Number(totalPoints)
    if (!totalPoints || points <= 0) {
      toast.error("Total points must be a positive number")
      return
    }
    setSubmitting(true)
    try {
      await updateAssessment(assessment._id, {
        title: title.trim(),
        type,
        totalPoints: points,
        dueDate: dueDate || undefined,
      })
      setEditingId(null)
      resetForm()
      toast.success("Assessment updated")
      fetchAssessments()
    } catch {
      toast.error("Failed to update assessment")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(assessment: Assessment) {
    try {
      await deleteAssessment(assessment._id)
      toast.success("Assessment deleted")
      fetchAssessments()
    } catch {
      toast.error("Failed to delete assessment")
    }
  }

  function startEdit(assessment: Assessment) {
    setEditingId(assessment._id)
    setTitle(assessment.title)
    setType(assessment.type)
    setTotalPoints(String(assessment.totalPoints))
    setDueDate(assessment.dueDate ?? "")
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-sm text-muted-foreground">Failed to load assessments</p>
        <Button variant="outline" size="sm" onClick={fetchAssessments}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/courses/${courseId}/assessments/new`)}
      >
        <Plus className="mr-2 size-4" />
        New Assessment
      </Button>

      {assessments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No assessments yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/courses/${courseId}/assessments/new`)}
          >
            <Plus className="mr-2 size-4" />
            Create your first assessment
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((assessment) => {
            const TypeIcon = TYPE_ICONS[assessment.type] ?? ClipboardList
            const isEditing = editingId === assessment._id

            return (
              <div
                key={assessment._id}
                className="rounded-xl border border-border bg-card transition-colors hover:bg-muted/20"
              >
                {isEditing ? (
                  <div className="p-4">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Assessment title"
                      className="mb-3 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
                    />
                    <div className="mb-3 grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Type</label>
                        <Select value={type} onValueChange={(v) => setType(v as "quiz" | "exam" | "assignment")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Total Points</label>
                        <Input
                          type="number"
                          min="1"
                          value={totalPoints}
                          onChange={(e) => setTotalPoints(e.target.value)}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={submitting}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleUpdate(assessment)} disabled={submitting}>
                        {submitting ? (
                          <><Loader2 className="mr-2 size-3 animate-spin" />Saving...</>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <TypeIcon className="size-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{assessment.title}</span>
                        <Badge
                          className={`rounded-full text-[10px] font-normal ${TYPE_COLORS[assessment.type] ?? ""}`}
                          variant="outline"
                        >
                          {assessment.type}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{assessment.totalPoints} pts</span>
                        {assessment.dueDate && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span>Due {formatDate(assessment.dueDate)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {(assessment.type === "quiz" || assessment.type === "exam") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/courses/${courseId}/assessments/${assessment._id}/questions`)
                          }
                        >
                          Questions
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/courses/${courseId}/assessments/${assessment._id}`)}
                      >
                        Grade
                      </Button>
                      <button
                        type="button"
                        onClick={() => startEdit(assessment)}
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogMedia>
                              <AlertTriangle className="size-5 text-destructive" />
                            </AlertDialogMedia>
                            <AlertDialogTitle>Delete assessment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{assessment.title}" and all
                              associated scores. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(assessment)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
