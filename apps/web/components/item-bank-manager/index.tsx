"use client"

import * as React from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Database,
  ArrowLeft,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "sonner"
import {
  getItemBanks,
  createItemBank,
  updateItemBank,
  deleteItemBank,
  type ItemBank,
} from "@/lib/services/item-banks"
import { QuestionsManager } from "@/components/questions-manager"

interface ItemBankManagerProps {
  courseId: string
}

export function ItemBankManager({ courseId }: ItemBankManagerProps) {
  const [banks, setBanks] = React.useState<ItemBank[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedBank, setSelectedBank] = React.useState<ItemBank | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [newBankName, setNewBankName] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState("")
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const fetchBanks = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getItemBanks(courseId)
      setBanks(data)
    } catch {
      toast.error("Failed to load question banks")
    } finally {
      setLoading(false)
    }
  }, [courseId])

  React.useEffect(() => {
    fetchBanks()
  }, [fetchBanks])

  async function handleCreate() {
    if (!newBankName.trim()) return toast.error("Bank name is required")
    setSubmitting(true)
    try {
      await createItemBank({ courseId, name: newBankName.trim() })
      setNewBankName("")
      setCreating(false)
      toast.success("Question bank created")
      fetchBanks()
    } catch {
      toast.error("Failed to create bank")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return toast.error("Name is required")
    setSubmitting(true)
    try {
      await updateItemBank(id, editName.trim())
      setEditingId(null)
      toast.success("Bank renamed")
      fetchBanks()
    } catch {
      toast.error("Failed to rename bank")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteItemBank(id)
      if (selectedBank?._id === id) setSelectedBank(null)
      toast.success("Question bank deleted")
      fetchBanks()
    } catch {
      toast.error("Failed to delete bank")
    } finally {
      setDeleteTarget(null)
    }
  }

  if (selectedBank) {
    const bank = banks.find((b) => b._id === selectedBank._id) ?? selectedBank
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedBank(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All banks
        </button>
        <div className="flex items-center gap-2">
          <Database className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">{bank.name}</h2>
        </div>
        <QuestionsManager itemBankId={selectedBank._id} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const deleteTargetBank = banks.find((b) => b._id === deleteTarget)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {banks.length} bank{banks.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
          <Plus className="mr-2 size-4" />
          New Bank
        </Button>
      </div>

      {creating && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <Input
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
            placeholder="Bank name..."
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          />
          <Button size="sm" onClick={handleCreate} disabled={submitting}>
            {submitting ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setCreating(false); setNewBankName("") }}>
            <X className="size-3" />
          </Button>
        </div>
      )}

      {banks.length === 0 && !creating && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Database className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No question banks yet</p>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 size-4" />
            Create your first bank
          </Button>
        </div>
      )}

      {banks.length > 0 && (
        <div className="space-y-2">
          {banks.map((bank) => (
            <div
              key={bank._id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20"
            >
              <Database className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                {editingId === bank._id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleRename(bank._id) }}
                    />
                    <Button size="sm" onClick={() => handleRename(bank._id)} disabled={submitting}>
                      <Check className="size-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-left text-sm font-medium hover:underline"
                    onClick={() => setSelectedBank(bank)}
                  >
                    {bank.name}
                  </button>
                )}
              </div>
              {editingId !== bank._id && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBank(bank)}
                    className="text-xs"
                  >
                    Manage
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setEditingId(bank._id); setEditName(bank.name) }}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(bank._id)}
                    className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question bank?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTargetBank?.name}&quot; and all its questions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
