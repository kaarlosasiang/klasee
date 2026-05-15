import { Skeleton } from "@workspace/ui/components/skeleton"

export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  )
}
