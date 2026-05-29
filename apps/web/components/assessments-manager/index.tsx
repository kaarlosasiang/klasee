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
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { toast } from "sonner"
import {
  getAssessments,
  updateAssessment,
  deleteAssessment,
  type Assessment,
  type LatePolicy,
} from "@/lib/services/assessments"
import {
  getOverrides,
  upsertOverride,
  deleteOverride,
  type DueDateOverride,
} from "@/lib/services/due-date-overrides"
import { getSectionsByCourse, type Section } from "@/lib/services/sections"
import { getEnrollmentsByCourse, type Enrollment } from "@/lib/services/enrollments"

const TYPE_ICONS: Record<string, React.ElementType> = {
  quiz: FileText,
  exam: GraduationCap,
  assignment: PenLine,
}

const TYPE_BADGE_COLOR: Record<string, string> = {
  quiz: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  exam: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  assignment: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
}

const TYPE_ICON_BG: Record<string, string> = {
  quiz: "bg-blue-500/10",
  exam: "bg-purple-500/10",
  assignment: "bg-amber-500/10",
}

const TYPE_ICON_COLOR: Record<string, string> = {
  quiz: "text-blue-600 dark:text-blue-400",
  exam: "text-purple-600 dark:text-purple-400",
  assignment: "text-amber-600 dark:text-amber-400",
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
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"quiz" | "exam" | "assignment">("quiz")
  const [totalPoints, setTotalPoints] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [latePolicyEnabled, setLatePolicyEnabled] = React.useState(false)
  const [deductionType, setDeductionType] = React.useState<"percent" | "flat">("percent")
  const [deductionPerDay, setDeductionPerDay] = React.useState("")
  const [maxDeduction, setMaxDeduction] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  // Due date overrides state
  const [overrides, setOverrides] = React.useState<DueDateOverride[]>([])
  const [sections, setSections] = React.useState<Section[]>([])
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([])
  const [overrideType, setOverrideType] = React.useState<"section" | "student">("section")
  const [overrideTargetId, setOverrideTargetId] = React.useState("")
  const [overrideDueDate, setOverrideDueDate] = React.useState("")
  const [addingOverride, setAddingOverride] = React.useState(false)
  const [overrideSaving, setOverrideSaving] = React.useState(false)

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
    setLatePolicyEnabled(false)
    setDeductionType("percent")
    setDeductionPerDay("")
    setMaxDeduction("")
  }

  function buildLatePolicy(): LatePolicy | undefined {
    if (!latePolicyEnabled) return undefined
    return {
      enabled: true,
      deductionType,
      deductionPerDay: Number(deductionPerDay) || 0,
      maxDeduction: Number(maxDeduction) || 100,
    }
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
        latePolicy: buildLatePolicy(),
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

  async function handleDelete(id: string) {
    try {
      await deleteAssessment(id)
      toast.success("Assessment deleted")
      fetchAssessments()
    } catch {
      toast.error("Failed to delete assessment")
    } finally {
      setDeleteTarget(null)
    }
  }

  async function handleTogglePublish(assessment: Assessment) {
    try {
      const updated = await updateAssessment(assessment._id, {
        isPublished: !assessment.isPublished,
      })
      setAssessments((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a))
      )
      toast.success(
        updated.isPublished ? "Assessment published" : "Assessment set to draft"
      )
    } catch {
      toast.error("Failed to update assessment")
    }
  }

  function startEdit(assessment: Assessment) {
    setEditingId(assessment._id)
    setTitle(assessment.title)
    setType(assessment.type)
    setTotalPoints(String(assessment.totalPoints))
    setDueDate(assessment.dueDate ?? "")
    setLatePolicyEnabled(assessment.latePolicy?.enabled ?? false)
    setDeductionType(assessment.latePolicy?.deductionType ?? "percent")
    setDeductionPerDay(String(assessment.latePolicy?.deductionPerDay ?? ""))
    setMaxDeduction(String(assessment.latePolicy?.maxDeduction ?? ""))
    setAddingOverride(false)
    setOverrideType("section")
    setOverrideTargetId("")
    setOverrideDueDate("")

    Promise.all([
      getOverrides(assessment._id),
      getSectionsByCourse(courseId),
      getEnrollmentsByCourse(courseId),
    ]).then(([ovrs, secs, enrs]) => {
      setOverrides(ovrs)
      setSections(secs)
      setEnrollments(enrs)
    }).catch(() => {})
  }

  async function handleAddOverride(assessmentId: string) {
    if (!overrideTargetId || !overrideDueDate) {
      toast.error("Select a target and due date")
      return
    }
    setOverrideSaving(true)
    try {
      await upsertOverride({ assessmentId, type: overrideType, targetId: overrideTargetId, dueDate: overrideDueDate })
      const updated = await getOverrides(assessmentId)
      setOverrides(updated)
      setAddingOverride(false)
      setOverrideTargetId("")
      setOverrideDueDate("")
      toast.success("Override saved")
    } catch {
      toast.error("Failed to save override")
    } finally {
      setOverrideSaving(false)
    }
  }

  async function handleDeleteOverride(id: string, assessmentId: string) {
    try {
      await deleteOverride(id)
      setOverrides((prev) => prev.filter((o) => o._id !== id))
      toast.success("Override removed")
    } catch {
      toast.error("Failed to remove override")
    }
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

  const deleteTargetAssessment = assessments.find((a) => a._id === deleteTarget)

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
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {assessments.length} assessment{assessments.length !== 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            onClick={() => router.push(`/courses/${courseId}/assessments/new`)}
          >
            <Plus className="mr-2 size-4" />
            New Assessment
          </Button>
        </div>

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
                          <Label className="text-xs font-medium text-muted-foreground">
                            Type
                          </Label>
                          <Select
                            value={type}
                            onValueChange={(v) => setType(v as "quiz" | "exam" | "assignment")}
                          >
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
                          <Label className="text-xs font-medium text-muted-foreground">
                            Total Points
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={totalPoints}
                            onChange={(e) => setTotalPoints(e.target.value)}
                            placeholder="100"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Due Date
                          </Label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                      {/* Late policy */}
                      <div className="mt-3 border-t border-border pt-3">
                        <label className="flex cursor-pointer items-center gap-2">
                          <Checkbox
                            checked={latePolicyEnabled}
                            onCheckedChange={(v) => setLatePolicyEnabled(!!v)}
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            Deduct points for late submissions
                          </span>
                        </label>
                        {latePolicyEnabled && (
                          <div className="mt-2 grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Type</Label>
                              <Select
                                value={deductionType}
                                onValueChange={(v) => setDeductionType(v as "percent" | "flat")}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percent">% per day</SelectItem>
                                  <SelectItem value="flat">pts per day</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Per day
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                value={deductionPerDay}
                                onChange={(e) => setDeductionPerDay(e.target.value)}
                                placeholder="0"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Max {deductionType === "percent" ? "%" : "pts"}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                value={maxDeduction}
                                onChange={(e) => setMaxDeduction(e.target.value)}
                                placeholder={deductionType === "percent" ? "100" : "—"}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Due date overrides */}
                      <div className="mt-3 border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-muted-foreground">Due date overrides</p>
                          <button
                            type="button"
                            onClick={() => setAddingOverride((v) => !v)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Plus className="size-3" />
                            Add
                          </button>
                        </div>

                        {overrides.length === 0 && !addingOverride && (
                          <p className="mt-1.5 text-[10px] text-muted-foreground">
                            No overrides — everyone uses the default due date
                          </p>
                        )}

                        {overrides.length > 0 && (
                          <div className="mt-2 space-y-1.5">
                            {overrides.map((o) => {
                              const targetName = o.type === "section"
                                ? (sections.find((s) => s._id === o.targetId)?.name ?? o.targetId)
                                : (enrollments.find((e) => e.studentId._id === o.targetId)?.studentId.name ?? o.targetId)
                              return (
                                <div key={o._id} className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5 text-xs">
                                  <span>
                                    <span className="font-medium">{targetName}</span>
                                    <span className="mx-1.5 text-muted-foreground">→</span>
                                    {new Date(o.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOverride(o._id, assessment._id)}
                                    className="ml-2 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {addingOverride && (
                          <div className="mt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Select value={overrideType} onValueChange={(v) => { setOverrideType(v as "section" | "student"); setOverrideTargetId("") }}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="section">Section</SelectItem>
                                  <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select value={overrideTargetId} onValueChange={setOverrideTargetId}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue placeholder="Pick target" />
                                </SelectTrigger>
                                <SelectContent>
                                  {overrideType === "section"
                                    ? sections.map((s) => (
                                        <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                      ))
                                    : enrollments
                                        .filter((e) => e.status === "active")
                                        .map((e) => (
                                          <SelectItem key={e.studentId._id} value={e.studentId._id}>
                                            {e.studentId.name}
                                          </SelectItem>
                                        ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={overrideDueDate}
                                onChange={(e) => setOverrideDueDate(e.target.value)}
                                className="h-7 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              />
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleAddOverride(assessment._id)} disabled={overrideSaving}>
                                {overrideSaving ? <Loader2 className="size-3 animate-spin" /> : "Save"}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAddingOverride(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(assessment)}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 size-3 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4">
                      {/* Type icon */}
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${TYPE_ICON_BG[assessment.type] ?? "bg-muted"}`}
                      >
                        <TypeIcon
                          className={`size-4 ${TYPE_ICON_COLOR[assessment.type] ?? "text-muted-foreground"}`}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{assessment.title}</span>
                          <Badge
                            className={`rounded-full text-[10px] font-normal ${TYPE_BADGE_COLOR[assessment.type] ?? ""}`}
                            variant="outline"
                          >
                            {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[10px] font-normal ${
                              assessment.isPublished
                                ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {assessment.isPublished ? "Published" : "Draft"}
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

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        {/* Primary CTA */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/courses/${courseId}/assessments/${assessment._id}/questions`
                                )
                              }
                            >
                              {assessment.type === "assignment" ? "Configure" : "Questions"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {assessment.type === "assignment"
                              ? "Edit instructions & settings"
                              : "Edit questions"}
                          </TooltipContent>
                        </Tooltip>

                        {/* Grade */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/courses/${courseId}/assessments/${assessment._id}`
                            )
                          }
                        >
                          Grade
                        </Button>

                        {/* Secondary actions */}
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>More options</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleTogglePublish(assessment)}>
                              {assessment.isPublished ? (
                                <>
                                  <EyeOff className="mr-2 size-3.5" />
                                  Set to draft
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 size-3.5" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startEdit(assessment)}>
                              <Pencil className="mr-2 size-3.5" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(assessment._id)}
                            >
                              <Trash2 className="mr-2 size-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertTriangle className="size-5 text-destructive" />
              <AlertDialogTitle>Delete assessment?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{deleteTargetAssessment?.title}&quot; and all
                associated scores. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteTarget && handleDelete(deleteTarget)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
