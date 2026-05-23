"use client"

import * as React from "react"
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import type { UpdateQuestionInput } from "@/lib/services/questions"
import type { QuestionLike, QuestionType } from "./types"

interface OptionDraft {
  text: string
  isCorrect: boolean
}

interface QuestionDraft {
  type: QuestionType
  question: string
  points: number
  options: OptionDraft[]
  correctAnswer: string | boolean | undefined
  required: boolean
  multipleAnswers: boolean
  randomizeOrder: boolean
  estimationTime: number | undefined
}

function toDraft(q: QuestionLike): QuestionDraft {
  return {
    type: q.type,
    question: q.question,
    points: q.points ?? 1,
    options: q.options?.length
      ? q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
      : [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
    correctAnswer: q.correctAnswer,
    required: q.required ?? true,
    multipleAnswers: q.multipleAnswers ?? false,
    randomizeOrder: q.randomizeOrder ?? false,
    estimationTime: q.estimationTime,
  }
}

function draftsEqual(a: QuestionDraft, b: QuestionDraft): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

interface QuestionCardProps {
  question: QuestionLike
  index: number
  onSave: (id: string, data: UpdateQuestionInput) => Promise<void>
  onDelete: (id: string) => void
  cardRef?: React.RefObject<HTMLDivElement | null>
}

export function QuestionCard({ question, index, onSave, onDelete, cardRef }: QuestionCardProps) {
  const [draft, setDraft] = React.useState<QuestionDraft>(() => toDraft(question))
  const [saved, setSaved] = React.useState<QuestionDraft>(() => toDraft(question))
  const [saving, setSaving] = React.useState(false)

  const isDirty = !draftsEqual(draft, saved)

  function update(patch: Partial<QuestionDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function setOptionText(i: number, text: string) {
    update({ options: draft.options.map((o, idx) => (idx === i ? { ...o, text } : o)) })
  }

  function setOptionCorrect(i: number) {
    if (draft.multipleAnswers) {
      update({
        options: draft.options.map((o, idx) =>
          idx === i ? { ...o, isCorrect: !o.isCorrect } : o
        ),
      })
    } else {
      update({ options: draft.options.map((o, idx) => ({ ...o, isCorrect: idx === i })) })
    }
  }

  function removeOption(i: number) {
    const next = draft.options.filter((_, idx) => idx !== i)
    if (!next.some((o) => o.isCorrect) && next.length > 0) next[0]!.isCorrect = true
    update({ options: next })
  }

  function addOption() {
    update({ options: [...draft.options, { text: "", isCorrect: false }] })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload: UpdateQuestionInput = {
        type: draft.type,
        question: draft.question.trim(),
        points: draft.points,
        required: draft.required,
        multipleAnswers: draft.multipleAnswers,
        randomizeOrder: draft.randomizeOrder,
        estimationTime: draft.estimationTime,
      }

      if (draft.type === "multiple_choice") {
        payload.options = draft.options
          .filter((o) => o.text.trim())
          .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
      } else if (draft.type === "true_false") {
        payload.correctAnswer = draft.correctAnswer
      } else if (draft.type === "fill_in") {
        payload.correctAnswer =
          typeof draft.correctAnswer === "string" ? draft.correctAnswer.trim() : ""
      }

      await onSave(question._id, payload)
      setSaved({ ...draft })
    } finally {
      setSaving(false)
    }
  }

  return (
    <TooltipProvider>
      <Card ref={cardRef} className="gap-0 py-0">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Select
            value={draft.type}
            onValueChange={(v) => update({ type: v as QuestionType })}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple choice</SelectItem>
              <SelectItem value="true_false">True / False</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="fill_in">Fill in the blank</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Label className="text-xs font-normal text-muted-foreground">Required</Label>
            <Switch
              checked={draft.required}
              onCheckedChange={(v) => update({ required: v })}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Options</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(question._id)}
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Body */}
        <CardContent className="space-y-4 pt-4">
          {/* Question text */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Q{index + 1}</Badge>
              {draft.required && (
                <span className="text-[11px] text-destructive">Required</span>
              )}
            </div>
            <Textarea
              value={draft.question}
              onChange={(e) => update({ question: e.target.value })}
              placeholder="Enter your question..."
              className="min-h-20 resize-none bg-muted/30"
            />
          </div>

          {/* Multiple choice */}
          {draft.type === "multiple_choice" && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Label className="text-xs">Choices</Label>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={draft.multipleAnswers}
                    onCheckedChange={(v) => update({ multipleAnswers: v })}
                    className="h-4 w-7 data-[state=checked]:bg-primary"
                  />
                  <Label className="text-xs font-normal text-muted-foreground">
                    Multiple answer
                  </Label>
                </div>
              </div>

              {draft.multipleAnswers ? (
                <div className="space-y-2">
                  {draft.options.map((opt, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <Checkbox
                        checked={opt.isCorrect}
                        onCheckedChange={() => setOptionCorrect(i)}
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) => setOptionText(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="h-7 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                      />
                      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
                      {draft.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="shrink-0 text-muted-foreground/30 transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={String(draft.options.findIndex((o) => o.isCorrect))}
                  onValueChange={(v) => setOptionCorrect(Number(v))}
                  className="gap-2"
                >
                  {draft.options.map((opt, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <RadioGroupItem value={String(i)} />
                      <Input
                        value={opt.text}
                        onChange={(e) => setOptionText(i, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="h-7 flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                      />
                      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/60" />
                      {draft.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="shrink-0 text-muted-foreground/30 transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="border-dashed text-xs text-muted-foreground"
              >
                <Plus className="mr-1.5 size-3" />
                Add option
              </Button>
            </div>
          )}

          {/* True / False */}
          {draft.type === "true_false" && (
            <div className="space-y-2">
              <Label className="text-xs">Correct answer</Label>
              <RadioGroup
                value={String(draft.correctAnswer)}
                onValueChange={(v) => update({ correctAnswer: v === "true" })}
                className="gap-2"
              >
                {(["true", "false"] as const).map((val) => (
                  <div
                    key={val}
                    onClick={() => update({ correctAnswer: val === "true" })}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                      String(draft.correctAnswer) === val
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value={val} />
                    <Label className="cursor-pointer capitalize">{val}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Essay */}
          {draft.type === "essay" && (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                Students will write a free-form answer
              </p>
            </div>
          )}

          {/* Fill in the blank */}
          {draft.type === "fill_in" && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                Correct answer
                <span className="ml-1 font-normal text-muted-foreground/60">
                  (separate alternatives with commas)
                </span>
              </Label>
              <Input
                value={typeof draft.correctAnswer === "string" ? draft.correctAnswer : ""}
                onChange={(e) => update({ correctAnswer: e.target.value })}
                placeholder="e.g. Paris, paris"
                className="max-w-xs"
              />
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-normal text-muted-foreground">Randomize order</Label>
            <Select
              value={draft.randomizeOrder ? "random" : "keep"}
              onValueChange={(v) => update({ randomizeOrder: v === "random" })}
            >
              <SelectTrigger className="h-7 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">Keep current order</SelectItem>
                <SelectItem value="random">Randomize order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              value={draft.estimationTime ?? ""}
              onChange={(e) =>
                update({ estimationTime: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="—"
              className="h-7 w-14 text-center text-xs"
            />
            <Label className="text-xs font-normal text-muted-foreground">Mins</Label>
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              value={draft.points}
              onChange={(e) => update({ points: Number(e.target.value) || 1 })}
              className="h-7 w-14 text-center text-xs"
            />
            <Label className="text-xs font-normal text-muted-foreground">Points</Label>
          </div>

          <div className="ml-auto">
            {isDirty ? (
              <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs">
                {saving ? <Loader2 className="size-3 animate-spin" /> : "Save"}
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">Saved</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
