"use client"

import * as React from "react"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { RichTextEditor } from "@/components/rich-text-editor"
import { getWiki, saveWiki } from "@/lib/services/wiki"
import { timeAgo } from "@/lib/utils/time"

interface WikiEditorProps {
  courseId: string
  readOnly?: boolean
}

export function WikiEditor({ courseId, readOnly = false }: WikiEditorProps) {
  const [content, setContent] = React.useState("")
  const [savedContent, setSavedContent] = React.useState("")
  const [updatedAt, setUpdatedAt] = React.useState<string | undefined>()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    getWiki(courseId)
      .then((wiki) => {
        setContent(wiki.content ?? "")
        setSavedContent(wiki.content ?? "")
        setUpdatedAt(wiki.updatedAt)
      })
      .catch(() => toast.error("Failed to load wiki"))
      .finally(() => setLoading(false))
  }, [courseId])

  const isDirty = content !== savedContent

  async function handleSave() {
    setSaving(true)
    try {
      const wiki = await saveWiki(courseId, content)
      setSavedContent(wiki.content ?? "")
      setUpdatedAt(wiki.updatedAt)
      toast.success("Wiki saved")
    } catch {
      toast.error("Failed to save wiki")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (readOnly) {
    return (
      <div className="rounded-lg border bg-card p-4">
        {content ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No wiki content yet.</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold">Course Wiki</h2>
          {updatedAt && (
            <p className="text-xs text-muted-foreground">Last updated {timeAgo(updatedAt)}</p>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || saving}
        >
          {saving ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 size-3.5" />
          )}
          Save
        </Button>
      </div>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write your course wiki here — syllabus details, resources, notes..."
      />
    </div>
  )
}
