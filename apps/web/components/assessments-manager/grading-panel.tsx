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
import { getStreamUrl } from "@/lib/services/drive"
import {
  createScore,
  updateScore,
  type Assessment,
  type AssessmentScore,
} from "@/lib/services/assessments"
import { type AssignmentSubmission, type SubmissionFile } from "@/lib/services/assignment-submissions"
import { type QuizAttempt } from "@/lib/services/quiz-attempts"
import { type Question } from "@/lib/services/questions"
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
  submissions?: AssignmentSubmission[]
  allCourseAssessments: Assessment[]
  allCourseScores: AssessmentScore[]
  quizAttempts?: QuizAttempt[]
  questions?: Question[]
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
  submissions = [],
  allCourseAssessments,
  allCourseScores,
  quizAttempts = [],
  questions = [],
  onBack,
}: GradingPanelProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [scoreInput, setScoreInput] = React.useState("")
  const [feedbackInput, setFeedbackInput] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<SubmissionFile | null>(null)

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

  const currentSubmission = React.useMemo(
    () => submissions.find((s) => s.userId._id === currentStudent?._id),
    [submissions, currentStudent]
  )

  const studentFiles = React.useMemo(
    () => currentSubmission?.files ?? [],
    [currentSubmission]
  )

  const currentAttempt = React.useMemo(
    () =>
      quizAttempts.find(
        (a) =>
          (typeof a.userId === "string" ? a.userId : a.userId._id) === currentStudent?._id &&
          a.status === "completed"
      ),
    [quizAttempts, currentStudent]
  )

  const isQuizType = assessment.type === "quiz" || assessment.type === "exam"

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
    const url = getStreamUrl(selectedFile.driveFileId ?? selectedFile.fileId ?? "")
    const mime = selectedFile.mimeType ?? ""
    if (mime.startsWith("image/")) {
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
    if (mime.includes("pdf")) {
      return (
        <iframe
          src={url}
          className="h-full w-full rounded-lg"
          title={selectedFile.name}
        />
      )
    }
    if (mime.startsWith("video/")) {
      return (
        <video controls className="max-h-full max-w-full rounded-lg" key={url}>
          <source src={url} type={mime} />
        </video>
      )
    }
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        {fileTypeIcon(mime, "lg")}
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
        {/* Left: Quiz answers (quiz/exam) or File Preview (assignment) */}
        <div className="flex w-3/4 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card">
          {isQuizType ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-auto">
              {currentAttempt ? (
                <div className="space-y-3 p-4">
                  {questions.map((q, i) => {
                    const ans = currentAttempt.answers.find((a) => a.questionId === q._id)
                    const answerText =
                      q.type === "multiple_choice" && typeof ans?.answer === "number" && q.options
                        ? q.options[ans.answer as number]?.text ?? String(ans.answer)
                        : q.type === "true_false"
                          ? ans?.answer === true ? "True" : ans?.answer === false ? "False" : "—"
                          : ans?.answer != null
                            ? String(ans.answer)
                            : "—"

                    return (
                      <div key={q._id} className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">Q{i + 1}</span>
                          <span>{q.points} pt{q.points !== 1 ? "s" : ""}</span>
                          <Badge variant="outline" className="rounded-full text-[10px] font-normal">
                            {q.type === "multiple_choice" ? "MC" : q.type === "true_false" ? "T/F" : q.type === "essay" ? "Essay" : "Fill-in"}
                          </Badge>
                          {ans && ans.isCorrect !== null && (
                            <span className={`ml-auto font-medium ${ans.isCorrect ? "text-green-600" : "text-red-500"}`}>
                              {ans.isCorrect ? `+${ans.pointsEarned}` : "✗"} / {q.points}
                            </span>
                          )}
                          {ans && ans.isCorrect === null && (
                            <span className="ml-auto text-[10px] text-amber-600">Needs grading</span>
                          )}
                        </div>
                        <p className="mb-2 text-xs font-medium text-foreground">{q.question}</p>
                        {q.type === "essay" ? (
                          <div className="rounded-md border-l-2 border-primary/30 bg-background pl-3 py-2 text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                            {answerText || <span className="text-muted-foreground italic">No answer provided</span>}
                          </div>
                        ) : (
                          <p className="rounded-md bg-background px-2 py-1.5 text-xs text-foreground">
                            {answerText}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <FileText className="size-10" />
                  <p className="text-sm">No completed attempt for this student</p>
                </div>
              )}
            </div>
          ) : (
            <>
              {currentSubmission?.content && (
                <div className="shrink-0 border-b border-border p-4">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Written response</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{currentSubmission.content}</p>
                </div>
              )}
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
                {selectedFile ? (
                  previewContent
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <File className="size-10" />
                    <p className="text-sm">
                      {currentSubmission ? "Select a file to preview" : "No submission yet"}
                    </p>
                    {currentSubmission && (
                      <p className="text-xs text-muted-foreground/60">
                        Submitted {timeAgo(currentSubmission.submittedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {studentFiles.length > 0 && (
                <div className="border-t border-border p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Files ({studentFiles.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {studentFiles.map((file, i) => (
                      <button
                        key={file.fileId ?? file.driveFileId ?? i}
                        type="button"
                        onClick={() => setSelectedFile(file)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors",
                          (selectedFile?.fileId ?? selectedFile?.driveFileId) === (file.fileId ?? file.driveFileId)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {fileTypeIcon(file.mimeType ?? "")}
                        <span className="max-w-[120px] truncate">{file.name ?? "File"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!currentSubmission && (
                <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
                  No submission yet
                </div>
              )}
            </>
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
