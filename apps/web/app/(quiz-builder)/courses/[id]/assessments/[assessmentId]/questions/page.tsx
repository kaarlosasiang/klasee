"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ListChecks, Loader2, Pencil, Check, X, Timer, Shuffle } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "sonner"
import {
  getAssessmentById,
  updateAssessment,
  type Assessment,
} from "@/lib/services/assessments"
import { QuizBuilder } from "@/components/quiz-builder"

const FILE_TYPE_OPTIONS = [
  { label: "PDF", value: "pdf" },
  { label: "Word", value: "doc" },
  { label: "Excel", value: "spreadsheet" },
  { label: "Presentation", value: "presentation" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
]

export default function QuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const assessmentId = params.assessmentId as string

  const [assessment, setAssessment] = React.useState<Assessment | null>(null)
  const [loading, setLoading] = React.useState(true)

  // Top-bar edit mode
  const [editing, setEditing] = React.useState(false)
  const [editTitle, setEditTitle] = React.useState("")
  const [editType, setEditType] = React.useState<"quiz" | "exam" | "assignment">("quiz")
  const [editPoints, setEditPoints] = React.useState("")
  const [editDueDate, setEditDueDate] = React.useState("")
  const [editTimeLimit, setEditTimeLimit] = React.useState("")
  const [editRandomize, setEditRandomize] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Assignment settings panel
  const [editInstructions, setEditInstructions] = React.useState("")
  const [editAllowedFileTypes, setEditAllowedFileTypes] = React.useState<string[]>([])
  const [editMaxFiles, setEditMaxFiles] = React.useState("")
  const [settingsSaving, setSettingsSaving] = React.useState(false)

  // Auto-total sync (quiz/exam)
  const [syncingTotal, setSyncingTotal] = React.useState(false)

  function handleTotalChange(total: number) {
    setAssessment((prev) => (prev ? { ...prev, totalPoints: total } : prev))
    setSyncingTotal(true)
    updateAssessment(assessmentId, { totalPoints: total })
      .catch(() => {})
      .finally(() => setSyncingTotal(false))
  }

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getAssessmentById(assessmentId)
        setAssessment(data)
        setEditTitle(data.title)
        setEditType(data.type)
        setEditPoints(String(data.totalPoints))
        setEditDueDate(data.dueDate ? (data.dueDate.split("T")[0] ?? "") : "")
        setEditTimeLimit(data.timeLimit ? String(data.timeLimit) : "")
        setEditRandomize(data.randomizeQuestions ?? false)
        setEditInstructions(data.instructions ?? "")
        setEditAllowedFileTypes(data.allowedFileTypes ?? [])
        setEditMaxFiles(data.maxFiles ? String(data.maxFiles) : "")
      } catch {
        setAssessment(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assessmentId])

  function startEdit() {
    if (!assessment) return
    setEditTitle(assessment.title)
    setEditType(assessment.type)
    setEditPoints(String(assessment.totalPoints))
    setEditDueDate(assessment.dueDate ? (assessment.dueDate.split("T")[0] ?? "") : "")
    setEditTimeLimit(assessment.timeLimit ? String(assessment.timeLimit) : "")
    setEditRandomize(assessment.randomizeQuestions ?? false)
    setEditing(true)
  }

  async function handleSaveMeta() {
    if (!assessment) return
    if (!editTitle.trim()) {
      toast.error("Title is required")
      return
    }
    const points = Number(editPoints) || 0
    setSaving(true)
    try {
      const updated = await updateAssessment(assessment._id, {
        title: editTitle.trim(),
        type: editType,
        totalPoints: points,
        dueDate: editDueDate || undefined,
        ...(editType === "exam" && {
          timeLimit: Number(editTimeLimit) || undefined,
          randomizeQuestions: editRandomize,
        }),
      })
      setAssessment(updated)
      setEditing(false)
      toast.success("Assessment updated")
    } catch {
      toast.error("Failed to update assessment")
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSettings() {
    if (!assessment) return
    setSettingsSaving(true)
    try {
      const updated = await updateAssessment(assessment._id, {
        instructions: editInstructions.trim() || undefined,
        allowedFileTypes: editAllowedFileTypes.length > 0 ? editAllowedFileTypes : [],
        maxFiles: Number(editMaxFiles) || undefined,
      })
      setAssessment(updated)
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSettingsSaving(false)
    }
  }

  function toggleFileType(value: string) {
    setEditAllowedFileTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    )
  }

  const isQuizOrExam = assessment?.type === "quiz" || assessment?.type === "exam"

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link
          href={`/courses/${courseId}?tab=assessments`}
          className="flex shrink-0 items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="h-5 w-px shrink-0 bg-border" />

        {loading ? (
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        ) : editing ? (
          <>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Assessment title"
              className="h-8 min-w-0 max-w-44 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0"
            />
            <Select
              value={editType}
              onValueChange={(v) => setEditType(v as "quiz" | "exam" | "assignment")}
            >
              <SelectTrigger className="h-8 w-28 shrink-0 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex shrink-0 items-center gap-1">
              <Input
                type="number"
                min="0"
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                placeholder="Pts"
                className="h-8 w-16 text-center text-xs"
              />
              <span className="text-xs text-muted-foreground">pts</span>
            </div>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="h-8 shrink-0 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {editType === "exam" && (
              <>
                <div className="h-4 w-px shrink-0 bg-border" />
                <div className="flex shrink-0 items-center gap-1.5">
                  <Timer className="size-3.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    value={editTimeLimit}
                    onChange={(e) => setEditTimeLimit(e.target.value)}
                    placeholder="—"
                    className="h-8 w-14 text-center text-xs"
                  />
                  <span className="text-xs text-muted-foreground">mins</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Shuffle className="size-3.5 text-muted-foreground" />
                  <Switch
                    checked={editRandomize}
                    onCheckedChange={setEditRandomize}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <span className="text-sm font-medium">{assessment?.title}</span>
            {assessment && (
              <span className="text-xs text-muted-foreground">
                {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)}
                {" · "}
                {assessment.totalPoints} pts
                {syncingTotal && " · syncing..."}
                {assessment.timeLimit && ` · ${assessment.timeLimit} min`}
                {assessment.randomizeQuestions && " · randomized"}
                {assessment.dueDate && (
                  <> · Due {new Date(assessment.dueDate).toLocaleDateString()}</>
                )}
              </span>
            )}
          </>
        )}

        <div className="flex-1" />

        {editing ? (
          <>
            <Button size="sm" onClick={handleSaveMeta} disabled={saving} className="h-8">
              {saving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              <span className="ml-1.5">Save</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="h-8"
            >
              <X className="size-3.5" />
              <span className="ml-1.5">Cancel</span>
            </Button>
          </>
        ) : (
          <>
            {!loading && (
              <Button variant="ghost" size="sm" onClick={startEdit} className="h-8">
                <Pencil className="size-3.5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/courses/${courseId}/assessments/${assessmentId}`)}
            >
              <ListChecks className="mr-2 size-4" />
              Grade
            </Button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : !assessment ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Assessment not found
          </div>
        ) : isQuizOrExam ? (
          <QuizBuilder
            assessmentId={assessmentId}
            onTotalChange={handleTotalChange}
            className="flex h-full overflow-hidden"
          />
        ) : (
          /* Assignment settings panel */
          <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-2xl space-y-8">
              {/* Instructions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <textarea
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="Enter instructions for students..."
                  rows={8}
                  className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Submission settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Submission Settings</h3>

                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-muted-foreground">Max files</span>
                  <Input
                    type="number"
                    min="1"
                    value={editMaxFiles}
                    onChange={(e) => setEditMaxFiles(e.target.value)}
                    placeholder="Unlimited"
                    className="h-8 w-28 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Allowed file types</span>
                    {editAllowedFileTypes.length === 0 && (
                      <span className="text-xs text-muted-foreground/60">— any type</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FILE_TYPE_OPTIONS.map((ft) => {
                      const selected = editAllowedFileTypes.includes(ft.value)
                      return (
                        <button
                          key={ft.value}
                          type="button"
                          onClick={() => toggleFileType(ft.value)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {ft.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={settingsSaving} size="sm">
                {settingsSaving ? (
                  <Loader2 className="mr-2 size-3 animate-spin" />
                ) : (
                  <Check className="mr-2 size-3.5" />
                )}
                Save Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
