"use client"

import * as React from "react"
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  ChevronRight,
  AlertTriangle,
  FileText,
  Video,
  Link2,
  ExternalLink,
  File,
  Upload,
  X,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
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
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  type Module,
} from "@/lib/services/modules"
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  getLessonById,
  type Lesson,
} from "@/lib/services/lessons"
import { uploadLessonFile, getCourseFiles, type CourseFile } from "@/lib/services/drive"
import { RichTextEditor } from "@/components/rich-text-editor"
import { LessonPreviewDialog } from "@/components/common/lesson-preview-dialog"

const TYPE_ICON: Record<string, React.ElementType> = {
  page: FileText,
  video: Video,
  file: File,
  embed: Link2,
  link: ExternalLink,
}

const TYPE_CHIP_BG: Record<string, string> = {
  page:  "bg-blue-500/10 dark:bg-blue-500/20",
  video: "bg-violet-500/10 dark:bg-violet-500/20",
  file:  "bg-amber-500/10 dark:bg-amber-500/20",
  embed: "bg-emerald-500/10 dark:bg-emerald-500/20",
  link:  "bg-teal-500/10 dark:bg-teal-500/20",
}

const TYPE_CHIP_COLOR: Record<string, string> = {
  page:  "text-blue-600 dark:text-blue-400",
  video: "text-violet-600 dark:text-violet-400",
  file:  "text-amber-600 dark:text-amber-400",
  embed: "text-emerald-600 dark:text-emerald-400",
  link:  "text-teal-600 dark:text-teal-400",
}

interface NewLessonDraft {
  localId: string
  title: string
  type: "page" | "video" | "file" | "embed" | "link"
  content: string
  fileId: string | null
  fileName: string | null
}

interface ModulesManagerProps {
  courseId: string
}

// ─── Draft lesson row (used only inside the module creation form) ────────────

interface DraftLessonRowProps {
  draft: NewLessonDraft
  courseId: string
  onChange: (patch: Partial<Omit<NewLessonDraft, "localId">>) => void
  onRemove: () => void
}

function DraftLessonRow({ draft, courseId, onChange, onRemove }: DraftLessonRowProps) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-2.5">
      <div className="flex items-center gap-2">
        <Select
          value={draft.type}
          onValueChange={(v) => onChange({ type: v as NewLessonDraft["type"] })}
        >
          <SelectTrigger className="h-7 w-28 shrink-0 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="page">Page</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="file">File</SelectItem>
            <SelectItem value="embed">Embed</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Lesson title"
          className="h-7 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-muted-foreground/40 transition-colors hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="mt-2">
        <LessonContentField
          type={draft.type}
          value={draft.content}
          onChange={(v) => onChange({ content: v })}
          courseId={courseId}
          fileId={draft.fileId}
          fileName={draft.fileName}
          onFileChange={(id, name) => onChange({ fileId: id, fileName: name })}
        />
      </div>
    </div>
  )
}

// ─── Sortable lesson row ─────────────────────────────────────────────────────

interface SortableLessonRowProps {
  lesson: Lesson
  courseId: string
  onEdit: (lesson: Lesson) => void
  onDelete: (lesson: Lesson) => void
  onTogglePublish: (lesson: Lesson) => void
  onPreview: (lessonId: string) => void
  editingLessonId: string | null
  lessonTitle: string
  setLessonTitle: (v: string) => void
  lessonContent: string
  setLessonContent: (v: string) => void
  lessonType: "page" | "video" | "file" | "embed" | "link"
  setLessonType: (v: "page" | "video" | "file" | "embed" | "link") => void
  lessonFileId: string | null
  lessonFileName: string | null
  setLessonFile: (id: string | null, name: string | null) => void
  lessonSubmitting: boolean
  onSave: (lesson: Lesson) => void
  onCancelEdit: () => void
}

function SortableLessonRow({
  lesson,
  courseId,
  onEdit,
  onDelete,
  onTogglePublish,
  onPreview,
  editingLessonId,
  lessonTitle,
  setLessonTitle,
  lessonContent,
  setLessonContent,
  lessonType,
  setLessonType,
  lessonFileId,
  lessonFileName,
  setLessonFile,
  lessonSubmitting,
  onSave,
  onCancelEdit,
}: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const [lessonDeleteOpen, setLessonDeleteOpen] = React.useState(false)
  const LessonIcon = TYPE_ICON[lesson.type] ?? FileText

  if (editingLessonId === lesson._id) {
    return (
      <div ref={setNodeRef} style={style} className="rounded-lg border border-border bg-muted/20 p-3">
        <Input
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          placeholder="Lesson title"
          className="mb-2 border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />
        <div className="mb-2">
          <Select
            value={lessonType}
            onValueChange={(v) => setLessonType(v as "page" | "video" | "file" | "embed" | "link")}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="file">File</SelectItem>
              <SelectItem value="embed">Embed</SelectItem>
              <SelectItem value="link">Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <LessonContentField
          type={lessonType}
          value={lessonContent}
          onChange={setLessonContent}
          courseId={courseId}
          fileId={lessonFileId}
          fileName={lessonFileName}
          onFileChange={setLessonFile}
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancelEdit} disabled={lessonSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(lesson)} disabled={lessonSubmitting}>
            {lessonSubmitting ? <Loader2 className="size-3 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/30"
    >
      {/* Drag handle — revealed on hover */}
      <button
        type="button"
        className="touch-none cursor-grab opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground/50 hover:text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>

      {/* Type chip */}
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${TYPE_CHIP_BG[lesson.type] ?? "bg-muted"} ${TYPE_CHIP_COLOR[lesson.type] ?? "text-muted-foreground"}`}
      >
        <LessonIcon className="size-2.5" />
        {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
      </span>

      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>

      {/* Draft badge — always visible */}
      {!lesson.isPublished && (
        <Badge variant="outline" className="h-4 shrink-0 rounded-full px-1.5 py-0 text-[10px] font-normal">
          Draft
        </Badge>
      )}

      {/* Action cluster — revealed on hover */}
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6">
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onPreview(lesson._id)}>
              <Eye className="mr-2 size-3.5" />Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePublish(lesson)}>
              {lesson.isPublished ? (
                <><EyeOff className="mr-2 size-3.5" />Set to draft</>
              ) : (
                <><Eye className="mr-2 size-3.5" />Publish</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(lesson)}>
              <Pencil className="mr-2 size-3.5" />Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setLessonDeleteOpen(true)}>
              <Trash2 className="mr-2 size-3.5" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Controlled delete dialog */}
      <AlertDialog open={lessonDeleteOpen} onOpenChange={setLessonDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="size-5 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{lesson.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onDelete(lesson)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ─── Type-aware content field ────────────────────────────────────────────────

function LessonContentField({
  type,
  value,
  onChange,
  courseId,
  fileId,
  fileName,
  onFileChange,
}: {
  type: "page" | "video" | "file" | "embed" | "link"
  value: string
  onChange: (v: string) => void
  courseId: string
  fileId: string | null
  fileName: string | null
  onFileChange: (id: string | null, name: string | null) => void
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [existingFiles, setExistingFiles] = React.useState<CourseFile[]>([])
  const [showPicker, setShowPicker] = React.useState(false)
  const [pickerLoading, setPickerLoading] = React.useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadLessonFile(courseId, file)
      onFileChange(result._id, result.name)
      toast.success("File uploaded")
    } catch (err: any) {
      const msg = err?.message || "Upload failed"
      if (err?.type === "auth" || msg.includes("reconnect") || msg.includes("authentication failed")) {
        toast.error("Google Drive authentication expired. Please reconnect in Settings.")
      } else {
        toast.error(msg)
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleShowPicker() {
    setShowPicker(true)
    if (existingFiles.length === 0) {
      setPickerLoading(true)
      try {
        const files = await getCourseFiles(courseId, "materials")
        setExistingFiles(files.filter((f) => !f.isFolder))
      } catch {
        toast.error("Failed to load files")
      } finally {
        setPickerLoading(false)
      }
    }
  }

  if (type === "page") {
    return (
      <div className="mb-2">
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder="Write lesson content…"
        />
      </div>
    )
  }
  if (type === "video" || type === "embed") {
    return (
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={type === "video" ? "Video URL (YouTube, Vimeo…)" : "Embed URL"}
        className="mb-2"
      />
    )
  }
  if (type === "link") {
    return (
      <Input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="mb-2"
      />
    )
  }

  // file type
  return (
    <div className="mb-2 space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
      />
      {fileId && fileName ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <File className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="min-w-0 flex-1 truncate text-xs font-medium">{fileName}</span>
          <button
            type="button"
            onClick={() => onFileChange(null, null)}
            className="text-muted-foreground/50 transition-colors hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 size-3 animate-spin" />
            ) : (
              <Upload className="mr-1.5 size-3" />
            )}
            {uploading ? "Uploading…" : "Upload file"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={handleShowPicker}
            disabled={uploading}
          >
            Pick existing
          </Button>
        </div>
      )}
      {showPicker && (
        <div className="rounded-lg border border-border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-medium">Course materials</span>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="text-muted-foreground/50 hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {pickerLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            ) : existingFiles.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">No materials uploaded yet</p>
            ) : (
              existingFiles.map((f) => (
                <button
                  key={f._id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                  onClick={() => {
                    onFileChange(f._id, f.name)
                    setShowPicker(false)
                  }}
                >
                  <File className="size-3 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sortable module row ─────────────────────────────────────────────────────

interface SortableModuleRowProps {
  mod: Module
  index: number
  courseId: string
  lessonCount: number | null
  isExpanded: boolean
  onToggleExpand: () => void
  lessons: Lesson[] | undefined
  lessonsLoading: boolean
  onTogglePublish: () => void
  onEdit: () => void
  onDelete: () => void
  // lesson actions passed down
  editingLessonId: string | null
  lessonTitle: string
  setLessonTitle: (v: string) => void
  lessonContent: string
  setLessonContent: (v: string) => void
  lessonType: "page" | "video" | "file" | "embed" | "link"
  setLessonType: (v: "page" | "video" | "file" | "embed" | "link") => void
  lessonFileId: string | null
  lessonFileName: string | null
  setLessonFile: (id: string | null, name: string | null) => void
  lessonSubmitting: boolean
  creatingLesson: string | null
  setCreatingLesson: (id: string | null) => void
  onStartLessonEdit: (lesson: Lesson) => void
  onCancelLessonEdit: () => void
  onSaveLesson: (lesson: Lesson) => void
  onDeleteLesson: (lesson: Lesson) => void
  onToggleLessonPublish: (lesson: Lesson) => void
  onPreviewLesson: (lessonId: string) => void
  onCreateLesson: (moduleId: string) => void
  onLessonDragEnd: (moduleId: string, event: DragEndEvent) => void
}

function SortableModuleRow({
  mod,
  index,
  courseId,
  lessonCount,
  isExpanded,
  onToggleExpand,
  lessons,
  lessonsLoading,
  onTogglePublish,
  onEdit,
  onDelete,
  editingLessonId,
  lessonTitle,
  setLessonTitle,
  lessonContent,
  setLessonContent,
  lessonType,
  setLessonType,
  lessonFileId,
  lessonFileName,
  setLessonFile,
  lessonSubmitting,
  creatingLesson,
  setCreatingLesson,
  onStartLessonEdit,
  onCancelLessonEdit,
  onSaveLesson,
  onDeleteLesson,
  onToggleLessonPublish,
  onPreviewLesson,
  onCreateLesson,
  onLessonDragEnd,
}: SortableModuleRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: mod._id })

  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const sensors = useSensors(useSensor(PointerSensor))

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const sortedLessons = React.useMemo(
    () => [...(lessons ?? [])].sort((a, b) => a.order - b.order),
    [lessons]
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-card transition-colors hover:bg-muted/20"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Drag handle */}
        <button
          type="button"
          className="touch-none cursor-grab text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Full-width expand trigger */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <ChevronRight
            className={`size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{index + 1}.</span>
              <span className="truncate text-sm font-semibold">{mod.title}</span>
              {!mod.isPublished && (
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Draft
                </span>
              )}
            </div>
            {!isExpanded && lessonCount != null && (
              <p className="mt-0.5 text-xs text-muted-foreground/60">
                {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
              </p>
            )}
            {isExpanded && mod.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{mod.description}</p>
            )}
          </div>
        </button>

        {/* Single DropdownMenu replaces 3 icon buttons */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0 text-muted-foreground">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onTogglePublish}>
              {mod.isPublished ? (
                <><EyeOff className="mr-2 size-3.5" />Set to draft</>
              ) : (
                <><Eye className="mr-2 size-3.5" />Publish</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 size-3.5" />Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 size-3.5" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Controlled delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="size-5 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{mod.title}&quot; and all its lessons. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border px-4 pb-3 pt-2">
          <div className="space-y-1">
            {lessonsLoading ? (
              <div className="space-y-2 py-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => onLessonDragEnd(mod._id, e)}
              >
                <SortableContext
                  items={sortedLessons.map((l) => l._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedLessons.map((lesson) => (
                    <SortableLessonRow
                      key={lesson._id}
                      lesson={lesson}
                      courseId={courseId}
                      onEdit={onStartLessonEdit}
                      onDelete={onDeleteLesson}
                      onTogglePublish={onToggleLessonPublish}
                      onPreview={onPreviewLesson}
                      editingLessonId={editingLessonId}
                      lessonTitle={lessonTitle}
                      setLessonTitle={setLessonTitle}
                      lessonContent={lessonContent}
                      setLessonContent={setLessonContent}
                      lessonType={lessonType}
                      setLessonType={setLessonType}
                      lessonFileId={lessonFileId}
                      lessonFileName={lessonFileName}
                      setLessonFile={setLessonFile}
                      lessonSubmitting={lessonSubmitting}
                      onSave={onSaveLesson}
                      onCancelEdit={onCancelLessonEdit}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            {creatingLesson === mod._id && (
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <Input
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Lesson title"
                  className="mb-2 border-0 bg-transparent px-0 text-sm font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
                />
                <div className="mb-2">
                  <Select
                    value={lessonType}
                    onValueChange={(v) => setLessonType(v as "page" | "video" | "file" | "embed" | "link")}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="embed">Embed</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <LessonContentField
                  type={lessonType}
                  value={lessonContent}
                  onChange={setLessonContent}
                  courseId={courseId}
                  fileId={lessonFileId}
                  fileName={lessonFileName}
                  onFileChange={setLessonFile}
                />
                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreatingLesson(null)
                      setLessonTitle("")
                      setLessonContent("")
                      setLessonType("page")
                      setLessonFile(null, null)
                    }}
                    disabled={lessonSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => onCreateLesson(mod._id)} disabled={lessonSubmitting}>
                    {lessonSubmitting ? <Loader2 className="size-3 animate-spin" /> : "Create Lesson"}
                  </Button>
                </div>
              </div>
            )}

            {creatingLesson !== mod._id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreatingLesson(mod._id)}
                className="mt-1 text-xs text-muted-foreground"
              >
                <Plus className="mr-1 size-3" />
                Add Lesson
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ModulesManager({ courseId }: ModulesManagerProps) {
  const sensors = useSensors(useSensor(PointerSensor))

  const [modules, setModules] = React.useState<Module[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  const [lessonsCache, setLessonsCache] = React.useState<Record<string, Lesson[]>>({})
  const [lessonsLoading, setLessonsLoading] = React.useState<Record<string, boolean>>({})
  const [creatingLesson, setCreatingLesson] = React.useState<string | null>(null)
  const [editingLessonId, setEditingLessonId] = React.useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = React.useState("")
  const [lessonContent, setLessonContent] = React.useState("")
  const [lessonType, setLessonType] = React.useState<"page" | "video" | "file" | "embed" | "link">("page")
  const [lessonFileId, setLessonFileId] = React.useState<string | null>(null)
  const [lessonFileName, setLessonFileName] = React.useState<string | null>(null)
  const [lessonSubmitting, setLessonSubmitting] = React.useState(false)
  const [newLessonDrafts, setNewLessonDrafts] = React.useState<NewLessonDraft[]>([])

  const [previewLesson, setPreviewLesson] = React.useState<Lesson | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)

  function setLessonFile(id: string | null, name: string | null) {
    setLessonFileId(id)
    setLessonFileName(name)
  }

  function addDraftLesson() {
    setNewLessonDrafts((prev) => [
      ...prev,
      { localId: crypto.randomUUID(), title: "", type: "page", content: "", fileId: null, fileName: null },
    ])
  }

  function updateDraftLesson(localId: string, patch: Partial<Omit<NewLessonDraft, "localId">>) {
    setNewLessonDrafts((prev) => prev.map((d) => (d.localId === localId ? { ...d, ...patch } : d)))
  }

  function removeDraftLesson(localId: string) {
    setNewLessonDrafts((prev) => prev.filter((d) => d.localId !== localId))
  }

  const fetchModules = React.useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getModules(courseId)
      setModules(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const fetchLessons = React.useCallback(async (moduleId: string) => {
    setLessonsLoading((prev) => ({ ...prev, [moduleId]: true }))
    try {
      const data = await getLessons(moduleId)
      setLessonsCache((prev) => ({ ...prev, [moduleId]: data }))
    } catch {
      toast.error("Failed to load lessons")
    } finally {
      setLessonsLoading((prev) => ({ ...prev, [moduleId]: false }))
    }
  }, [])

  React.useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const sorted = React.useMemo(
    () => [...modules].sort((a, b) => a.order - b.order),
    [modules]
  )

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        if (!lessonsCache[id]) fetchLessons(id)
      }
      return next
    })
  }

  // ── Module drag-and-drop ──────────────────────────────────────────────────

  async function handleModuleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sorted.findIndex((m) => m._id === active.id)
    const newIndex = sorted.findIndex((m) => m._id === over.id)
    const reordered = arrayMove(sorted, oldIndex, newIndex)
    setModules(reordered)
    try {
      await reorderModules(courseId, reordered.map((m) => m._id))
    } catch {
      toast.error("Failed to reorder modules")
      fetchModules()
    }
  }

  // ── Lesson drag-and-drop ──────────────────────────────────────────────────

  async function handleLessonDragEnd(moduleId: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const current = lessonsCache[moduleId] ?? []
    const sorted = [...current].sort((a, b) => a.order - b.order)
    const oldIndex = sorted.findIndex((l) => l._id === active.id)
    const newIndex = sorted.findIndex((l) => l._id === over.id)
    const reordered = arrayMove(sorted, oldIndex, newIndex)
    setLessonsCache((prev) => ({ ...prev, [moduleId]: reordered }))
    try {
      await reorderLessons(moduleId, reordered.map((l) => l._id))
    } catch {
      toast.error("Failed to reorder lessons")
      fetchLessons(moduleId)
    }
  }

  // ── Lesson CRUD ───────────────────────────────────────────────────────────

  async function handleCreateLesson(moduleId: string) {
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required")
      return
    }
    setLessonSubmitting(true)
    try {
      await createLesson({
        moduleId,
        title: lessonTitle.trim(),
        content: lessonContent.trim() || undefined,
        type: lessonType,
        fileId: lessonFileId ?? undefined,
      })
      setLessonTitle("")
      setLessonContent("")
      setLessonType("page")
      setLessonFile(null, null)
      setCreatingLesson(null)
      toast.success("Lesson created")
      fetchLessons(moduleId)
    } catch {
      toast.error("Failed to create lesson")
    } finally {
      setLessonSubmitting(false)
    }
  }

  async function handleUpdateLesson(lesson: Lesson) {
    if (!lessonTitle.trim()) {
      toast.error("Lesson title is required")
      return
    }
    setLessonSubmitting(true)
    try {
      await updateLesson(lesson._id, {
        title: lessonTitle.trim(),
        content: lessonContent.trim() || undefined,
        type: lessonType,
        fileId: lessonFileId,
      })
      setEditingLessonId(null)
      setLessonTitle("")
      setLessonContent("")
      setLessonType("page")
      setLessonFile(null, null)
      toast.success("Lesson updated")
      fetchLessons(lesson.moduleId)
    } catch {
      toast.error("Failed to update lesson")
    } finally {
      setLessonSubmitting(false)
    }
  }

  async function handleDeleteLesson(lesson: Lesson) {
    try {
      await deleteLesson(lesson._id)
      toast.success("Lesson deleted")
      fetchLessons(lesson.moduleId)
    } catch {
      toast.error("Failed to delete lesson")
    }
  }

  async function handleToggleLessonPublish(lesson: Lesson) {
    try {
      await updateLesson(lesson._id, { isPublished: !lesson.isPublished })
      fetchLessons(lesson.moduleId)
    } catch {
      toast.error("Failed to update lesson")
    }
  }

  async function handlePreviewLesson(lessonId: string) {
    try {
      const lesson = await getLessonById(lessonId)

      if (lesson.type === "video" || lesson.type === "embed") {
        if (lesson.content) window.open(lesson.content, "_blank")
        return
      }

      if (lesson.type === "page" || (lesson.type === "file" && lesson.fileId?.mimeType === "application/pdf")) {
        setPreviewLesson(lesson)
        setPreviewOpen(true)
        return
      }

      if (lesson.type === "file" && lesson.fileId?.driveFileId) {
        window.open(`https://drive.google.com/uc?id=${lesson.fileId.driveFileId}&export=download`, "_blank")
      }
    } catch {
      toast.error("Failed to load lesson preview")
    }
  }

  function startLessonEdit(lesson: Lesson) {
    setEditingLessonId(lesson._id)
    setLessonTitle(lesson.title)
    setLessonContent(lesson.content ?? "")
    setLessonType(lesson.type)
    setLessonFile(lesson.fileId?._id ?? null, lesson.fileId?.name ?? null)
  }

  function cancelLessonEdit() {
    setEditingLessonId(null)
    setLessonTitle("")
    setLessonContent("")
    setLessonType("page")
    setLessonFile(null, null)
  }

  // ── Module CRUD ───────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Module title is required")
      return
    }
    setSubmitting(true)
    try {
      const newMod = await createModule({
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        order: modules.length,
      })
      const validDrafts = newLessonDrafts.filter((d) => d.title.trim() !== "")
      if (validDrafts.length > 0) {
        await Promise.all(
          validDrafts.map((d, i) =>
            createLesson({
              moduleId: newMod._id,
              title: d.title.trim(),
              content: d.content.trim() || undefined,
              type: d.type,
              order: i,
              fileId: d.fileId ?? undefined,
            })
          )
        )
      }
      setTitle("")
      setDescription("")
      setNewLessonDrafts([])
      setCreating(false)
      setExpandedIds((prev) => new Set([...prev, newMod._id]))
      await fetchModules()
      if (validDrafts.length > 0) fetchLessons(newMod._id)
      toast.success(
        validDrafts.length > 0
          ? `Module created with ${validDrafts.length} lesson${validDrafts.length !== 1 ? "s" : ""}`
          : "Module created"
      )
    } catch {
      toast.error("Failed to create module")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(mod: Module) {
    if (!title.trim()) {
      toast.error("Module title is required")
      return
    }
    setSubmitting(true)
    try {
      await updateModule(courseId, mod._id, {
        title: title.trim(),
        description: description.trim() || undefined,
      })
      setEditingId(null)
      setTitle("")
      setDescription("")
      toast.success("Module updated")
      fetchModules()
    } catch {
      toast.error("Failed to update module")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTogglePublish(mod: Module) {
    try {
      await updateModule(courseId, mod._id, { isPublished: !mod.isPublished })
      fetchModules()
    } catch {
      toast.error("Failed to update module")
    }
  }

  async function handleDelete(mod: Module) {
    try {
      await deleteModule(courseId, mod._id)
      toast.success("Module deleted")
      fetchModules()
    } catch {
      toast.error("Failed to delete module")
    }
  }

  function startEdit(mod: Module) {
    setEditingId(mod._id)
    setTitle(mod.title)
    setDescription(mod.description ?? "")
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle("")
    setDescription("")
  }

  // ── Render ────────────────────────────────────────────────────────────────

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
        <p className="text-sm text-muted-foreground">Failed to load modules</p>
        <Button variant="outline" size="sm" onClick={fetchModules}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {sorted.length} module{sorted.length !== 1 ? "s" : ""}
        </span>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" />
            New Module
          </Button>
        )}
      </div>

      {creating && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="Module title"
            className="mb-2 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Module description (optional)"
            rows={2}
            className="w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />

          {newLessonDrafts.length > 0 && (
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Lessons</p>
              {newLessonDrafts.map((draft) => (
                <DraftLessonRow
                  key={draft.localId}
                  draft={draft}
                  courseId={courseId}
                  onChange={(patch) => updateDraftLesson(draft.localId, patch)}
                  onRemove={() => removeDraftLesson(draft.localId)}
                />
              ))}
            </div>
          )}

          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={addDraftLesson}
              className="h-7 text-xs text-muted-foreground"
            >
              <Plus className="mr-1 size-3" />
              Add Lesson
            </Button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreating(false)
                setTitle("")
                setDescription("")
                setNewLessonDrafts([])
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Module"
              )}
            </Button>
          </div>
        </div>
      )}

      {sorted.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No modules yet</p>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" />
            Create your first module
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext
            items={sorted.map((m) => m._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sorted.map((mod, index) =>
                editingId === mod._id ? (
                  <div
                    key={mod._id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Module title"
                      className="mb-3 border-0 bg-transparent px-0 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0"
                    />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Module description (optional)"
                      rows={2}
                      className="w-full resize-none border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
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
                        onClick={() => handleUpdate(mod)}
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
                  <SortableModuleRow
                    key={mod._id}
                    mod={mod}
                    index={index}
                    courseId={courseId}
                    lessonCount={lessonsCache[mod._id]?.length ?? null}
                    isExpanded={expandedIds.has(mod._id)}
                    onToggleExpand={() => toggleExpanded(mod._id)}
                    lessons={lessonsCache[mod._id]}
                    lessonsLoading={!!lessonsLoading[mod._id]}
                    onTogglePublish={() => handleTogglePublish(mod)}
                    onEdit={() => startEdit(mod)}
                    onDelete={() => handleDelete(mod)}
                    editingLessonId={editingLessonId}
                    lessonTitle={lessonTitle}
                    setLessonTitle={setLessonTitle}
                    lessonContent={lessonContent}
                    setLessonContent={setLessonContent}
                    lessonType={lessonType}
                    setLessonType={setLessonType}
                    lessonFileId={lessonFileId}
                    lessonFileName={lessonFileName}
                    setLessonFile={setLessonFile}
                    lessonSubmitting={lessonSubmitting}
                    creatingLesson={creatingLesson}
                    setCreatingLesson={setCreatingLesson}
                    onStartLessonEdit={startLessonEdit}
                    onCancelLessonEdit={cancelLessonEdit}
                    onSaveLesson={handleUpdateLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onToggleLessonPublish={handleToggleLessonPublish}
                    onPreviewLesson={handlePreviewLesson}
                    onCreateLesson={handleCreateLesson}
                    onLessonDragEnd={handleLessonDragEnd}
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <LessonPreviewDialog
        lesson={previewLesson}
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open)
          if (!open) setPreviewLesson(null)
        }}
      />
    </div>
  )
}
