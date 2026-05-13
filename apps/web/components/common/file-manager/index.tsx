"use client"

import * as React from "react"
import {
  File,
  FileText,
  Folder,
  Trash2,
  Pencil,
  Download,
  Upload,
  Plus,
  Loader2,
  Cloud,
  HardDrive,
  Film,
  Music,
  FileArchive,
  FileType,
  LayoutGrid,
  List,
  ChevronRight,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
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
import { Input } from "@workspace/ui/components/input"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"
import { linkGoogleDrive } from "@/lib/config/auth-client"
import {
  getDriveStatus,
  setupDrive,
  setupCourseFolders,
  getCourseFiles,
  uploadFile,
  createFolder,
  getDownloadLink,
  getStreamUrl,
  deleteCourseFile,
  renameCourseFile,
  moveCourseFile,
  moveCourseFileToRoot,
  type DriveStatus,
  type CourseFile,
} from "@/lib/services/drive"
import { FilePreviewDialog } from "../file-preview-dialog"
import { timeAgo } from "@/lib/utils/time"

const FOLDER_TABS = [
  { id: "materials", label: "Materials", icon: Folder },
  { id: "activities", label: "Activities", icon: FileText },
  { id: "submissions", label: "Submissions", icon: Upload },
] as const

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DriveConnectCard() {
  const [linking, setLinking] = React.useState(false)

  const handleConnect = () => {
    setLinking(true)
    linkGoogleDrive(window.location.href)
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border p-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
        <HardDrive className="size-7 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold">Connect Google Drive</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your Google Drive to manage course files. A &ldquo;Klasee
          LMS&rdquo; folder will be created automatically.
        </p>
      </div>
      <Button onClick={handleConnect} disabled={linking}>
        {linking && <Loader2 className="mr-2 size-4 animate-spin" />}
        {linking ? "Connecting..." : "Connect Google Drive"}
      </Button>
    </div>
  )
}

function fileTypeIcon(mime: string) {
  if (mime.startsWith("video/")) return <Film className="size-12" />
  if (mime.startsWith("audio/")) return <Music className="size-12" />
  if (mime.includes("pdf")) return <FileType className="size-12" />
  if (mime.includes("zip") || mime.includes("rar"))
    return <FileArchive className="size-12" />
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("presentation")
  )
    return <FileText className="size-12" />
  return <File className="size-12" />
}

const DRAGGED_FILE_KEY = "courseFileId"

function FileCard({
  file,
  onDeleteRequest,
  onRenamed,
  onPreview,
  onNavigate,
  onMoveFile,
  movingFile,
}: {
  file: CourseFile
  onDeleteRequest: (file: CourseFile) => void
  onRenamed: () => void
  onPreview: (file: CourseFile) => void
  onNavigate?: (file: CourseFile) => void
  onMoveFile?: (fileId: string, targetFolderDbId: string) => void
  movingFile: boolean
}) {
  const [renaming, setRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(file.name)
  const [nameError, setNameError] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [imgError, setImgError] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)

  const isImage = file.mimeType.startsWith("image/")
  const thumbnailSrc =
    file.source === "drive" && file.driveFileId
      ? getStreamUrl(file.driveFileId)
      : file.source === "cloudinary"
        ? file.cloudinaryUrl
        : null

  const handleRename = async () => {
    if (!newName.trim()) {
      setNameError("Name cannot be empty")
      return
    }
    if (newName === file.name) {
      setRenaming(false)
      return
    }
    setNameError("")
    setSaving(true)
    try {
      await renameCourseFile(file._id, newName.trim())
      toast.success("File renamed")
      onRenamed()
      setRenaming(false)
    } catch {
      toast.error("Failed to rename file")
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (file.source === "drive" && file.driveFileId) {
      try {
        const link = await getDownloadLink(file.driveFileId)
        if (link.webContentLink) {
          window.open(link.webContentLink, "_blank")
        } else {
          window.open(getStreamUrl(file.driveFileId), "_blank")
        }
      } catch {
        toast.error("Failed to get download link")
      }
    } else if (file.source === "cloudinary" && file.cloudinaryUrl) {
      window.open(file.cloudinaryUrl, "_blank")
    }
  }

  const handleClick = () => {
    if (file.isFolder && onNavigate) {
      onNavigate(file)
    } else {
      onPreview(file)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (file.isFolder || movingFile) return
    e.dataTransfer.setData(DRAGGED_FILE_KEY, file._id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!file.isFolder) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const draggedId = e.dataTransfer.getData(DRAGGED_FILE_KEY)
    if (draggedId && draggedId !== file._id && onMoveFile && !movingFile) {
      onMoveFile(draggedId, file._id)
    }
  }

  return (
    <div
      className={cn(
        "group relative rounded-lg border transition-colors",
        file.isFolder
          ? dragOver
            ? "border-primary border-2 bg-primary/5"
            : "border-border hover:border-primary/50"
          : "border-border hover:border-primary/50"
      )}
      draggable={!file.isFolder && !movingFile}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left"
      >
        <div className="flex aspect-3/2 items-center justify-center overflow-hidden rounded-t-lg bg-muted/30">
          <div className="flex flex-col items-center gap-1 text-muted-foreground/60">
            {file.isFolder ? (
              <Folder className="size-12 text-amber-500" />
            ) : isImage && thumbnailSrc && !imgError ? (
              <img
                src={thumbnailSrc}
                alt={file.name}
                className="size-12 rounded object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              fileTypeIcon(file.mimeType)
            )}
            <span className="text-[10px] font-medium uppercase tracking-wider">
              {file.isFolder
                ? "folder"
                : file.mimeType.split("/")[1]?.split(".")[0] ?? "file"}
            </span>
          </div>
        </div>

        <div className="space-y-1 p-3">
          {renaming ? (
            <div onClick={(e) => e.stopPropagation()}>
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  if (e.target.value.trim()) setNameError("")
                }}
                className={cn("h-7 text-sm", nameError && "border-destructive")}
                autoFocus
                disabled={saving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  if (e.key === "Escape") { setRenaming(false); setNameError("") }
                }}
              />
              {nameError && (
                <p className="mt-0.5 text-xs text-destructive">{nameError}</p>
              )}
              <div className="mt-1 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={handleRename}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => { setRenaming(false); setNameError("") }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="truncate text-sm font-medium">{file.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {!file.isFolder && (
                  <>
                    <span>{formatSize(file.size)}</span>
                    <span>·</span>
                  </>
                )}
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] font-normal"
                >
                  {file.source === "drive" ? (
                    <HardDrive className="mr-1 size-2.5" />
                  ) : (
                    <Cloud className="mr-1 size-2.5" />
                  )}
                  {file.source}
                </Badge>
              </div>
            </>
          )}
        </div>
      </button>

      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        {!file.isFolder && (
          <Button
            variant="secondary"
            size="icon-sm"
            className="size-7 bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }}
          >
            <Download className="size-3.5" />
          </Button>
        )}
        <Button
          variant="secondary"
          size="icon-sm"
          className="size-7 bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            setNewName(file.name)
            setNameError("")
            setRenaming(true)
          }}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          className="size-7 bg-background/80 text-destructive backdrop-blur-sm hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDeleteRequest(file)
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

function smallFileIcon(mime: string) {
  if (mime.startsWith("video/")) return <Film className="size-5" />
  if (mime.startsWith("audio/")) return <Music className="size-5" />
  if (mime.includes("pdf")) return <FileType className="size-5" />
  if (mime.includes("zip") || mime.includes("rar"))
    return <FileArchive className="size-5" />
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("presentation")
  )
    return <FileText className="size-5" />
  return <File className="size-5" />
}

function FileRow({
  file,
  onDeleteRequest,
  onRenamed,
  onPreview,
  onNavigate,
  onMoveFile,
  movingFile,
}: {
  file: CourseFile
  onDeleteRequest: (file: CourseFile) => void
  onRenamed: () => void
  onPreview: (file: CourseFile) => void
  onNavigate?: (file: CourseFile) => void
  onMoveFile?: (fileId: string, targetFolderDbId: string) => void
  movingFile: boolean
}) {
  const [renaming, setRenaming] = React.useState(false)
  const [newName, setNewName] = React.useState(file.name)
  const [nameError, setNameError] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [imgError, setImgError] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)

  const isImage = file.mimeType.startsWith("image/")
  const thumbnailSrc =
    file.source === "drive" && file.driveFileId
      ? getStreamUrl(file.driveFileId)
      : file.source === "cloudinary"
        ? file.cloudinaryUrl
        : null

  const handleRename = async () => {
    if (!newName.trim()) {
      setNameError("Name cannot be empty")
      return
    }
    if (newName === file.name) {
      setRenaming(false)
      return
    }
    setNameError("")
    setSaving(true)
    try {
      await renameCourseFile(file._id, newName.trim())
      toast.success("File renamed")
      onRenamed()
      setRenaming(false)
    } catch {
      toast.error("Failed to rename file")
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (file.source === "drive" && file.driveFileId) {
      try {
        const link = await getDownloadLink(file.driveFileId)
        if (link.webContentLink) {
          window.open(link.webContentLink, "_blank")
        } else {
          window.open(getStreamUrl(file.driveFileId), "_blank")
        }
      } catch {
        toast.error("Failed to get download link")
      }
    } else if (file.source === "cloudinary" && file.cloudinaryUrl) {
      window.open(file.cloudinaryUrl, "_blank")
    }
  }

  const handleClick = () => {
    if (file.isFolder && onNavigate) {
      onNavigate(file)
    } else {
      onPreview(file)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (file.isFolder || movingFile) return
    e.dataTransfer.setData(DRAGGED_FILE_KEY, file._id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!file.isFolder) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const draggedId = e.dataTransfer.getData(DRAGGED_FILE_KEY)
    if (draggedId && draggedId !== file._id && onMoveFile && !movingFile) {
      onMoveFile(draggedId, file._id)
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors",
        file.isFolder
          ? dragOver
            ? "border-primary border-2 bg-primary/5"
            : "border-border hover:bg-muted/50"
          : "border-border hover:bg-muted/50"
      )}
      draggable={!file.isFolder && !movingFile}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        {file.isFolder ? (
          <Folder className="size-8 shrink-0 text-amber-500" />
        ) : isImage && thumbnailSrc && !imgError ? (
          <img
            src={thumbnailSrc}
            alt={file.name}
            className="size-8 shrink-0 rounded object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="shrink-0 text-muted-foreground/60">
            {smallFileIcon(file.mimeType)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          {renaming ? (
            <div
              className="flex flex-col gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    if (e.target.value.trim()) setNameError("")
                  }}
                  className={cn("h-7 text-sm", nameError && "border-destructive")}
                  autoFocus
                  disabled={saving}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename()
                    if (e.key === "Escape") { setRenaming(false); setNameError("") }
                  }}
                />
                <Button size="sm" variant="ghost" onClick={handleRename} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">
                {file.name}
              </span>
              <Badge
                variant="secondary"
                className="shrink-0 rounded-full text-[10px] font-normal"
              >
                {file.source === "drive" ? (
                  <HardDrive className="mr-1 size-3" />
                ) : (
                  <Cloud className="mr-1 size-3" />
                )}
                {file.source}
              </Badge>
            </div>
          )}
          <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            {!file.isFolder && (
              <>
                <span>{formatSize(file.size)}</span>
                <span>{file.uploadedBy.name}</span>
              </>
            )}
            <span>{timeAgo(file.createdAt)}</span>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1">
        {!file.isFolder && (
          <Button variant="ghost" size="icon-sm" onClick={handleDownload}>
            <Download className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setNewName(file.name)
            setNameError("")
            setRenaming(true)
          }}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDeleteRequest(file)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface FileManagerProps {
  courseId: string
  courseName: string
}

export function FileManager({ courseId, courseName }: FileManagerProps) {
  const [driveStatus, setDriveStatus] = React.useState<DriveStatus | null>(null)
  const [statusLoading, setStatusLoading] = React.useState(true)
  const [activeFolder, setActiveFolder] =
    React.useState<(typeof FOLDER_TABS)[number]["id"]>("materials")
  const [files, setFiles] = React.useState<CourseFile[]>([])
  const [filesLoading, setFilesLoading] = React.useState(false)
  const [folderIds, setFolderIds] = React.useState<Record<string, string>>({})
  const [uploading, setUploading] = React.useState(false)
  const [previewFile, setPreviewFile] = React.useState<CourseFile | null>(null)
  const [viewMode, setViewMode] = React.useState<"gallery" | "list">("gallery")
  const [folderDialogOpen, setFolderDialogOpen] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")
  const [folderNameError, setFolderNameError] = React.useState("")
  const [creatingFolder, setCreatingFolder] = React.useState(false)
  const [folderPath, setFolderPath] = React.useState<CourseFile[]>([])
  const [tabDragOver, setTabDragOver] = React.useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<CourseFile | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [movingFile, setMovingFile] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const fetchStatus = React.useCallback(async () => {
    try {
      const status = await getDriveStatus()
      setDriveStatus(status)
      return status
    } catch {
      setDriveStatus({ connected: false })
      return { connected: false }
    } finally {
      setStatusLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (driveStatus?.connected && !driveStatus.setupComplete) {
      setupDrive()
        .then((result) => {
          setDriveStatus((prev) =>
            prev
              ? { ...prev, folderId: result.folderId, setupComplete: true }
              : prev
          )
          toast.success("Google Drive connected")
        })
        .catch(() => {
          toast.error("Failed to set up Google Drive folder")
        })
    }
  }, [driveStatus?.connected, driveStatus?.setupComplete])

  const currentFolder =
    folderPath.length > 0 ? folderPath[folderPath.length - 1] : null

  const fetchFiles = React.useCallback(async () => {
    setFilesLoading(true)
    try {
      const data = await getCourseFiles(
        courseId,
        activeFolder,
        currentFolder?._id ?? undefined
      )
      setFiles(data)
    } catch {
      toast.error("Failed to load files")
    } finally {
      setFilesLoading(false)
    }
  }, [courseId, activeFolder, currentFolder])

  React.useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  React.useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleNavigateFolder = (folder: CourseFile) => {
    setFolderPath((prev) => [...prev, folder])
  }

  const handleNavigateToIndex = (index: number) => {
    setFolderPath((prev) => prev.slice(0, index + 1))
  }

  const handleFolderDrop = async (
    draggedFileId: string,
    targetFolderDbId: string
  ) => {
    setMovingFile(true)
    try {
      await moveCourseFile(draggedFileId, targetFolderDbId)
      toast.success("File moved")
      fetchFiles()
    } catch {
      toast.error("Failed to move file")
    } finally {
      setMovingFile(false)
    }
  }

  const handleTabDrop = async (
    draggedFileId: string,
    targetFolder: (typeof FOLDER_TABS)[number]["id"]
  ) => {
    setMovingFile(true)
    try {
      await moveCourseFileToRoot(draggedFileId, courseId, targetFolder)
      toast.success("File moved to root")
      fetchFiles()
    } catch {
      toast.error("Failed to move file")
    } finally {
      setMovingFile(false)
    }
  }

  const handleEnsureCourseFolders = async () => {
    try {
      const ids = await setupCourseFolders(courseId, courseName)
      setFolderIds(ids)
      return ids
    } catch (err: any) {
      const msg = err?.message ?? "Failed to set up course folders"
      console.error("[FileManager] ensureCourseFolders failed:", err)
      toast.error(msg)
      return {}
    }
  }

  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name) {
      setFolderNameError("Folder name is required")
      return
    }
    setFolderNameError("")

    let parentFolderId = folderIds[activeFolder]
    if (!parentFolderId) {
      const ids = await handleEnsureCourseFolders()
      parentFolderId = ids[activeFolder]
    }

    if (!parentFolderId) {
      toast.error("Could not resolve upload folder. Check Google Drive connection.")
      return
    }

    setCreatingFolder(true)
    try {
      await createFolder(
        courseId,
        name,
        parentFolderId,
        activeFolder,
        currentFolder?._id
      )
      toast.success("Folder created")
      setFolderDialogOpen(false)
      setNewFolderName("")
      fetchFiles()
    } catch {
      toast.error("Failed to create folder")
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    let parentFolderId = folderIds[activeFolder]
    if (!parentFolderId) {
      const ids = await handleEnsureCourseFolders()
      parentFolderId = ids[activeFolder]
    }

    if (!parentFolderId) {
      toast.error("Could not resolve upload folder. Check Google Drive connection.")
      return
    }

    setUploading(true)
    try {
      await uploadFile(
        courseId,
        file,
        parentFolderId,
        activeFolder,
        currentFolder?._id
      )
      toast.success(`"${file.name}" uploaded`)
      fetchFiles()
    } catch (err: any) {
      console.error("[FileManager] upload failed:", err)
      toast.error(err?.message ?? `Failed to upload "${file.name}"`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      await deleteCourseFile(deleteConfirm._id)
      toast.success(`"${deleteConfirm.name}" deleted`)
      setDeleteConfirm(null)
      fetchFiles()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  const handleTabClick = (tabId: (typeof FOLDER_TABS)[number]["id"]) => {
    setActiveFolder(tabId)
    setFolderPath([])
  }

  if (statusLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!driveStatus?.connected ? (
        <DriveConnectCard />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {FOLDER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                    setTabDragOver(tab.id)
                  }}
                  onDragLeave={() => setTabDragOver(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setTabDragOver(null)
                    const draggedId = e.dataTransfer.getData("courseFileId")
                    if (draggedId && !movingFile) handleTabDrop(draggedId, tab.id)
                  }}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    activeFolder === tab.id && !tabDragOver
                      ? "bg-primary text-primary-foreground"
                      : tabDragOver === tab.id
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={`size-7 ${
                    viewMode === "gallery"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setViewMode("gallery")}
                >
                  <LayoutGrid className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={`size-7 ${
                    viewMode === "list"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="size-3.5" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFolderDialogOpen(true)}
              >
                <Folder className="mr-2 size-4" />
                New Folder
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>

          {folderPath.length > 0 && (
            <nav className="flex items-center gap-1 flex-wrap text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setFolderPath([])}
                className="capitalize rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
              >
                {activeFolder}
              </button>
              {folderPath.map((folder, i) => (
                <React.Fragment key={folder._id}>
                  <ChevronRight className="size-4 shrink-0" />
                  {i === folderPath.length - 1 ? (
                    <span className="font-medium text-foreground truncate px-1.5 py-0.5">
                      {folder.name}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNavigateToIndex(i)}
                      className="truncate rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {folder.name}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {filesLoading ? (
            viewMode === "gallery" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-border">
                    <Skeleton className="aspect-3/2 rounded-t-lg" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            )
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
              <File className="size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {currentFolder
                  ? "This folder is empty"
                  : "No files in this folder yet"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 size-4" />
                Upload your first file
              </Button>
            </div>
          ) : viewMode === "gallery" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {files.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onDeleteRequest={setDeleteConfirm}
                  onRenamed={fetchFiles}
                  onPreview={setPreviewFile}
                  onNavigate={handleNavigateFolder}
                  onMoveFile={handleFolderDrop}
                  movingFile={movingFile}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {files.map((file) => (
                <FileRow
                  key={file._id}
                  file={file}
                  onDeleteRequest={setDeleteConfirm}
                  onRenamed={fetchFiles}
                  onPreview={setPreviewFile}
                  onNavigate={handleNavigateFolder}
                  onMoveFile={handleFolderDrop}
                  movingFile={movingFile}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog
        open={folderDialogOpen}
        onOpenChange={(open) => {
          setFolderDialogOpen(open)
          if (!open) {
            setNewFolderName("")
            setFolderNameError("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value)
                  if (e.target.value.trim()) setFolderNameError("")
                }}
                className={folderNameError ? "border-destructive" : ""}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder()
                  if (e.key === "Escape") setFolderDialogOpen(false)
                }}
              />
              {folderNameError && (
                <p className="text-xs text-destructive">{folderNameError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFolderDialogOpen(false)
                  setNewFolderName("")
                  setFolderNameError("")
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={creatingFolder}
              >
                {creatingFolder && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteConfirm?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove it from Google Drive. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={handleDeleteConfirmed}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
      />
    </div>
  )
}
