"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  GraduationCap,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { useSession } from "@/lib/config/auth-client"
import {
  verifyInvitation,
  acceptInvitation,
} from "@/lib/services/invitations"
import { toast } from "sonner"

export default function InvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get("token")
  const { data: session, isPending: sessionLoading } = useSession()

  const [verifying, setVerifying] = React.useState(true)
  const [inviteInfo, setInviteInfo] = React.useState<{
    valid: boolean
    reason?: string
    course?: { _id: string; name: string; code: string }
    section?: { _id: string; name: string; schedule?: string; room?: string }
  } | null>(null)
  const [accepting, setAccepting] = React.useState(false)
  const [accepted, setAccepted] = React.useState(false)

  React.useEffect(() => {
    if (!token) {
      setVerifying(false)
      setInviteInfo({ valid: false, reason: "No invitation token provided" })
      return
    }

    verifyInvitation(token)
      .then(setInviteInfo)
      .catch(() => {
        setInviteInfo({ valid: false, reason: "Failed to verify invitation" })
      })
      .finally(() => setVerifying(false))
  }, [token])

  const handleLoginRedirect = () => {
    sessionStorage.setItem("pendingInviteToken", token || "")
    router.push(`/login?callbackURL=/invite?token=${token}`)
  }

  const handleAccept = async () => {
    if (!token) return
    setAccepting(true)
    try {
      const enrollment = await acceptInvitation(token) as any
      setAccepted(true)
      toast.success("You are now enrolled!")
      const courseId =
        enrollment?.courseId?._id || enrollment?.courseId
      if (courseId) {
        setTimeout(() => router.push(`/courses/${courseId}`), 1500)
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to accept invitation"
      toast.error(msg)
    } finally {
      setAccepting(false)
    }
  }

  if (verifying || sessionLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!inviteInfo?.valid) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <XCircle className="size-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold">Invalid Invitation</h1>
          <p className="text-sm text-muted-foreground">
            {inviteInfo?.reason ||
              "This invitation link is invalid or has expired."}
          </p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <GraduationCap className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold">Course Invitation</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ve been invited to{" "}
            <span className="font-medium text-foreground">
              {inviteInfo.course?.name}
            </span>
            .
          </p>
          <p className="text-sm text-muted-foreground">
            Please log in to accept your invitation.
          </p>
          <Button onClick={handleLoginRedirect}>Log In to Accept</Button>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold">You&apos;re Enrolled!</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to <span className="font-medium">{inviteInfo.course?.name}</span>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <GraduationCap className="size-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-xl font-bold">{inviteInfo.course?.name}</h1>
        <Badge variant="secondary" className="rounded-full text-xs font-normal">
          {inviteInfo.course?.code}
        </Badge>

        <div className="w-full space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-left text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span>
              Section:{" "}
              <span className="font-medium text-foreground">
                {inviteInfo.section?.name}
              </span>
            </span>
          </div>
          {inviteInfo.section?.schedule && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span>{inviteInfo.section.schedule}</span>
            </div>
          )}
          {inviteInfo.section?.room && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" />
              <span>{inviteInfo.section.room}</span>
            </div>
          )}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleAccept}
          disabled={accepting}
        >
          {accepting && (
            <Loader2 className="mr-2 size-4 animate-spin" />
          )}
          {accepting ? "Enrolling..." : "Accept Invitation"}
        </Button>
      </div>
    </div>
  )
}
