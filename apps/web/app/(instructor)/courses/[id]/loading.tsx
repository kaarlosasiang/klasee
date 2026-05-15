import { Skeleton } from "@workspace/ui/components/skeleton"

export default function CourseDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="flex gap-6">
        <div className="w-48 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
