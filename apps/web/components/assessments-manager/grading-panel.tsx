"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  File,
  FileText,
  FileType,
  FileArchive,
  Film,
  Music,
  Check,
  Circle,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import { getStreamUrl, type CourseFile } from "@/lib/services/drive"
import {
  createScore,
  updateScore,
  type Assessment,
  type AssessmentScore,
} from "@/lib/services/assessments"
import { cn } from "@workspace/ui/lib/utils"
import { timeAgo } from "@/lib/utils/time"

interface EnrolledStudent {
  _id: string
  name: string
  email: string
}

interface GradingPanelProps {
  assessment: Assessment
  enrolledStudents: EnrolledStudent[]
  existingScores: Map<string, { _id: string; score: number; feedback?: string }>
  submissionFiles: CourseFile[]
  allCourseAssessments: Assessment[]
  allCourseScores: AssessmentScore[]
  onBack: () => void
}

const TYPE_COLORS: Record<string, string> = {
  quiz: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  exam: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  assignment:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
}

function fileTypeIcon(mime: string, size: "sm" | "lg" = "sm") {
  const cls = size === "lg" ? "size-12" : "size-4"
  if (mime.startsWith("video/")) return <Film className={cls} />
  if (mime.startsWith("audio/")) return <Music className={cls} />
  if (mime.includes("pdf")) return <FileType className={cls} />
  if (mime.includes("zip") || mime.includes("rar"))
    return <FileArchive className={cls} />
  if (
    mime.includes("word") ||
    mime.includes("document") ||
    mime.includes("sheet") ||
    mime.includes("presentation")
  )
    return <FileText className={cls} />
  return <File className={cls} />
}

export function GradingPanel({
  assessment,
  enrolledStudents,
  existingScores,
  submissionFiles,
  allCourseAssessments,
  allCourseScores,
  onBack,
}: GradingPanelProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [scoreInput, setScoreInput] = React.useState("")
  const [feedbackInput, setFeedbackInput] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<CourseFile | null>(
    null
  )

  const currentStudent = enrolledStudents[currentIndex]
  const currentScore = currentStudent
    ? existingScores.get(currentStudent._id)
    : undefined

  React.useEffect(() => {
    if (currentScore) {
      setScoreInput(String(currentScore.score))
      setFeedbackInput(currentScore.feedback ?? "")
    } else {
      setScoreInput("")
      setFeedbackInput("")
    }
    setSelectedFile(null)
  }, [currentIndex, currentScore])

  const studentFiles = React.useMemo(
    () =>
      submissionFiles.filter(
        (f) => !f.isFolder && f.uploadedBy?._id === currentStudent?._id
      ),
    [submissionFiles, currentStudent]
  )

  const assessmentMap = React.useMemo(
    () => new Map(allCourseAssessments.map((a) => [a._id, a])),
    [allCourseAssessments]
  )

  const otherScores = React.useMemo(
    () =>
      allCourseScores
        .filter((s) => {
          const sid =
            typeof s.studentId === "string" ? s.studentId : s.studentId._id
          return (
            sid === currentStudent?._id && s.assessmentId !== assessment._id
          )
        })
        .map((s) => ({
          title: assessmentMap.get(s.assessmentId)?.title ?? "Unknown",
          score: s.score,
          totalPoints: assessmentMap.get(s.assessmentId)?.totalPoints ?? 0,
        })),
    [allCourseScores, currentStudent, assessment._id, assessmentMap]
  )

  async function handleSave() {
    if (!currentStudent) return
    const score = Number(scoreInput)
    if (scoreInput === "" || isNaN(score)) {
      toast.error("Please enter a valid score")
      return
    }
    if (score < 0 || score > assessment.totalPoints) {
      toast.error(`Score must be between 0 and ${assessment.totalPoints}`)
      return
    }
    setSaving(true)
    try {
      if (currentScore) {
        await updateScore(currentScore._id, {
          score,
          feedback: feedbackInput.trim() || undefined,
        })
      } else {
        await createScore({
          assessmentId: assessment._id,
          studentId: currentStudent._id,
          score,
          feedback: feedbackInput.trim() || undefined,
        })
      }
      toast.success("Score saved")
    } catch {
      toast.error("Failed to save score")
    } finally {
      setSaving(false)
    }
  }

  function goNext() {
    if (currentIndex < enrolledStudents.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const previewContent = React.useMemo(() => {
    if (!selectedFile) return null
    const url = getStreamUrl(selectedFile.driveFileId ?? selectedFile._id)
    if (selectedFile.mimeType.startsWith("image/")) {
      return (
        <img
          src={url}
          alt={selectedFile.name}
          className="max-h-full max-w-full rounded-lg object-contain"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = "none"
          }}
        />
      )
    }
    if (selectedFile.mimeType.includes("pdf")) {
      return (
        <iframe
          src={url}
          className="h-full w-full rounded-lg"
          title={selectedFile.name}
        />
      )
    }
    if (selectedFile.mimeType.startsWith("video/")) {
      return (
        <video controls className="max-h-full max-w-full rounded-lg" key={url}>
          <source src={url} type={selectedFile.mimeType} />
        </video>
      )
    }
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        {fileTypeIcon(selectedFile.mimeType, "lg")}
        <p className="text-sm font-medium">{selectedFile.name}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline"
        >
          Download or open file
        </a>
      </div>
    )
  }, [selectedFile])

  if (!currentStudent) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <p className="text-sm text-muted-foreground">No enrolled students</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to assessments
        </Button>
      </div>
    )
  }

  const isGraded = !!currentScore

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{assessment.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge
                className={`rounded-full text-[10px] font-normal ${TYPE_COLORS[assessment.type] ?? ""}`}
                variant="outline"
              >
                {assessment.type}
              </Badge>
              <span>{assessment.totalPoints} pts</span>
              {assessment.dueDate && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span>
                    Due {new Date(assessment.dueDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: File Preview (3/4 of content) */}
        <div className="flex w-3/4 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card">
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
            {selectedFile ? (
              previewContent
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <File className="size-10" />
                <p className="text-sm">Select a file to preview</p>
              </div>
            )}
          </div>
          {studentFiles.length > 0 && (
            <div className="border-t border-border p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Submissions ({studentFiles.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {studentFiles.map((file) => (
                  <button
                    key={file._id}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors",
                      selectedFile?._id === file._id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {fileTypeIcon(file.mimeType)}
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground/60">
                      {timeAgo(file.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {studentFiles.length === 0 && (
            <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
              No submissions yet
            </div>
          )}
        </div>

        {/* Right: Score Entry */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Student Navigation */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <Select
              value={currentStudent._id}
              onValueChange={(val) => {
                const idx = enrolledStudents.findIndex((s) => s._id === val)
                if (idx >= 0) setCurrentIndex(idx)
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue>
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-sm font-medium">
                      {currentStudent.name}
                    </span>
                    {currentScore && (
                      <Badge
                        variant="secondary"
                        className="rounded-full font-mono text-[10px]"
                      >
                        {currentScore.score}/{assessment.totalPoints}
                      </Badge>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {enrolledStudents.map((student) => {
                  const hasScore = existingScores.has(student._id)
                  return (
                    <SelectItem key={student._id} value={student._id}>
                      <div className="flex items-center gap-2">
                        {hasScore ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Circle className="size-3 text-muted-foreground/40" />
                        )}
                        <span>{student.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {student.email}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex >= enrolledStudents.length - 1}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Score Form */}
          <div className="flex-1 rounded-xl border border-border bg-card p-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Score{" "}
                  <span className="text-muted-foreground/50">
                    (max {assessment.totalPoints})
                  </span>
                </label>
                <Input
                  type="number"
                  min={0}
                  max={assessment.totalPoints}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder={`Enter score (0-${assessment.totalPoints})`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Feedback
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Optional feedback for the student..."
                  rows={4}
                  className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-3 animate-spin" />
                    Saving...
                  </>
                ) : isGraded ? (
                  "Update Score"
                ) : (
                  "Save Score"
                )}
              </Button>
            </div>

            {/* Student Overview */}
            <div className="mt-6 space-y-3 border-t border-border pt-4">
              <p className="text-xs font-medium text-muted-foreground">
                Student Overview
              </p>
              {otherScores.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No other assessments in this course
                </p>
              ) : (
                <div className="space-y-1.5">
                  {otherScores.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5"
                    >
                      <span className="text-xs text-muted-foreground">
                        {s.title}
                      </span>
                      <span className="text-xs font-medium">
                        {s.score}/{s.totalPoints}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
