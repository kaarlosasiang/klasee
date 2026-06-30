"use client"

import * as React from "react"
import { User, Mail, ShieldCheck, Building2, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "@/lib/config/auth-client"
import { getMe, updateProfile, type InstructorProfile } from "@/lib/services/users"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"

export default function InstructorProfilePage() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user

  const [loading, setLoading] = React.useState(true)
  const [orig, setOrig] = React.useState<InstructorProfile | null>(null)

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [savingPersonal, setSavingPersonal] = React.useState(false)

  React.useEffect(() => {
    getMe()
      .then((profile) => {
        setOrig(profile)
        setFirstName(profile.firstName ?? "")
        setLastName(profile.lastName ?? "")
        setPhoneNumber(profile.phoneNumber ?? "")
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  const hasPersonalChanges =
    orig !== null &&
    (firstName !== (orig.firstName ?? "") ||
      lastName !== (orig.lastName ?? "") ||
      phoneNumber !== (orig.phoneNumber ?? ""))

  async function handleSavePersonal() {
    setSavingPersonal(true)
    try {
      await updateProfile({ firstName, lastName, phoneNumber })
      setOrig((prev) => (prev ? { ...prev, firstName, lastName, phoneNumber } : prev))
      toast.success("Personal info saved")
    } catch {
      toast.error("Failed to save personal info")
    } finally {
      setSavingPersonal(false)
    }
  }

  if (sessionPending || loading) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-10">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 py-10">
      {/* Identity header — read-only */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="size-7 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold">{user?.name ?? "—"}</h1>
            <Badge variant="secondary" className="mt-1 text-xs font-normal capitalize">
              {user?.role ?? "instructor"}
            </Badge>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Email</span>
            <span className="ml-auto font-medium">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Role</span>
            <span className="ml-auto font-medium capitalize">{user?.role ?? "—"}</span>
          </div>
          {orig?.schoolId && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">School ID</span>
              <span className="ml-auto font-medium">{orig.schoolId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Personal Information
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">First Name</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+63 900 000 0000"
              type="tel"
            />
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!hasPersonalChanges || savingPersonal}
              onClick={handleSavePersonal}
            >
              {savingPersonal ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 size-3.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
