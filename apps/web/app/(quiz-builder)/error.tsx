"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export default function QuizBuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const courseId = params?.id as string | undefined

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
        {courseId && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/courses/${courseId}?tab=assessments`}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to course
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
