"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Download, Eye } from "lucide-react"
import { LessonPreviewDialog } from "@/components/common/lesson-preview-dialog"
import type { Lesson } from "@/lib/services/lessons"

interface LessonFileActionsProps {
  lesson: Lesson
}

export function LessonFileActions({ lesson }: LessonFileActionsProps) {
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const isPdf = lesson.fileId?.mimeType === "application/pdf"

  return (
    <div className="flex items-center gap-2">
      {isPdf && (
        <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
          <Eye className="mr-1.5 size-4" />
          Preview
        </Button>
      )}
      {lesson.fileId?.driveFileId && (
        <a
          href={`https://drive.google.com/uc?id=${lesson.fileId.driveFileId}&export=download`}
          target="_blank"
          rel="noreferrer"
        >
          <Button size="sm" variant="outline">
            <Download className="mr-1.5 size-4" />
            Download
          </Button>
        </a>
      )}
      {isPdf && (
        <LessonPreviewDialog
          lesson={lesson}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </div>
  )
}
