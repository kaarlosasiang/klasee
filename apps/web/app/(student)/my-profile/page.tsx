"use client"

import * as React from "react"
import { User, Mail, ShieldCheck, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useSession, updateUser } from "@/lib/config/auth-client"
import { getStudentProfile, updateStudentAcademicInfo, type StudentProfile } from "@/lib/services/student-profile"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"

export default function StudentProfilePage() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user

  const [loading, setLoading] = React.useState(true)
  const [orig, setOrig] = React.useState<StudentProfile | null>(null)

  // Personal section
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [savingPersonal, setSavingPersonal] = React.useState(false)

  // Academic section
  const [yearLevel, setYearLevel] = React.useState<number | "">("")
  const [program, setProgram] = React.useState("")
  const [savingAcademic, setSavingAcademic] = React.useState(false)

  // Guardian section
  const [guardianName, setGuardianName] = React.useState("")
  const [guardianContact, setGuardianContact] = React.useState("")
  const [savingGuardian, setSavingGuardian] = React.useState(false)

  React.useEffect(() => {
    getStudentProfile()
      .then((profile) => {
        setOrig(profile)
        setFirstName(profile.user.firstName ?? "")
        setLastName(profile.user.lastName ?? "")
        setPhoneNumber(profile.user.phoneNumber ?? "")
        setYearLevel(profile.student.yearLevel ?? "")
        setProgram(profile.student.program ?? "")
        setGuardianName(profile.student.guardianName ?? "")
        setGuardianContact(profile.student.guardianContact ?? "")
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  const hasPersonalChanges =
    orig !== null &&
    (firstName !== (orig.user.firstName ?? "") ||
      lastName !== (orig.user.lastName ?? "") ||
      phoneNumber !== (orig.user.phoneNumber ?? ""))

  const hasAcademicChanges =
    orig !== null &&
    (String(yearLevel) !== String(orig.student.yearLevel ?? "") ||
      program !== (orig.student.program ?? ""))

  const hasGuardianChanges =
    orig !== null &&
    (guardianName !== (orig.student.guardianName ?? "") ||
      guardianContact !== (orig.student.guardianContact ?? ""))

  async function handleSavePersonal() {
    setSavingPersonal(true)
    await updateUser(
      {
        firstName,
        lastName,
        phoneNumber,
        name: `${firstName} ${lastName}`.trim(),
      },
      {
        onSuccess: () => {
          setOrig((prev) =>
            prev
              ? { ...prev, user: { ...prev.user, firstName, lastName, phoneNumber } }
              : prev
          )
          toast.success("Personal info saved")
          setSavingPersonal(false)
        },
        onError: (ctx: any) => {
          toast.error(ctx.error?.message ?? "Failed to save personal info")
          setSavingPersonal(false)
        },
      }
    )
  }

  async function handleSaveAcademic() {
    setSavingAcademic(true)
    try {
      await updateStudentAcademicInfo({
        yearLevel: yearLevel !== "" ? Number(yearLevel) : undefined,
        program: program || undefined,
      })
      setOrig((prev) =>
        prev
          ? {
              ...prev,
              student: {
                ...prev.student,
                yearLevel: yearLevel !== "" ? Number(yearLevel) : null,
                program,
              },
            }
          : prev
      )
      toast.success("Academic info saved")
    } catch {
      toast.error("Failed to save academic info")
    } finally {
      setSavingAcademic(false)
    }
  }

  async function handleSaveGuardian() {
    setSavingGuardian(true)
    try {
      await updateStudentAcademicInfo({
        guardianName: guardianName || undefined,
        guardianContact: guardianContact || undefined,
      })
      setOrig((prev) =>
        prev
          ? { ...prev, student: { ...prev.student, guardianName, guardianContact } }
          : prev
      )
      toast.success("Guardian info saved")
    } catch {
      toast.error("Failed to save guardian info")
    } finally {
      setSavingGuardian(false)
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
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
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
              {user?.role ?? "student"}
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

      {/* Academic Information */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Academic Information
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Year Level</label>
              <Select
                value={yearLevel !== "" ? String(yearLevel) : ""}
                onValueChange={(v) => setYearLevel(v ? Number(v) : "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      Year {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Program</label>
              <Input
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. BSCS"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!hasAcademicChanges || savingAcademic}
              onClick={handleSaveAcademic}
            >
              {savingAcademic ? (
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

      {/* Guardian Information */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Guardian Information
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Guardian Name</label>
            <Input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Guardian Contact</label>
            <Input
              value={guardianContact}
              onChange={(e) => setGuardianContact(e.target.value)}
              placeholder="+63 900 000 0000"
              type="tel"
            />
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!hasGuardianChanges || savingGuardian}
              onClick={handleSaveGuardian}
            >
              {savingGuardian ? (
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
