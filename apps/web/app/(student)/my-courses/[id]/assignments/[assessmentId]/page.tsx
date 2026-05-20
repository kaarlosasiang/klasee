"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Upload,
  File,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"
import { getAssessmentById, type Assessment } from "@/lib/services/assessments"
import {
  getMyAssignmentSubmission,
  submitAssignment,
  type AssignmentSubmission,
} from "@/lib/services/assignment-submissions"
import { studentUploadFile } from "@/lib/services/drive"

export default function StudentAssignmentPage() {
  const params = useParams()
  const courseId = params.id as string
  const assessmentId = params.assessmentId as string

  const [assessment, setAssessment] = React.useState<Assessment | null>(null)
  const [submission, setSubmission] = React.useState<AssignmentSubmission | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [content, setContent] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = React.useState<
    { fileId: string; name: string; driveFileId: string; mimeType: string }[]
  >([])
  const [uploading, setUploading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const [assessmentData, existingSubmission] = await Promise.all([
          getAssessmentById(assessmentId),
          getMyAssignmentSubmission(assessmentId).catch(() => null),
        ])
        setAssessment(assessmentData)
        if (existingSubmission) {
          setSubmission(existingSubmission)
          setContent(existingSubmission.content ?? "")
          setUploadedFiles(
            existingSubmission.files?.map((f: { fileId?: string; name?: string; driveFileId?: string; mimeType?: string }) => ({
              fileId: f.fileId ?? "",
              name: f.name ?? "",
              driveFileId: f.driveFileId ?? "",
              mimeType: f.mimeType ?? "",
            })) ?? []
          )
        }
      } catch {
        toast.error("Failed to load assignment")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assessmentId])

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const result = await studentUploadFile(courseId, file)
      setUploadedFiles((prev) => [
        ...prev,
        {
          fileId: result._id,
          name: result.name,
          driveFileId: result.driveFileId ?? "",
          mimeType: result.mimeType,
        },
      ])
      setFiles((prev) => prev.filter((f) => f.name !== file.name))
      toast.success("File uploaded")
    } catch {
      toast.error("Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    if (!content.trim() && uploadedFiles.length === 0) {
      toast.error("Add content or upload a file before submitting")
      return
    }
    setSubmitting(true)
    try {
      const result = await submitAssignment({
        assessmentId,
        content: content.trim() || undefined,
        files: uploadedFiles.map((f) => ({
          fileId: f.fileId,
          name: f.name,
          driveFileId: f.driveFileId,
          mimeType: f.mimeType,
        })),
      })
      setSubmission(result)
      toast.success("Assignment submitted!")
    } catch {
      toast.error("Failed to submit assignment")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Assignment not found
      </div>
    )
  }

  const isGraded = submission?.grade !== undefined && submission?.grade !== null

  return (
    <div className="space-y-6">
      <Link
        href={`/my-courses/${courseId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{assessment.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {assessment.totalPoints} pts
              {assessment.dueDate && (
                <> &middot; Due {new Date(assessment.dueDate).toLocaleDateString()}</>
              )}
            </p>
          </div>
          {isGraded && submission && (
            <div className="text-right">
              <div className="text-2xl font-bold">{submission.grade}/{assessment.totalPoints}</div>
              <Badge className="mt-1 rounded-full text-xs" variant="outline">
                Graded
              </Badge>
            </div>
          )}
        </div>
      </div>

      {submission && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-green-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {isGraded ? "Assignment graded" : "Assignment submitted"}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            {!isGraded && (
              <Badge variant="secondary" className="rounded-full text-xs">
                Awaiting grade
              </Badge>
            )}
          </div>
          {submission.files && submission.files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Submitted files</p>
              {submission.files.map((f: { name?: string }, i: number) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm">
                  <File className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                </div>
              ))}
            </div>
          )}
          {submission.feedback && (
            <div className="mt-3 rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Feedback</p>
              <p className="mt-1 text-sm">{submission.feedback}</p>
            </div>
          )}
        </Card>
      )}

      {(!submission || !submission.grade) && (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-medium">Your Response</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your response here..."
              rows={6}
              className="mb-4 w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
            />
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Attachments
              </h3>
              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
                    >
                      <File className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      {!submission && (
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFiles((prev) => prev.filter((_, j) => j !== i))
                          }}
                          className="text-muted-foreground/40 hover:text-destructive"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!submission && (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/30">
                  <Upload className="size-4" />
                  {uploading ? "Uploading..." : "Upload file"}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFiles((prev) => [...prev, file])
                        handleUpload(file)
                      }
                      e.target.value = ""
                    }}
                  />
                </label>
              )}
            </div>
          </Card>

          {!submission && (
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="lg" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Submit Assignment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogMedia>
                      <AlertTriangle className="size-5 text-amber-500" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Submit assignment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit? You can resubmit before the due date.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
