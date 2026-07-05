"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  Clock,
  Layers,
  Loader2,
  RotateCcw,
  Shuffle,
  SkipForward,
  Tag,
  Eye,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Separator } from "@workspace/ui/components/separator"
import { Switch } from "@workspace/ui/components/switch"
import { createAssessment } from "@/lib/services/assessments"
import { getAssignmentGroups, type AssignmentGroup } from "@/lib/services/assignment-groups"

const MAX_INSTRUCTIONS = 800

interface SettingRowProps {
  icon: React.ElementType
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}

function SettingRow({ icon: Icon, label, description, checked, onCheckedChange }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="shrink-0" />
    </div>
  )
}

interface NewQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

export function NewQuizDialog({ open, onOpenChange, courseId }: NewQuizDialogProps) {
  const router = useRouter()

  const [title, setTitle] = React.useState("")
  const [titleError, setTitleError] = React.useState("")
  const [tagInput, setTagInput] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [estimatedDuration, setEstimatedDuration] = React.useState("")
  const [instructions, setInstructions] = React.useState("")
  const [groupId, setGroupId] = React.useState("")
  const [groups, setGroups] = React.useState<AssignmentGroup[]>([])
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open && courseId) {
      getAssignmentGroups(courseId).then(setGroups).catch(() => {})
    }
  }, [open, courseId])

  // Settings
  const [shuffleQuestions, setShuffleQuestions] = React.useState(false)
  const [redemptionQuestion, setRedemptionQuestion] = React.useState(false)
  const [skipQuestions, setSkipQuestions] = React.useState(false)
  const [showAnswerAfter, setShowAnswerAfter] = React.useState(false)

  function reset() {
    setTitle("")
    setTitleError("")
    setTagInput("")
    setTags([])
    setEstimatedDuration("")
    setInstructions("")
    setGroupId("")
    setShuffleQuestions(false)
    setRedemptionQuestion(false)
    setSkipQuestions(false)
    setShowAnswerAfter(false)
  }

  function handleClose(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  function commitTag(raw: string) {
    const value = raw.trim().replace(/,+$/, "")
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value])
    }
    setTagInput("")
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commitTag(tagInput)
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  async function handleContinue() {
    if (!title.trim()) {
      setTitleError("Quiz title is required")
      return
    }
    setSubmitting(true)
    try {
      const assessment = await createAssessment({
        courseId,
        title: title.trim(),
        type: "quiz",
        totalPoints: 0,
        isPublished: false,
        randomizeQuestions: shuffleQuestions,
        redemptionQuestion,
        skipQuestions,
        showAnswerAfter,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        tags,
        instructions: instructions.trim() || undefined,
        groupId: groupId || undefined,
      })
      handleClose(false)
      router.push(`/courses/${courseId}/assessments/${assessment._id}/questions`)
    } catch {
      toast.error("Failed to create quiz")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] w-[960px] max-w-[calc(100vw-2rem)] flex-col gap-0 rounded-2xl p-0 shadow-2xl sm:max-w-[960px]"
      >
        <DialogTitle className="sr-only">Create new Quiz</DialogTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">Create new Quiz</p>
          <button
            onClick={() => handleClose(false)}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left — form */}
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (e.target.value.trim()) setTitleError("")
                }}
                placeholder="Quiz Title"
                className="w-full border-none bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-0"
              />
              {titleError && (
                <p className="mt-1 text-xs text-destructive">{titleError}</p>
              )}
            </div>

            <Separator />

            {/* Metadata rows */}
            <div className="divide-y divide-border/60">
              {/* Tags */}
              <div className="flex items-start gap-4 py-3">
                <div className="flex w-40 shrink-0 items-center gap-2 pt-0.5 text-sm text-muted-foreground">
                  <Tag className="size-4" />
                  <span>Tags</span>
                </div>
                <div className="flex flex-1 flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput.trim() && commitTag(tagInput)}
                    placeholder={tags.length === 0 ? "Add tags…" : ""}
                    className="min-w-[80px] flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                  />
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="flex items-center gap-4 py-3">
                <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  <span>Est. Duration</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="—"
                    className="w-16 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                  />
                  {estimatedDuration && (
                    <span className="text-sm text-muted-foreground">min</span>
                  )}
                </div>
              </div>

              {/* Grade Group */}
              {groups.length > 0 && (
                <div className="flex items-center gap-4 py-3">
                  <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="size-4" />
                    <span>Grade Group</span>
                  </div>
                  <Select value={groupId} onValueChange={setGroupId}>
                    <SelectTrigger className="h-8 w-48 text-sm">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Instructions */}
            <div>
              <div className="flex items-start gap-4">
                <textarea
                  value={instructions}
                  onChange={(e) =>
                    setInstructions(e.target.value.slice(0, MAX_INSTRUCTIONS))
                  }
                  placeholder="Add instructions for students…"
                  rows={5}
                  className="flex-1 resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {instructions.length}/{MAX_INSTRUCTIONS}
                </span>
              </div>
            </div>
          </div>

          {/* Right — settings */}
          <div className="w-80 shrink-0 overflow-y-auto border-l border-border px-5 py-5">
            <p className="mb-4 text-sm font-semibold text-foreground">
              Question Settings
            </p>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Questions
            </p>
            <div className="space-y-2">
              <SettingRow
                icon={Shuffle}
                label="Shuffle Questions"
                description="Randomly order questions for each student."
                checked={shuffleQuestions}
                onCheckedChange={setShuffleQuestions}
              />
              <SettingRow
                icon={RotateCcw}
                label="Redemption Question"
                description="Allow students to reattempt incorrect questions after the quiz ends."
                checked={redemptionQuestion}
                onCheckedChange={setRedemptionQuestion}
              />
            </div>

            <Separator className="my-4" />

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Activity
            </p>
            <div className="space-y-2">
              <SettingRow
                icon={SkipForward}
                label="Skip & Attempt Later"
                description="Students can skip a question and revisit it before submitting."
                checked={skipQuestions}
                onCheckedChange={setSkipQuestions}
              />
              <SettingRow
                icon={Eye}
                label="Show Answer After"
                description="Reveal correct answers after the student submits."
                checked={showAnswerAfter}
                onCheckedChange={setShowAnswerAfter}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
