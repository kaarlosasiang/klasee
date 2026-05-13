"use client"

import * as React from "react"
import { Copy, Check, Loader2, Link } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "sonner"
import { createInvitation, type Invitation } from "@/lib/services/invitations"
import { getSectionsByCourse, type Section } from "@/lib/services/sections"

interface InviteStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onCreated: () => void
}

export function InviteStudentDialog({
  open,
  onOpenChange,
  courseId,
  onCreated,
}: InviteStudentDialogProps) {
  const [sections, setSections] = React.useState<Section[]>([])
  const [sectionId, setSectionId] = React.useState("")
  const [expiryDays, setExpiryDays] = React.useState("7")
  const [generating, setGenerating] = React.useState(false)
  const [invitation, setInvitation] = React.useState<Invitation | null>(null)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      getSectionsByCourse(courseId).then(setSections).catch(() => {})
      setInvitation(null)
      setCopied(false)
    }
  }, [open, courseId])

  const inviteUrl = invitation
    ? `${window.location.origin}/invite?token=${invitation.token}`
    : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Invite link copied")
  }

  const handleGenerate = async () => {
    if (!sectionId) return
    setGenerating(true)
    try {
      const inv = await createInvitation(
        courseId,
        sectionId,
        expiryDays ? parseInt(expiryDays) : null
      )
      setInvitation(inv)
      onCreated()
    } catch {
      toast.error("Failed to generate invite link")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Student</DialogTitle>
          <DialogDescription>
            Generate a shareable invite link for a section.
          </DialogDescription>
        </DialogHeader>

        {invitation ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <Label className="text-xs text-muted-foreground">Invite Link</Label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-sm">
                  {inviteUrl}
                </code>
                <Button size="icon-sm" variant="ghost" onClick={handleCopy}>
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link className="size-3" />
              {invitation.expiresAt
                ? `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`
                : "Never expires"}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 size-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 size-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                      {s.schedule && ` — ${s.schedule}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expires In (days)</Label>
              <Input
                id="expiry"
                type="number"
                min="1"
                placeholder="Leave empty for no expiry"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty or 0 for a link that never expires
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || !sectionId}
              >
                {generating && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Generate Link
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
