"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ListChecks } from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getAssessmentById, type Assessment } from "@/lib/services/assessments"
import { QuestionsManager } from "@/components/questions-manager"

export default function QuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const assessmentId = params.assessmentId as string
  const [assessment, setAssessment] = React.useState<Assessment | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getAssessmentById(assessmentId)
        setAssessment(data)
      } catch {
        setAssessment(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assessmentId])

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }

  if (!assessment) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Assessment not found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}?tab=assessments`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/courses/${courseId}/assessments/${assessmentId}`)}
        >
          <ListChecks className="mr-2 size-4" />
          Grade
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h1 className="text-lg font-bold">{assessment.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)} &middot;{" "}
          {assessment.totalPoints} pts
          {assessment.dueDate && <> &middot; Due {new Date(assessment.dueDate).toLocaleDateString()}</>}
        </p>
      </div>

      <QuestionsManager assessmentId={assessmentId} />
    </div>
  )
}
