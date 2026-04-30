"use client"

import * as React from "react"
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  GraduationCap,
  Hash,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
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
import { cn } from "@workspace/ui/lib/utils"
import { useNewCourseStore } from "@/lib/store/new-course-store"
import { apiClient } from "@/lib/config/api-client"
import { uploadToCloudinary } from "@/lib/utils/upload"

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DESCRIPTION = 400

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "First Semester",
  "2nd": "Second Semester",
  summer: "Summer",
}

// ─── Step 1: Course Overview ──────────────────────────────────────────────────

function Step1Content() {
  const { step1, setStep1 } = useNewCourseStore()
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const iconInputRef = React.useRef<HTMLInputElement>(null)

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setStep1({ coverFile: file, coverPreview: URL.createObjectURL(file) })
  }

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setStep1({ iconFile: file, iconPreview: URL.createObjectURL(file) })
  }

  return (
    <div className="space-y-0">
      {/* Cover Image + Icon */}
      <div className="relative mb-10">
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="group relative h-40 w-full overflow-hidden rounded-2xl border border-dashed border-border bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 transition-colors hover:border-primary/40"
        >
          {step1.coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step1.coverPreview} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm transition-colors group-hover:text-foreground">
                <ImageIcon className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">Click to add cover image</span>
            </div>
          )}
        </button>

        {/* Course Icon */}
        <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
        <button
          type="button"
          onClick={() => iconInputRef.current?.click()}
          className="absolute -bottom-6 left-5 flex size-13 items-center justify-center overflow-hidden rounded-2xl border-2 border-background bg-blue-500 text-white shadow-md transition-opacity hover:opacity-90"
        >
          {step1.iconPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step1.iconPreview} alt="Course icon" className="h-full w-full object-cover" />
          ) : (
            <GraduationCap className="size-5" />
          )}
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={step1.title}
        onChange={(e) => setStep1({ title: e.target.value })}
        placeholder="Course Title"
        className="mb-4 w-full border-none bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-0"
      />

      <Separator className="mb-1" />

      {/* Metadata rows */}
      <div className="divide-y divide-border/60">
        {/* Semester */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" /><span>Semester</span>
          </div>
          <Select value={step1.semester} onValueChange={(v) => setStep1({ semester: v })}>
            <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0 focus-visible:ring-0">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st">First Semester</SelectItem>
              <SelectItem value="2nd">Second Semester</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Code */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Hash className="size-4" /><span>Course Code</span>
          </div>
          <input type="text" value={step1.code} onChange={(e) => setStep1({ code: e.target.value })} placeholder="e.g. CS101"
            className="flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0" />
        </div>
      </div>

      <Separator className="mt-1" />

      {/* Description */}
      <div className="mt-4">
        <div className="flex items-start gap-4">
          <textarea
            value={step1.description}
            onChange={(e) => setStep1({ description: e.target.value.slice(0, MAX_DESCRIPTION) })}
            placeholder="Type description here..."
            rows={3}
            className="flex-1 resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0"
          />
          <span className="shrink-0 text-xs text-muted-foreground">{step1.description.length}/{MAX_DESCRIPTION}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Let your learners know a little about this course.</p>
      </div>
    </div>
  )
}

// ─── Step 2: Sections ─────────────────────────────────────────────────────────

function Step2Content() {
  const { sections, addSection, updateSection, removeSection } = useNewCourseStore()

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Sections</h3>
          <p className="text-xs text-muted-foreground">Sections group your students. Add at least one.</p>
        </div>
        <Button size="sm" variant="outline" onClick={addSection} className="gap-1.5">
          <Plus className="size-4" />
          Add Section
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <div key={section.id} className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Section {index + 1}</span>
              {sections.length > 1 && (
                <button type="button" onClick={() => removeSection(section.id)}
                  className="flex items-center gap-1 text-xs text-destructive opacity-70 transition-opacity hover:opacity-100">
                  <Trash2 className="size-3.5" />Remove
                </button>
              )}
            </div>
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Section Name <span className="text-destructive">*</span>
                </label>
                <Input value={section.name} onChange={(e) => updateSection(section.id, { name: e.target.value })} placeholder="e.g. Section A" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Schedule</label>
                  <Input value={section.schedule} onChange={(e) => updateSection(section.id, { schedule: e.target.value })} placeholder="e.g. MWF 8:00–9:00 AM" />
                </div>
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <DoorOpen className="size-3" />Room
                  </label>
                  <Input value={section.room} onChange={(e) => updateSection(section.id, { room: e.target.value })} placeholder="e.g. Room 101" />
                </div>
              </div>
              <div className="w-40">
                <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />Max Students
                </label>
                <Input type="number" min={1} value={section.maxStudents}
                  onChange={(e) => updateSection(section.id, { maxStudents: Math.max(1, Number(e.target.value)) })} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3: Review ───────────────────────────────────────────────────────────

function Step3Content({ error }: { error: string | null }) {
  const { step1, sections } = useNewCourseStore()

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Course Overview Card */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="relative h-36 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
          {step1.coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={step1.coverPreview} alt="Cover" className="h-full w-full object-cover" />
          )}
          <div className="absolute -bottom-5 left-5 flex size-11 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-blue-500 text-white shadow-md">
            {step1.iconPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={step1.iconPreview} alt="Course icon" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="size-5" />
            )}
          </div>
        </div>
        <div className="px-5 pb-4 pt-8">
          <p className="text-lg font-bold">
            {step1.title || <span className="text-muted-foreground/50">Untitled Course</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {step1.code && <span><span className="font-medium text-foreground">Code:</span> {step1.code}</span>}
            {step1.semester && <span><span className="font-medium text-foreground">Semester:</span> {SEMESTER_LABELS[step1.semester] ?? step1.semester}</span>}
          </div>
          {step1.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step1.description}</p>
          )}
        </div>
      </div>

      {/* Sections Card */}
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">
            Sections <span className="ml-1 text-xs font-normal text-muted-foreground">({sections.length})</span>
          </h3>
        </div>
        <div className="divide-y divide-border/60">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-start gap-4 px-5 py-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium">{section.name}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {section.schedule && <span>{section.schedule}</span>}
                  {section.room && <span>{section.room}</span>}
                  <span>{section.maxStudents} max students</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ["Course Overview", "Add Sections", "Review & Publish"]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  done || active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3" /> : n}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px min-w-6 flex-1 transition-colors",
                  n < current ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

interface NewCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewCourseDialog({ open, onOpenChange }: NewCourseDialogProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { step1, sections, reset } = useNewCourseStore()

  const canAdvanceStep2 = sections.every((s) => s.name.trim().length > 0)

  async function handlePublish() {
    if (!step1.title || !step1.code || !step1.semester) {
      setError("Course title, code, and semester are required. Please go back to Step 1.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let coverUrl: string | undefined
      let iconUrl: string | undefined

      if (step1.coverFile) coverUrl = await uploadToCloudinary(step1.coverFile)
      if (step1.iconFile) iconUrl = await uploadToCloudinary(step1.iconFile)

      const courseRes = await apiClient.post<{ _id: string }>("/courses", {
        name: step1.title,
        code: step1.code,
        description: step1.description || undefined,
        semester: step1.semester,
        ...(coverUrl ? { coverUrl } : {}),
        ...(iconUrl ? { iconUrl } : {}),
      })

      const courseId = courseRes.data._id

      for (const section of sections) {
        await apiClient.post("/sections", {
          courseId,
          name: section.name,
          schedule: section.schedule || undefined,
          room: section.room || undefined,
          maxStudents: section.maxStudents,
        })
      }

      reset()
      setStep(1)
      onOpenChange(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] w-[780px] max-w-[calc(100vw-2rem)] sm:max-w-[780px] flex-col gap-0 rounded-2xl p-0 shadow-2xl"
      >
        <DialogTitle className="sr-only">Create Course</DialogTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">Create Course</p>
          <button
            onClick={() => onOpenChange(false)}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <StepIndicator current={step} />
          </div>
          {step === 1 && <Step1Content />}
          {step === 2 && <Step2Content />}
          {step === 3 && <Step3Content error={error} />}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          {step > 1 ? (
            <button
              onClick={() => { setError(null); setStep((s) => (s - 1) as 1 | 2 | 3) }}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              {step === 2 ? "Course Overview" : "Add Sections"}
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              disabled={step === 2 && !canAdvanceStep2}
            >
              Continue
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="size-4 animate-spin" />Publishing…</>
              ) : (
                "Publish Course"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
