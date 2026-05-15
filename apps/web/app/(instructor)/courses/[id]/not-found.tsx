import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function CourseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <GraduationCap className="size-10 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Course not found</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        This course does not exist or may have been removed.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/courses">Back to courses</Link>
      </Button>
    </div>
  )
}
