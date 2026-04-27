import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

export function StorySurface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[14rem] min-w-[20rem] items-center justify-center rounded-xl border border-dashed bg-background p-6",
        className
      )}
    >
      {children}
    </div>
  )
}

export function StoryStack({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {children}
    </div>
  )
}

export function StoryGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("grid w-full max-w-4xl gap-4 md:grid-cols-2", className)}
    >
      {children}
    </div>
  )
}
