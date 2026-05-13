"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Download, File as FileIcon, HardDrive, Cloud } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import {
  getDownloadLink,
  getStreamUrl,
  type CourseFile,
} from "@/lib/services/drive"
import { toast } from "sonner"
import { timeAgo } from "@/lib/utils/time"

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPreviewable(mimeType: string) {
  if (mimeType.startsWith("image/")) return true
  if (mimeType.startsWith("video/")) return true
  if (mimeType.startsWith("audio/")) return true
  if (mimeType === "application/pdf") return true
  return false
}

function PreviewContent({ file }: { file: CourseFile }) {
  const [error, setError] = React.useState(false)

  const src =
    file.source === "drive" && file.driveFileId
      ? getStreamUrl(file.driveFileId)
      : file.source === "cloudinary"
        ? file.cloudinaryUrl
        : null

  if (error || !src) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <FileIcon className="size-16" />
        <p className="text-sm">
          {error ? "Preview unavailable" : "No preview available"}
        </p>
      </div>
    )
  }

  if (file.mimeType.startsWith("image/")) {
    return (
      <div className="flex items-center justify-center">
        <img
          src={src}
          alt={file.name}
          className="max-h-[60vh] max-w-full rounded-lg object-contain"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  if (file.mimeType.startsWith("video/")) {
    return (
      <video
        controls
        className="max-h-[60vh] w-full rounded-lg"
        onError={() => setError(true)}
      >
        <source src={src} type={file.mimeType} />
      </video>
    )
  }

  if (file.mimeType.startsWith("audio/")) {
    return (
      <div className="flex justify-center py-8">
        <audio
          controls
          className="w-full max-w-md"
          onError={() => setError(true)}
        >
          <source src={src} type={file.mimeType} />
        </audio>
      </div>
    )
  }

  if (file.mimeType === "application/pdf") {
    return (
      <iframe
        src={src}
        className="h-[60vh] w-full rounded-lg"
        title={file.name}
        onError={() => setError(true)}
      />
    )
  }

  return null
}

function FileMetadata({ file }: { file: CourseFile }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
      <div className="text-muted-foreground">Type</div>
      <div className="truncate font-medium">{file.mimeType}</div>
      <div className="text-muted-foreground">Size</div>
      <div className="font-medium">{formatSize(file.size)}</div>
      <div className="text-muted-foreground">Uploaded by</div>
      <div className="font-medium">{file.uploadedBy.name}</div>
      <div className="text-muted-foreground">Uploaded</div>
      <div className="font-medium">{timeAgo(file.createdAt)}</div>
      <div className="text-muted-foreground">Source</div>
      <div className="font-medium">
        {file.source === "drive" ? "Google Drive" : "Cloudinary"}
      </div>
    </div>
  )
}

interface FilePreviewDialogProps {
  file: CourseFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FilePreviewDialog({
  file,
  open,
  onOpenChange,
}: FilePreviewDialogProps) {
  const handleDownload = async () => {
    if (!file) return
    try {
      if (file.source === "drive" && file.driveFileId) {
        const link = await getDownloadLink(file.driveFileId)
        if (link.webContentLink) {
          window.open(link.webContentLink, "_blank")
        } else {
          window.open(getStreamUrl(file.driveFileId), "_blank")
        }
      } else if (file.source === "cloudinary" && file.cloudinaryUrl) {
        window.open(file.cloudinaryUrl, "_blank")
      }
    } catch {
      toast.error("Failed to get download link")
    }
  }

  if (!file) return null

  const showPreview = isPreviewable(file.mimeType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
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
            <span className="truncate">{file.name}</span>
          </DialogTitle>
        </DialogHeader>

        {showPreview ? <PreviewContent file={file} /> : null}

        <div
          className={
            showPreview
              ? "border-t border-border pt-4"
              : "pt-2"
          }
        >
          <FileMetadata file={file} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 size-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
