"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Download, File, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getStreamUrl, getDownloadLink } from "@/lib/services/drive"
import type { Lesson } from "@/lib/services/lessons"

const TYPE_ICONS: Record<string, React.ElementType> = {
  page: FileText,
  file: File,
}

const TYPE_BADGE: Record<string, string> = {
  page: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  file: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
}

interface LessonPreviewDialogProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LessonPreviewDialog({
  lesson,
  open,
  onOpenChange,
}: LessonPreviewDialogProps) {
  const [error, setError] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)

  if (!lesson) return null

  const isPage = lesson.type === "page"
  const isFile = lesson.type === "file"
  const file = lesson.fileId
  const isPdf = isFile && file?.mimeType === "application/pdf"
  const src = file?.driveFileId ? getStreamUrl(file.driveFileId) : null
  const TypeIcon = TYPE_ICONS[lesson.type] ?? FileText
  const badgeClass = TYPE_BADGE[lesson.type] ?? ""

  const handleDownload = async () => {
    if (!file?.driveFileId) return
    setDownloading(true)
    try {
      const link = await getDownloadLink(file.driveFileId)
      if (link.webContentLink) {
        window.open(link.webContentLink, "_blank")
      } else {
        window.open(getStreamUrl(file.driveFileId), "_blank")
      }
    } catch {
      toast.error("Failed to get download link")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[75vw] w-[75vw] h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-md ${badgeClass || "bg-muted"}`}
            >
              <TypeIcon className="size-3.5" />
            </div>
            <span className="truncate">{lesson.title}</span>
            {isPdf && (
              <Badge variant="outline" className="ml-1 rounded-full text-[10px] font-normal">
                PDF
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Page content */}
        {isPage && (
          lesson.content ? (
            lesson.content.startsWith("<") ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert flex-1 min-h-0 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            ) : (
              <p className="flex-1 min-h-0 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {lesson.content}
              </p>
            )
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No content to preview.
            </p>
          )
        )}

        {/* PDF preview */}
        {isPdf && src && (
          error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <File className="size-16" />
              <p className="text-sm">Preview unavailable</p>
            </div>
          ) : (
            <iframe
              src={src}
              className="min-h-0 flex-1 w-full rounded-lg"
              title={file?.name}
              onError={() => setError(true)}
            />
          )
        )}

        {/* Non-PDF file fallback */}
        {isFile && !isPdf && (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <File className="size-16" />
            <p className="text-sm">
              {file ? "No preview available for this file type" : "No file attached"}
            </p>
          </div>
        )}

        {isFile && file && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <File className="size-4" />
              <span className="truncate font-medium">{file.name}</span>
            </div>
            <span className="text-xs">{file.mimeType}</span>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isFile && file?.driveFileId && (
            <Button onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              {downloading ? "Downloading..." : "Download"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
