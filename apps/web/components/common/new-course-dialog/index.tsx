"use client"

import * as React from "react"
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  FileText,
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
import { useNewCourseStore } from "@/lib/store/new-course.store"
import { SchedulePicker } from "@/components/common/schedule-picker"
import { createCourseSchema } from "@workspace/validators"
import client from "@/lib/config/axios"
import {
  uploadToCloudinary,
  uploadDocumentToCloudinary,
} from "@/lib/utils/upload"

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_DESCRIPTION = 400

const SEMESTER_LABELS: Record<string, string> = {
  "1st": "First Semester",
  "2nd": "Second Semester",
  summer: "Summer",
}

// ─── Step 1: Course Overview ──────────────────────────────────────────────────

interface Step1Errors {
  title?: string
  code?: string
  semester?: string
}

function Step1Content({
  errors,
  clearError,
}: {
  errors: Step1Errors
  clearError: (field: keyof Step1Errors) => void
}) {
  const { step1, setStep1 } = useNewCourseStore()
  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const iconInputRef = React.useRef<HTMLInputElement>(null)
  const syllabusInputRef = React.useRef<HTMLInputElement>(null)

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file)
      setStep1({ coverFile: file, coverPreview: URL.createObjectURL(file) })
  }

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file)
      setStep1({ iconFile: file, iconPreview: URL.createObjectURL(file) })
  }

  function handleSyllabusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setStep1({ syllabusFile: file, syllabusName: file.name })
  }

  return (
    <div className="space-y-0">
      {/* Cover Image + Icon */}
      <div className="relative mb-10">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
        />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="group relative h-40 w-full overflow-hidden rounded-2xl border border-dashed border-border bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 transition-colors hover:border-primary/40"
        >
          {step1.coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={step1.coverPreview}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm transition-colors group-hover:text-foreground">
                <ImageIcon className="size-4" />
              </div>
              <span className="text-xs text-muted-foreground">
                Click to add cover image
              </span>
            </div>
          )}
        </button>

        {/* Course Icon */}
        <input
          ref={iconInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleIconChange}
        />
        <button
          type="button"
          onClick={() => iconInputRef.current?.click()}
          className="absolute -bottom-6 left-5 flex size-13 items-center justify-center overflow-hidden rounded-2xl border-2 border-background bg-blue-500 text-white shadow-md transition-opacity hover:opacity-90"
        >
          {step1.iconPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={step1.iconPreview}
              alt="Course icon"
              className="h-full w-full object-cover"
            />
          ) : (
            <GraduationCap className="size-5" />
          )}
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={step1.title}
        onChange={(e) => {
          setStep1({ title: e.target.value })
          clearError("title")
        }}
        placeholder="Course Title"
        className="mb-4 w-full border-none bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 focus:ring-0"
      />
      {errors.title && (
        <p className="-mt-3 mb-4 text-xs text-destructive">{errors.title}</p>
      )}

      <Separator className="mb-1" />

      {/* Metadata rows */}
      <div className="divide-y divide-border/60">
        {/* Semester */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            <span>Semester</span>
          </div>
          <Select
            value={step1.semester}
            onValueChange={(v) => {
              setStep1({ semester: v })
              clearError("semester")
            }}
          >
            <SelectTrigger
              className={cn(
                "h-auto w-auto bg-transparent p-0 text-sm shadow-none focus:ring-0 focus-visible:ring-0",
                errors.semester
                  ? "border-0 border-none text-destructive"
                  : "border-0"
              )}
            >
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st">First Semester</SelectItem>
              <SelectItem value="2nd">Second Semester</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
            </SelectContent>
          </Select>
          {errors.semester && (
            <span className="text-xs text-destructive">
              {errors.semester}
            </span>
          )}
        </div>

        {/* Course Code */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <Hash className="size-4" />
            <span>Course Code</span>
          </div>
          <input
            type="text"
            value={step1.code}
            onChange={(e) => {
              setStep1({ code: e.target.value })
              clearError("code")
            }}
            placeholder="e.g. CS101"
            className="flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0"
          />
        </div>
        {errors.code && (
          <div className="flex items-center gap-4 py-1">
            <div className="w-40 shrink-0" />
            <p className="text-xs text-destructive">{errors.code}</p>
          </div>
        )}

        {/* Passing Base */}
        <div className="flex items-center gap-4 py-3">
          <div className="flex w-40 shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="size-4" />
            <span>Passing Base</span>
          </div>
          <Select
            value={step1.gradeBase}
            onValueChange={(v) => setStep1({ gradeBase: v as "50" | "75" })}
          >
            <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0 focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50-based (passing ≥ 50%)</SelectItem>
              <SelectItem value="75">75-based (passing ≥ 75%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="mt-1" />

      {/* Description */}
      <div className="mt-4">
        <div className="flex items-start gap-4">
          <textarea
            value={step1.description}
            onChange={(e) =>
              setStep1({
                description: e.target.value.slice(0, MAX_DESCRIPTION),
              })
            }
            placeholder="Type description here..."
            rows={3}
            className="flex-1 resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-0"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {step1.description.length}/{MAX_DESCRIPTION}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Let your learners know a little about this course.
        </p>
      </div>

      {/* Syllabus Upload */}
      <div className="mt-4">
        <input
          ref={syllabusInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleSyllabusChange}
        />
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            {step1.syllabusName ? (
              <p className="truncate text-sm font-medium text-foreground">
                {step1.syllabusName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No syllabus uploaded
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              PDF or Word document
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {step1.syllabusName && (
              <button
                type="button"
                onClick={() =>
                  setStep1({ syllabusFile: null, syllabusName: null })
                }
                className="text-xs text-destructive hover:underline"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => syllabusInputRef.current?.click()}
              className="rounded-md border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
            >
              {step1.syllabusName ? "Replace" : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Sections ─────────────────────────────────────────────────────────

function Step2Content() {
  const { sections, addSection, updateSection, removeSection } =
    useNewCourseStore()

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Sections</h3>
          <p className="text-xs text-muted-foreground">
            Sections group your students. Add at least one.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addSection}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Add Section
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Section {index + 1}
              </span>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="flex items-center gap-1 text-xs text-destructive opacity-70 transition-opacity hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              )}
            </div>
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Section Name <span className="text-destructive">*</span>
                </label>
                <Input
                  value={section.name}
                  onChange={(e) =>
                    updateSection(section.id, { name: e.target.value })
                  }
                  placeholder="e.g. Section A"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Lecture Schedule
                  </label>
                  <SchedulePicker
                    value={section.schedule}
                    onChange={(schedule) =>
                      updateSection(section.id, { schedule })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    Lab Schedule
                  </label>
                  <SchedulePicker
                    value={section.labSchedule}
                    onChange={(labSchedule) =>
                      updateSection(section.id, { labSchedule })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <DoorOpen className="size-3" />
                    Room
                  </label>
                  <Input
                    value={section.room}
                    onChange={(e) =>
                      updateSection(section.id, { room: e.target.value })
                    }
                    placeholder="e.g. Room 101"
                  />
                </div>
              </div>
              <div className="w-40">
                <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  Max Students
                </label>
                <Input
                  type="number"
                  min={1}
                  value={section.maxStudents}
                  onChange={(e) =>
                    updateSection(section.id, {
                      maxStudents: Math.max(1, Number(e.target.value)),
                    })
                  }
                />
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
            <img
              src={step1.coverPreview}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute -bottom-5 left-5 flex size-11 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-blue-500 text-white shadow-md">
            {step1.iconPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={step1.iconPreview}
                alt="Course icon"
                className="h-full w-full object-cover"
              />
            ) : (
              <GraduationCap className="size-5" />
            )}
          </div>
        </div>
        <div className="px-5 pt-8 pb-4">
          <p className="text-lg font-bold">
            {step1.title || (
              <span className="text-muted-foreground/50">Untitled Course</span>
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {step1.code && (
              <span>
                <span className="font-medium text-foreground">Code:</span>{" "}
                {step1.code}
              </span>
            )}
            {step1.semester && (
              <span>
                <span className="font-medium text-foreground">Semester:</span>{" "}
                {SEMESTER_LABELS[step1.semester] ?? step1.semester}
              </span>
            )}
            <span>
              <span className="font-medium text-foreground">Passing Base:</span>{" "}
              {step1.gradeBase === "50" ? "50-based" : "75-based"}
            </span>
          </div>
          {step1.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {step1.description}
            </p>
          )}
          {step1.syllabusName && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{step1.syllabusName}</span>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Syllabus
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sections Card */}
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">
            Sections{" "}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({sections.length})
            </span>
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
                  {section.schedule && <span>Lecture: {section.schedule}</span>}
                  {section.labSchedule && <span>Lab: {section.labSchedule}</span>}
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

const CREATE_STEPS = ["Course Overview", "Add Sections", "Review & Publish"]
const EDIT_STEPS = ["Course Overview", "Review & Save"]

function StepIndicator({
  current,
  steps,
}: {
  current: number
  steps: string[]
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
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
            {i < steps.length - 1 && (
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

interface CourseData {
  _id: string
  name: string
  code: string
  description?: string
  semester: string
  cover?: string
  icon?: string
  syllabus?: string
  gradeBase?: "50" | "75"
}

interface NewCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: CourseData
  onCreated?: () => void
}

export function NewCourseDialog({
  open,
  onOpenChange,
  course,
  onCreated,
}: NewCourseDialogProps) {
  const isEditMode = !!course
  // In edit mode: logical steps are 1 (overview) and 3 (review) — we skip step 2
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [step1Errors, setStep1Errors] = React.useState<Step1Errors>({})

  const { step1, sections, setStep1, reset } = useNewCourseStore()

  // Seed store when opening in edit mode
  React.useEffect(() => {
    if (open && isEditMode && course) {
      setStep1({
        title: course.name,
        code: course.code,
        description: course.description ?? "",
        semester: course.semester,
        gradeBase: course.gradeBase ?? "50",
        coverFile: null,
        iconFile: null,
        coverPreview: course.cover ?? null,
        iconPreview: course.icon ?? null,
        syllabusFile: null,
        syllabusName: course.syllabus
          ? (course.syllabus.split("/").pop() ?? "Syllabus")
          : null,
      })
      setStep(1)
      setError(null)
    }
    if (!open) {
      reset()
      setStep(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canAdvanceStep2 = sections.every((s) => s.name.trim().length > 0)

  const clearStep1Error = React.useCallback((field: keyof Step1Errors) => {
    setStep1Errors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const steps = isEditMode ? EDIT_STEPS : CREATE_STEPS
  // Map logical step numbers to step indicator position
  // Edit mode: step 1 → indicator 1, step 3 → indicator 2
  const indicatorStep = isEditMode ? (step === 1 ? 1 : 2) : step

  function handleNext() {
    if (isEditMode) {
      setStep(3)
      return
    }

    if (step === 1) {
      const newErrors: Step1Errors = {}
      if (!step1.title.trim()) newErrors.title = "Course title is required"
      if (!step1.code.trim()) newErrors.code = "Course code is required"
      if (!step1.semester) newErrors.semester = "Please select a semester"
      setStep1Errors(newErrors)
      if (Object.keys(newErrors).length > 0) return
    }

    setStep((s) => (s + 1) as 2 | 3)
  }

  function handleBack() {
    setError(null)
    setStep1Errors({})
    if (isEditMode) {
      setStep(1)
    } else {
      setStep((s) => (s - 1) as 1 | 2 | 3)
    }
  }

  function backLabel() {
    if (isEditMode) return "Course Overview"
    return step === 2 ? "Course Overview" : "Add Sections"
  }

  async function handlePublish() {
    const parsed = createCourseSchema.safeParse({
      name: step1.title,
      code: step1.code,
      semester: step1.semester,
      description: step1.description || undefined,
      gradeBase: step1.gradeBase,
    })

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Please fill in required fields.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let coverUrl: string | undefined
      let iconUrl: string | undefined
      let syllabusUrl: string | undefined

      if (step1.coverFile) coverUrl = await uploadToCloudinary(step1.coverFile)
      if (step1.iconFile) iconUrl = await uploadToCloudinary(step1.iconFile)
      if (step1.syllabusFile)
        syllabusUrl = await uploadDocumentToCloudinary(step1.syllabusFile)

      const body = {
        name: parsed.data.name,
        code: parsed.data.code,
        semester: parsed.data.semester,
        description: parsed.data.description,
        gradeBase: step1.gradeBase,
        ...(coverUrl ? { cover: coverUrl } : {}),
        ...(iconUrl ? { icon: iconUrl } : {}),
        ...(syllabusUrl ? { syllabus: syllabusUrl } : {}),
      }

      if (isEditMode && course) {
        await client.put(`/courses/${course._id}`, body)
      } else {
        const courseRes = await client.post<{ _id: string }>("/courses", body)
        const courseId = courseRes.data._id

        await Promise.all(
          sections.map((section) =>
            client.post("/sections", {
              courseId,
              name: section.name,
              schedule: section.schedule || undefined,
              labSchedule: section.labSchedule || undefined,
              room: section.room || undefined,
              maxStudents: section.maxStudents,
            })
          )
        )
      }

      reset()
      setStep(1)
      onOpenChange(false)
      onCreated?.()
    } catch (err: unknown) {
      const status = (err as any)?.response?.status
      if (status === 409) {
        setError("Course code is already in use. Please choose a different code.")
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] w-[780px] max-w-[calc(100vw-2rem)] flex-col gap-0 rounded-2xl p-0 shadow-2xl sm:max-w-[780px]"
      >
        <DialogTitle className="sr-only">
          {isEditMode ? "Edit Course" : "Create Course"}
        </DialogTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <p className="text-sm font-semibold text-foreground">
            {isEditMode ? "Edit Course" : "Create Course"}
          </p>
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
            <StepIndicator current={indicatorStep} steps={steps} />
          </div>
          {step === 1 && (
            <Step1Content
              errors={step1Errors}
              clearError={clearStep1Error}
            />
          )}
          {step === 2 && <Step2Content />}
          {step === 3 && <Step3Content error={error} />}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              {backLabel()}
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!isEditMode && step === 2 && !canAdvanceStep2}
            >
              Continue
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isEditMode ? "Saving…" : "Publishing…"}
                </>
              ) : isEditMode ? (
                "Save Changes"
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
