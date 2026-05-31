import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function QuestionsNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">Assessment not found</p>
      <Link
        href="/courses"
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-3.5" />
        Back to courses
      </Link>
    </div>
  )
}
