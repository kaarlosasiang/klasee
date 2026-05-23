"use client"

import * as React from "react"
import { Copy, Check, Loader2, RefreshCw, Hash } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import {
  getSectionsByCourse,
  generateJoinCode,
  type Section,
} from "@/lib/services/sections"

interface GenerateCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

export function GenerateCodeDialog({
  open,
  onOpenChange,
  courseId,
}: GenerateCodeDialogProps) {
  const [sections, setSections] = React.useState<Section[]>([])
  const [loading, setLoading] = React.useState(false)
  const [generatingId, setGeneratingId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    getSectionsByCourse(courseId)
      .then(setSections)
      .catch(() => toast.error("Failed to load sections"))
      .finally(() => setLoading(false))
  }, [open, courseId])

  async function handleGenerate(section: Section) {
    setGeneratingId(section._id)
    try {
      const updated = await generateJoinCode(section._id)
      setSections((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
      toast.success("Join code generated")
    } catch {
      toast.error("Failed to generate code")
    } finally {
      setGeneratingId(null)
    }
  }

  async function handleCopy(section: Section) {
    if (!section.joinCode) return
    try {
      await navigator.clipboard.writeText(section.joinCode)
      setCopiedId(section._id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success("Code copied")
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Codes</DialogTitle>
          <DialogDescription>
            Share a section code with students so they can join via the student app.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No sections found. Create a section first.
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
                    <p className="text-xs text-muted-foreground/60">No code yet</p>
                  )}
                </div>

                {section.joinCode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => handleCopy(section)}
                  >
                    {copiedId === section._id ? (
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
                  disabled={generatingId === section._id}
                  onClick={() => handleGenerate(section)}
                >
                  {generatingId === section._id ? (
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
      </DialogContent>
    </Dialog>
  )
}
