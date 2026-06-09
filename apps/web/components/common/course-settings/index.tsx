"use client"

import * as React from "react"
import {
  Save,
  Archive,
  Trash2,
  AlertTriangle,
  ImageIcon,
  FileText,
  GraduationCap,
  Loader2,
  Hash,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  Link,
  UserPlus,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
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
import { updateCourse, archiveCourse, deleteCourse, getCourseAuditLogs, type Course, type AuditLogEntry } from "@/lib/services/courses"
import { updateCourseSchema } from "@workspace/validators"
import {
  uploadToCloudinary,
  uploadDocumentToCloudinary,
} from "@/lib/utils/upload"
import { timeAgo } from "@/lib/utils/time"
import { useRouter } from "next/navigation"
import {
  getSectionsByCourse,
  generateJoinCode,
  type Section,
} from "@/lib/services/sections"
import { createInvitation, type Invitation } from "@/lib/services/invitations"
import {
  getAssignmentGroups,
  createAssignmentGroup,
  updateAssignmentGroup,
  deleteAssignmentGroup,
  type AssignmentGroup,
} from "@/lib/services/assignment-groups"

interface CourseSettingsProps {
  course: Course
  onUpdated: () => void
}

const MAX_DESCRIPTION = 400

const SEMESTER_OPTIONS = [
  { value: "1st", label: "First Semester" },
  { value: "2nd", label: "Second Semester" },
  { value: "summer", label: "Summer" },
]

export function CourseSettings({ course, onUpdated }: CourseSettingsProps) {
  const router = useRouter()
  const [name, setName] = React.useState(course.name)
  const [code, setCode] = React.useState(course.code)
  const [semester, setSemester] = React.useState(course.semester)
  const [description, setDescription] = React.useState(course.description ?? "")
  const [coverFile, setCoverFile] = React.useState<File | null>(null)
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null)
  const [iconFile, setIconFile] = React.useState<File | null>(null)
  const [iconPreview, setIconPreview] = React.useState<string | null>(null)
  const [syllabusFile, setSyllabusFile] = React.useState<File | null>(null)
  const [syllabusName, setSyllabusName] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [archiving, setArchiving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const [gradeBase, setGradeBase] = React.useState<"50" | "75">(course.gradeBase ?? "50")

  // Grading system (assignment groups)
  type GroupRow = {
    _id?: string
    name: string
    weight: number | ""
    dropLowest: number
    saving: boolean
    dirty: boolean
  }
  const [groupRows, setGroupRows] = React.useState<GroupRow[]>([])
  const [groupsLoading, setGroupsLoading] = React.useState(true)

  React.useEffect(() => {
    getAssignmentGroups(course._id)
      .then((groups) =>
        setGroupRows(
          groups.map((g) => ({
            _id: g._id,
            name: g.name,
            weight: g.weight,
            dropLowest: g.dropLowest,
            saving: false,
            dirty: false,
          }))
        )
      )
      .catch(() => {})
      .finally(() => setGroupsLoading(false))
  }, [course._id])

  const totalWeight = groupRows.reduce((sum, r) => sum + (Number(r.weight) || 0), 0)

  function addGroupRow() {
    setGroupRows((prev) => [
      ...prev,
      { name: "", weight: "", dropLowest: 0, saving: false, dirty: true },
    ])
  }

  function updateGroupRow(i: number, patch: Partial<GroupRow>) {
    setGroupRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, ...patch, dirty: true } : r))
    )
  }

  async function saveGroupRow(i: number) {
    const row = groupRows[i]
    if (!row || !row.name.trim() || row.weight === "" || Number(row.weight) < 0) return
    setGroupRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, saving: true } : r)))
    try {
      if (row._id) {
        await updateAssignmentGroup(row._id, {
          name: row.name.trim(),
          weight: Number(row.weight),
          dropLowest: row.dropLowest,
        })
      } else {
        const created = await createAssignmentGroup({
          courseId: course._id,
          name: row.name.trim(),
          weight: Number(row.weight),
          dropLowest: row.dropLowest,
          order: i,
        })
        setGroupRows((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, _id: created._id } : r))
        )
      }
      setGroupRows((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, saving: false, dirty: false } : r))
      )
      toast.success("Component saved")
    } catch {
      toast.error("Failed to save component")
      setGroupRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, saving: false } : r)))
    }
  }

  async function deleteGroupRow(i: number) {
    const row = groupRows[i]
    if (!row) return
    if (!row._id) {
      setGroupRows((prev) => prev.filter((_, idx) => idx !== i))
      return
    }
    setGroupRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, saving: true } : r)))
    try {
      await deleteAssignmentGroup(row._id)
      setGroupRows((prev) => prev.filter((_, idx) => idx !== i))
      toast.success("Component removed")
    } catch {
      toast.error("Failed to remove component")
      setGroupRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, saving: false } : r)))
    }
  }

  // Student access
  const [sections, setSections] = React.useState<Section[]>([])
  const [sectionsLoading, setSectionsLoading] = React.useState(true)
  const [generatingCodeId, setGeneratingCodeId] = React.useState<string | null>(null)
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null)
  const [inviteSectionId, setInviteSectionId] = React.useState("")
  const [inviteExpiry, setInviteExpiry] = React.useState("7")
  const [generatingInvite, setGeneratingInvite] = React.useState(false)
  const [invitation, setInvitation] = React.useState<Invitation | null>(null)
  const [copiedInvite, setCopiedInvite] = React.useState(false)

  React.useEffect(() => {
    getSectionsByCourse(course._id)
      .then(setSections)
      .catch(() => {})
      .finally(() => setSectionsLoading(false))
  }, [course._id])

  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([])
  const [auditLoading, setAuditLoading] = React.useState(true)
  const [auditLimit, setAuditLimit] = React.useState(20)
  const [auditHasMore, setAuditHasMore] = React.useState(false)

  React.useEffect(() => {
    setAuditLoading(true)
    getCourseAuditLogs(course._id, auditLimit)
      .then((logs) => {
        setAuditLogs(logs)
        setAuditHasMore(logs.length === auditLimit)
      })
      .catch(() => {})
      .finally(() => setAuditLoading(false))
  }, [course._id, auditLimit])

  const actionLabel = React.useMemo<Record<string, string>>(
    () => ({
      created: "Created this course",
      updated: "Updated settings",
      deleted: "Deleted this course",
      archived: "Archived this course",
      unarchived: "Unarchived this course",
      duplicated: "Duplicated this course",
    }),
    []
  )

  const coverInputRef = React.useRef<HTMLInputElement>(null)
  const iconInputRef = React.useRef<HTMLInputElement>(null)
  const syllabusInputRef = React.useRef<HTMLInputElement>(null)

  const hasChanges =
    name !== course.name ||
    code !== course.code ||
    semester !== course.semester ||
    description !== (course.description ?? "") ||
    !!coverFile ||
    !!iconFile ||
    !!syllabusFile ||
    gradeBase !== (course.gradeBase ?? "50")

  async function handleSave() {
    const parsed = updateCourseSchema.safeParse({
      name: name !== course.name ? name : undefined,
      code: code !== course.code ? code : undefined,
      semester: semester !== course.semester ? semester : undefined,
      description:
        description !== (course.description ?? "")
          ? description || undefined
          : undefined,
    })

    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid input")
      return
    }

    setSaving(true)
    try {
      let coverUrl: string | undefined
      let iconUrl: string | undefined
      let syllabusUrl: string | undefined

      if (coverFile) coverUrl = await uploadToCloudinary(coverFile)
      if (iconFile) iconUrl = await uploadToCloudinary(iconFile)
      if (syllabusFile)
        syllabusUrl = await uploadDocumentToCloudinary(syllabusFile)

      await updateCourse(course._id, {
        ...parsed.data,
        ...(coverUrl ? { cover: coverUrl } : {}),
        ...(iconUrl ? { icon: iconUrl } : {}),
        ...(syllabusUrl ? { syllabus: syllabusUrl } : {}),
        ...(gradeBase !== (course.gradeBase ?? "50") ? { gradeBase } : {}),
      })

      toast.success("Course updated")
      onUpdated()
    } catch (err: unknown) {
      const status = (err as any)?.response?.status
      if (status === 409) {
        toast.error("Course code is already in use. Please choose a different code.")
      } else {
        toast.error("Failed to update course")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    setArchiving(true)
    try {
      await archiveCourse(course._id)
      toast.success("Course archived")
      router.push("/courses")
    } catch {
      toast.error("Failed to archive course")
    } finally {
      setArchiving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteCourse(course._id)
      toast.success("Course deleted")
      router.push("/courses")
    } catch {
      toast.error("Failed to delete course")
    } finally {
      setDeleting(false)
    }
  }

  async function handleGenerateCode(section: Section) {
    setGeneratingCodeId(section._id)
    try {
      const updated = await generateJoinCode(section._id)
      setSections((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
      toast.success("Join code generated")
    } catch {
      toast.error("Failed to generate code")
    } finally {
      setGeneratingCodeId(null)
    }
  }

  async function handleCopyCode(section: Section) {
    if (!section.joinCode) return
    await navigator.clipboard.writeText(section.joinCode)
    setCopiedCodeId(section._id)
    setTimeout(() => setCopiedCodeId(null), 2000)
    toast.success("Code copied")
  }

  const inviteUrl = invitation
    ? `${window.location.origin}/invite?token=${invitation.token}`
    : ""

  async function handleGenerateInvite() {
    if (!inviteSectionId) return
    setGeneratingInvite(true)
    try {
      const inv = await createInvitation(
        course._id,
        inviteSectionId,
        inviteExpiry ? parseInt(inviteExpiry) : null
      )
      setInvitation(inv)
    } catch {
      toast.error("Failed to generate invite link")
    } finally {
      setGeneratingInvite(false)
    }
  }

  async function handleCopyInvite() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
    toast.success("Invite link copied")
  }

  return (
    <div className="space-y-8">
      {/* Course Info Section */}
      <section>
        <h2 className="mb-4 text-sm font-semibold">Course Information</h2>
        <div className="space-y-5 rounded-xl border border-border p-5">
          {/* Cover + Icon */}
          <div className="relative mb-10">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setCoverFile(file)
                  setCoverPreview(URL.createObjectURL(file))
                }
              }}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="group relative h-36 w-full overflow-hidden rounded-xl border border-dashed border-border bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 transition-colors hover:border-primary/40"
            >
              {coverPreview ?? course.cover ? (
                <img
                  src={coverPreview ?? course.cover}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/80 text-muted-foreground shadow-sm">
                    <ImageIcon className="size-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Click to change cover image
                  </span>
                </div>
              )}
            </button>

            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setIconFile(file)
                  setIconPreview(URL.createObjectURL(file))
                }
              }}
            />
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="absolute -bottom-6 left-5 flex size-13 items-center justify-center overflow-hidden rounded-xl border-2 border-background bg-blue-500 text-white shadow-md transition-opacity hover:opacity-90"
            >
              {iconPreview ?? course.icon ? (
                <img
                  src={iconPreview ?? course.icon}
                  alt="Course icon"
                  className="h-full w-full object-cover"
                />
              ) : (
                <GraduationCap className="size-5" />
              )}
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Course Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Course title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                <Hash className="mr-1 inline size-3" />
                Course Code
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS101"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                <Calendar className="mr-1 inline size-3" />
                Semester
              </label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-start justify-between">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <span className="text-xs text-muted-foreground">
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value.slice(0, MAX_DESCRIPTION))
              }
              placeholder="Course description..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-transparent p-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Syllabus */}
          <div>
            <input
              ref={syllabusInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setSyllabusFile(file)
                  setSyllabusName(file.name)
                }
              }}
            />
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Syllabus
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {syllabusName ?? course.syllabus?.split("/").pop() ?? "No syllabus uploaded"}
                </p>
                <p className="text-xs text-muted-foreground">PDF or Word document</p>
              </div>
              <button
                type="button"
                onClick={() => syllabusInputRef.current?.click()}
                className="rounded-md border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                {syllabusName || course.syllabus ? "Replace" : "Upload"}
              </button>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Metadata Section */}
      <section>
        <h2 className="mb-4 text-sm font-semibold">Course Metadata</h2>
        <div className="space-y-3 rounded-xl border border-border p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span>{timeAgo(course.createdAt)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Activity</span>
            <span>{course.lastActivity ? timeAgo(course.lastActivity) : "\u2014"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Course ID</span>
            <span className="font-mono text-xs">{course._id}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span>{course.isArchived ? "Archived" : "Active"}</span>
          </div>
        </div>
      </section>

      {/* Grading System */}
      <section>
        <h2 className="mb-4 text-sm font-semibold">Grading System</h2>
        <div className="space-y-3 rounded-xl border border-border p-5">
          <p className="text-xs text-muted-foreground">
            Choose the passing base used by this course. This determines the numeric grade (1.00–5.00) and remark for each student's score.
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Passing Base
            </label>
            <Select value={gradeBase} onValueChange={(v) => setGradeBase(v as "50" | "75")}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50-based (passing ≥ 50%)</SelectItem>
                <SelectItem value="75">75-based (passing ≥ 75%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 font-mono">
              {(gradeBase === "50"
                ? [
                    ["0–44%", "5.00", "Failed"],
                    ["45–49%", "4.00", "Cond. Failure"],
                    ["50–61%", "3.00", "Passing"],
                    ["62–71%", "2.75–2.50", "Satisfactory"],
                    ["72–81%", "2.25–2.00", "Good"],
                    ["82–91%", "1.75–1.50", "Very Good"],
                    ["92–100%", "1.25–1.00", "Excellent"],
                  ]
                : [
                    ["0–71%", "5.00", "Failed"],
                    ["72–74%", "4.00", "Cond. Failure"],
                    ["75–77%", "3.00", "Passing"],
                    ["78–83%", "2.75–2.50", "Satisfactory"],
                    ["84–89%", "2.25–2.00", "Good"],
                    ["90–95%", "1.75–1.50", "Very Good"],
                    ["96–100%", "1.25–1.00", "Excellent"],
                  ]
              ).map(([range, grade, remark]) => (
                <React.Fragment key={range}>
                  <span>{range}</span>
                  <span>{grade}</span>
                  <span className="not-italic">{remark}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grade Components */}
      <section>
        <h2 className="mb-4 text-sm font-semibold">Grading System</h2>
        <div className="space-y-4 rounded-xl border border-border p-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Define how the final grade is calculated for this course. Each component maps to a group of assessments in the gradebook.
            </p>
            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                totalWeight === 100
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
            >
              {totalWeight === 100 ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <AlertCircle className="size-3.5" />
              )}
              {totalWeight}% / 100%
            </div>
          </div>

          {groupsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {groupRows.length > 0 && (
                <div className="grid grid-cols-[1fr_80px_72px] items-center gap-2 px-1">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Component</span>
                  <span className="text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Weight</span>
                  <span />
                </div>
              )}

              {groupRows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_72px] items-center gap-2"
                >
                  <Input
                    value={row.name}
                    onChange={(e) => updateGroupRow(i, { name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && saveGroupRow(i)}
                    placeholder="e.g. Final Exam"
                    className="h-9"
                  />
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={row.weight}
                      onChange={(e) =>
                        updateGroupRow(i, {
                          weight: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      onKeyDown={(e) => e.key === "Enter" && saveGroupRow(i)}
                      className="h-9 pr-5 text-center"
                    />
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                      disabled={row.saving || !row.dirty}
                      onClick={() => saveGroupRow(i)}
                      title="Save"
                    >
                      {row.saving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className={`size-4 ${row.dirty ? "text-emerald-600" : ""}`} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={row.saving}
                      onClick={() => deleteGroupRow(i)}
                      title="Remove"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addGroupRow}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Add component
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Student Access */}
      <section>
        <h2 className="mb-4 text-sm font-semibold">Student Access</h2>
        <div className="space-y-6 rounded-xl border border-border p-5">

          {/* Join Codes */}
          <div>
            <div className="mb-3">
              <p className="text-sm font-medium">Join Codes</p>
              <p className="text-xs text-muted-foreground">
                Share a section code so students can join via the student app.
              </p>
            </div>
            {sectionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : sections.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No sections yet. Create a section first.
              </p>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <div
                    key={section._id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{section.name}</p>
                      {section.joinCode ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          {section.joinCode}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/50">No code yet</p>
                      )}
                    </div>
                    {section.joinCode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0"
                        onClick={() => handleCopyCode(section)}
                      >
                        {copiedCodeId === section._id ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant={section.joinCode ? "ghost" : "outline"}
                      size={section.joinCode ? "icon" : "sm"}
                      className={section.joinCode ? "size-8 shrink-0" : "shrink-0"}
                      disabled={generatingCodeId === section._id}
                      onClick={() => handleGenerateCode(section)}
                    >
                      {generatingCodeId === section._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : section.joinCode ? (
                        <RefreshCw className="size-4" />
                      ) : (
                        <>
                          <Hash className="mr-1.5 size-3.5" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Invite Link */}
          <div>
            <div className="mb-3">
              <p className="text-sm font-medium">Invite Link</p>
              <p className="text-xs text-muted-foreground">
                Generate a one-time link to enrol students directly into a section.
              </p>
            </div>
            {invitation ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <Label className="text-xs text-muted-foreground">Invite Link</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                      {inviteUrl}
                    </code>
                    <Button size="icon" variant="ghost" className="size-8 shrink-0" onClick={handleCopyInvite}>
                      {copiedInvite ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link className="size-3" />
                    {invitation.expiresAt
                      ? `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`
                      : "Never expires"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInvitation(null)
                      setInviteSectionId("")
                    }}
                  >
                    New Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Section</Label>
                    <Select value={inviteSectionId} onValueChange={setInviteSectionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Expires in (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Leave empty — no expiry"
                      value={inviteExpiry}
                      onChange={(e) => setInviteExpiry(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleGenerateInvite}
                    disabled={generatingInvite || !inviteSectionId}
                  >
                    {generatingInvite ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 size-4" />
                    )}
                    Generate Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Activity Log */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Activity Log</h2>
        <div className="rounded-xl border p-5">
          {auditLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            <div className="divide-y">
              {auditLogs.map((entry) => (
                <div key={entry._id} className="flex items-center gap-3 py-2.5">
                  <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px]">
                    {(entry.userId as any)?.name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">
                      <span className="font-medium">
                        {(entry.userId as any)?.name ?? "Unknown"}
                      </span>{" "}
                      {actionLabel[entry.action] ?? entry.action}
                      {entry.changes && (
                        <span className="ml-1 text-muted-foreground">
                          ({Object.keys(entry.changes).join(", ")})
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(entry.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {auditHasMore && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAuditLimit((prev) => prev + 20)}
                  className="mt-3 w-full border-dashed text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  Load more
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-destructive">Danger Zone</h2>
        <div className="space-y-4 rounded-xl border border-destructive/20 p-5">
          {/* Archive */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Archive this course</p>
              <p className="text-xs text-muted-foreground">
                Students will still have access. You can unarchive anytime.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={course.isArchived}>
                  <Archive className="mr-2 size-4" />
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <Archive className="size-5" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Archive course?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to archive{" "}
                    <span className="font-medium text-foreground">{course.name}</span>?
                    Students will still have access. You can unarchive from the courses list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive} disabled={archiving}>
                    {archiving ? "Archiving..." : "Archive"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Separator />

          {/* Delete */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete this course</p>
              <p className="text-xs text-muted-foreground">
                This action is irreversible. All data will be permanently removed.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <AlertTriangle className="size-5 text-destructive" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Delete course?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete{" "}
                    <span className="font-medium text-foreground">{course.name}</span>{" "}
                    and all associated data including sections, enrollments, and files.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </div>
  )
}
