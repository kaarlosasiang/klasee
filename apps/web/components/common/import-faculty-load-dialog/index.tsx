"use client"

import * as React from "react"
import { CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  parseFacultyLoad,
  createCourse,
  type ParsedCourse,
  type ParsedSection,
} from "@/lib/services/courses"
import { createSection } from "@/lib/services/sections"

interface ImportFacultyLoadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}

interface EditableSection extends ParsedSection {
  _subject: string
}

type Step = "upload" | "preview" | "importing" | "done"

export function ImportFacultyLoadDialog({
  open,
  onOpenChange,
  onImported,
}: ImportFacultyLoadDialogProps) {
  const [step, setStep] = React.useState<Step>("upload")
  const [parsing, setParsing] = React.useState(false)
  const [semester, setSemester] = React.useState<"1st" | "2nd" | "summer">("2nd")
  const [rows, setRows] = React.useState<EditableSection[]>([])
  const [progress, setProgress] = React.useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  function reset() {
    setStep("upload")
    setParsing(false)
    setRows([])
    setProgress("")
  }

  function handleClose(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file")
      return
    }
    setParsing(true)
    try {
      const courses = await parseFacultyLoad(file)
      if (courses.length === 0) {
        toast.error("No schedule table found in this PDF")
        return
      }
      const flat: EditableSection[] = courses.flatMap((c) =>
        c.sections.map((s) => ({ ...s, _subject: c.subject }))
      )
      setRows(flat)
      setStep("preview")
    } catch {
      toast.error("Failed to parse PDF")
    } finally {
      setParsing(false)
    }
  }

  function updateRow(idx: number, patch: Partial<EditableSection>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleImport() {
    if (rows.length === 0) return
    setStep("importing")

    // Group rows by subject
    const bySubject = new Map<string, EditableSection[]>()
    for (const row of rows) {
      if (!bySubject.has(row._subject)) bySubject.set(row._subject, [])
      bySubject.get(row._subject)!.push(row)
    }

    const subjects = Array.from(bySubject.keys())
    let created = 0

    try {
      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i]!
        const sections = bySubject.get(subject)!
        setProgress(`Creating ${subject} (${i + 1}/${subjects.length})…`)

        const code = subject.replace(/\s+/g, "")
        const course = await createCourse({
          name: subject,
          code,
          semester,
          isPublished: false,
        })

        for (const sec of sections) {
          await createSection({
            courseId: course._id,
            name: sec.name,
            schedule: sec.schedule,
            labSchedule: sec.labSchedule,
            room: sec.room,
            maxStudents: sec.maxStudents,
          })
        }
        created++
      }

      setStep("done")
      toast.success(`${created} course${created !== 1 ? "s" : ""} created as drafts`)
      onImported()
    } catch {
      toast.error("Import failed — some courses may have been partially created")
      setStep("preview")
    }
  }

  const uniqueSubjects = [...new Set(rows.map((r) => r._subject))]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-auto max-w-[95vw] sm:max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Import Faculty Load</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center gap-6 py-8">
            <div
              className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border px-8 py-12 transition-colors hover:border-primary hover:bg-primary/5"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
            >
              {parsing ? (
                <Loader2 className="size-10 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-10 text-muted-foreground" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {parsing ? "Parsing PDF…" : "Drop your Notice of Teaching Load PDF here"}
                </p>
                {!parsing && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse
                  </p>
                )}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ""
              }}
            />
          </div>
        )}

        {step === "preview" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-sm">Semester</Label>
                <Select
                  value={semester}
                  onValueChange={(v) => setSemester(v as typeof semester)}
                >
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st</SelectItem>
                    <SelectItem value="2nd">2nd</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {uniqueSubjects.length} course{uniqueSubjects.length !== 1 ? "s" : ""},{" "}
                {rows.length} section{rows.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 border-b border-border bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Subject</th>
                    <th className="px-3 py-2 text-left font-medium">Section</th>
                    <th className="px-3 py-2 text-left font-medium">Lecture Schedule</th>
                    <th className="px-3 py-2 text-left font-medium">Lab Schedule</th>
                    <th className="px-3 py-2 text-left font-medium">Room</th>
                    <th className="px-3 py-2 text-center font-medium">Students</th>
                    <th className="w-8 px-2 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="px-3 py-1.5">
                        <Input
                          value={row._subject}
                          onChange={(e) => updateRow(idx, { _subject: e.target.value })}
                          className="h-7 min-w-[80px] text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Input
                          value={row.name}
                          onChange={(e) => updateRow(idx, { name: e.target.value })}
                          className="h-7 w-20 text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Input
                          value={row.schedule ?? ""}
                          onChange={(e) => updateRow(idx, { schedule: e.target.value || undefined })}
                          className="h-7 w-40 text-xs"
                          placeholder="e.g. Mon Wed 10:00-11:00"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Input
                          value={row.labSchedule ?? ""}
                          onChange={(e) => updateRow(idx, { labSchedule: e.target.value || undefined })}
                          className="h-7 w-40 text-xs"
                          placeholder="—"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Input
                          value={row.room ?? ""}
                          onChange={(e) => updateRow(idx, { room: e.target.value || undefined })}
                          className="h-7 w-24 text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <Input
                          type="number"
                          value={row.maxStudents}
                          onChange={(e) => updateRow(idx, { maxStudents: parseInt(e.target.value) || 0 })}
                          className="h-7 w-16 text-center text-xs"
                        />
                      </td>
                      <td className="px-2 py-1.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeRow(idx)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button size="sm" disabled={rows.length === 0} onClick={handleImport}>
                <FileText className="mr-2 size-4" />
                Import {uniqueSubjects.length} course{uniqueSubjects.length !== 1 ? "s" : ""} as drafts
              </Button>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{progress}</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="size-10 text-emerald-500" />
            <div className="text-center">
              <p className="text-sm font-medium">Import complete</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Courses created as drafts — publish them when ready.
              </p>
            </div>
            <Button size="sm" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
