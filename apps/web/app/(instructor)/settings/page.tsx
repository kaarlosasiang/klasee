"use client"

import * as React from "react"
import {
  HardDrive,
  Loader2,
  CheckCircle2,
  XCircle,
  Unlink,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@workspace/ui/components/alert-dialog"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "sonner"
import { linkGoogleDrive, signOut } from "@/lib/config/auth-client"
import { useRouter } from "next/navigation"
import { deleteAccount } from "@/lib/services/users"
import {
  getDriveStatus,
  setupDrive,
  disconnectDrive,
  type DriveStatus,
} from "@/lib/services/drive"

export default function SettingsPage() {
  const router = useRouter()
  const [driveStatus, setDriveStatus] = React.useState<DriveStatus | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [connecting, setConnecting] = React.useState(false)

  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)

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

  React.useEffect(() => {
    getDriveStatus()
      .then(setDriveStatus)
      .catch(() => setDriveStatus({ connected: false }))
      .finally(() => setLoading(false))
  }, [])

  const handleConnect = () => {
    setConnecting(true)
    linkGoogleDrive(window.location.href)
  }

  const handleDisconnect = async () => {
    try {
      await disconnectDrive()
      setDriveStatus({ connected: false })
      toast.success("Google Drive disconnected")
    } catch {
      toast.error("Failed to disconnect Google Drive")
    }
  }

  React.useEffect(() => {
    if (driveStatus?.connected && !driveStatus.setupComplete) {
      setupDrive()
        .then((result) => {
          setDriveStatus((prev) =>
            prev
              ? { ...prev, folderId: result.folderId, setupComplete: true }
              : prev
          )
          toast.success("Google Drive connected")
        })
        .catch(() => {
          toast.error("Failed to set up Google Drive folder")
        })
    }
  }, [driveStatus?.connected, driveStatus?.setupComplete])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and integrations
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <HardDrive className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Google Drive</CardTitle>
              <CardDescription>
                Connect your Google Drive to store and manage course files
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Checking connection...
            </div>
          ) : driveStatus?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                <span className="text-sm font-medium">Connected</span>
                <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
                  {driveStatus.setupComplete ? "Folder created" : "Not set up"}
                </Badge>
              </div>
              {driveStatus.setupComplete && (
                <p className="text-xs text-muted-foreground">
                  Files are stored in the &ldquo;Klasee LMS&rdquo; folder on your Google Drive.
                </p>
              )}
              {!driveStatus.setupComplete && (
                <Button size="sm" onClick={handleConnect}>
                  Complete setup
                </Button>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-destructive hover:text-destructive"
                >
                  <Unlink className="mr-2 size-4" />
                  Disconnect Google Drive
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="size-5 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">Not connected</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Connect your Google Drive to enable file management for your courses.
                A &ldquo;Klasee LMS&rdquo; folder will be created automatically.
              </p>
              <Button onClick={handleConnect} disabled={connecting}>
                {connecting && <Loader2 className="mr-2 size-4 animate-spin" />}
                {connecting ? "Connecting..." : "Connect Google Drive"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-destructive uppercase tracking-wide">
          Danger Zone
        </h2>
        <div className="rounded-2xl border border-destructive/40 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and personal data. Your courses will be archived
                and remain accessible to enrolled students.
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and personal data. Your courses will be
              archived and remain accessible to enrolled students, but you will no longer be
              able to manage them. This action cannot be undone.
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
