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
  ChevronDown,
  Hash,
  Calendar,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
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
import { updateCourse, archiveCourse, deleteCourse, type Course } from "@/lib/services/courses"
import { updateCourseSchema } from "@workspace/validators"
import {
  uploadToCloudinary,
  uploadDocumentToCloudinary,
} from "@/lib/utils/upload"
import { timeAgo } from "@/lib/utils/time"
import { useRouter } from "next/navigation"

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
    !!syllabusFile

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
      })

      toast.success("Course updated")
      onUpdated()
    } catch {
      toast.error("Failed to update course")
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
