"use client"

import * as React from "react"
import { GraduationCap, Loader2, Check } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { toast } from "sonner"
import { joinByCode } from "@/lib/services/enrollments"

interface JoinCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJoined: () => void
}

export function JoinCourseDialog({
  open,
  onOpenChange,
  onJoined,
}: JoinCourseDialogProps) {
  const [code, setCode] = React.useState("")
  const [joining, setJoining] = React.useState(false)

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      toast.error("Please enter a join code")
      return
    }
    setJoining(true)
    try {
      await joinByCode(trimmed)
      toast.success("Successfully joined the course!")
      setCode("")
      onOpenChange(false)
      onJoined()
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to join course"
      toast.error(message)
    } finally {
      setJoining(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Join a Course</DialogTitle>
          <DialogDescription>
            Enter the join code provided by your instructor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Join Code</Label>
            <Input
              id="code"
              placeholder="e.g. ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin()
              }}
              maxLength={6}
              className="text-center font-mono text-lg tracking-[0.25em]"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-character code from your instructor
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={joining || code.trim().length === 0}
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 size-4" />
                Join Course
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
