"use client"

import * as React from "react"
import { Eye, EyeOff, Loader2, KeyRound, Bell } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import { Separator } from "@workspace/ui/components/separator"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "sonner"
import { useSession, signOut } from "@/lib/config/auth-client"
import { changePassword } from "@/lib/config/auth-client"
import { useRouter } from "next/navigation"
import { deleteAccount } from "@/lib/services/users"

const PREFS_KEY = "klasee_notification_prefs"

interface NotificationPrefs {
  newAnnouncement: boolean
  gradePosted: boolean
  assessmentReminder: boolean
}

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as NotificationPrefs
  } catch {}
  return { newAnnouncement: true, gradePosted: true, assessmentReminder: true }
}

function savePrefs(prefs: NotificationPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export default function StudentSettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrent, setShowCurrent] = React.useState(false)
  const [showNew, setShowNew] = React.useState(false)
  const [changingPassword, setChangingPassword] = React.useState(false)
  const [passwordErrors, setPasswordErrors] = React.useState<string[]>([])

  const [prefs, setPrefs] = React.useState<NotificationPrefs>({
    newAnnouncement: true,
    gradePosted: true,
    assessmentReminder: true,
  })

  React.useEffect(() => {
    setPrefs(loadPrefs())
  }, [])

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    savePrefs(next)
  }

  function validatePassword(): string[] {
    const errors: string[] = []
    if (!currentPassword) errors.push("Current password is required")
    if (newPassword.length < 8) errors.push("New password must be at least 8 characters")
    if (!/[A-Z]/.test(newPassword)) errors.push("New password must contain an uppercase letter")
    if (!/[0-9]/.test(newPassword)) errors.push("New password must contain a number")
    if (newPassword !== confirmPassword) errors.push("Passwords do not match")
    return errors
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await deleteAccount()
      await signOut()
      router.replace("/login")
    } catch {
      toast.error("Failed to delete account. Please try again.")
      setDeleting(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    const errors = validatePassword()
    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }
    setPasswordErrors([])
    setChangingPassword(true)
    try {
      await changePassword({ currentPassword, newPassword, revokeOtherSessions: false })
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Failed to change password. Check your current password.")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Account Info */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          Account
        </h2>
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="mt-0.5 font-medium">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="mt-0.5 font-medium capitalize">{user?.role ?? "student"}</p>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="size-4" />
          Change Password
        </h2>
        <Separator />
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {passwordErrors.length > 0 && (
            <ul className="space-y-1">
              {passwordErrors.map((err, i) => (
                <li key={i} className="text-xs text-destructive">{err}</li>
              ))}
            </ul>
          )}
          <Button type="submit" size="sm" disabled={changingPassword}>
            {changingPassword && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Update Password
          </Button>
        </form>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bell className="size-4" />
          Notification Preferences
        </h2>
        <Separator />
        <p className="text-xs text-muted-foreground">
          Email notifications will be available in a future update. Preferences saved here will apply automatically.
        </p>
        <div className="space-y-4">
          {([
            { key: "newAnnouncement", label: "New announcements", description: "When an instructor posts an announcement in your course" },
            { key: "gradePosted", label: "Grade posted", description: "When your submission or quiz is graded" },
            { key: "assessmentReminder", label: "Assessment reminders", description: "Reminder before a quiz or assignment is due" },
          ] as const).map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={(v) => updatePref(key, v)}
              />
            </div>
          ))}
        </div>
      </section>
      {/* Danger Zone */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-destructive uppercase tracking-wide">
          Danger Zone
        </h2>
        <div className="rounded-2xl border border-destructive/40 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all personal data. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete Account
            </Button>
          </div>
        </div>
      </section>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, enrollment history, grades, quiz attempts,
              and attendance records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2 space-y-1.5">
            <Label htmlFor="delete-confirm">Type <span className="font-semibold">DELETE</span> to confirm</Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE" || deleting}
              onClick={handleDeleteAccount}
            >
              {deleting && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Delete Account
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
