"use client"

import * as React from "react"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Sheet, SheetContent } from "@workspace/ui/components/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { useStudentDetail } from "@/lib/hooks/useStudentDetail"
import { StudentDetailHeader } from "./student-detail-header"
import { ActivityTab } from "./tabs/activity-tab"
import { AssignedTab } from "./tabs/assigned-tab"
import { NeedsReviewTab } from "./tabs/needs-review-tab"
import { ProgressTab } from "./tabs/progress-tab"
import type { StudentDetailSheetProps } from "./types"

export function StudentDetailSheet({
  enrollment,
  enrollments,
  open,
  onOpenChange,
  onNavigate,
}: StudentDetailSheetProps) {
  const [activeTab, setActiveTab] = React.useState("activity")

  const currentIndex = React.useMemo(
    () => enrollments.findIndex((e) => e._id === enrollment?._id),
    [enrollments, enrollment]
  )

  const { data, loading, error } = useStudentDetail(enrollment?._id ?? null)

  // Reset tab when switching students
  React.useEffect(() => {
    setActiveTab("activity")
  }, [enrollment?._id])

  const assignedCount = data?.assigned?.length ?? 0
  const needsReviewCount = data?.needsReview?.length ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex min-w-[500px] flex-col gap-0 p-0 sm:max-w-[600px]"
      >
        {enrollment && (
          <StudentDetailHeader
            enrollment={enrollment}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < enrollments.length - 1}
            onPrev={() =>
              currentIndex > 0 && onNavigate(enrollments[currentIndex - 1]!)
            }
            onNext={() =>
              currentIndex < enrollments.length - 1 &&
              onNavigate(enrollments[currentIndex + 1]!)
            }
          />
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-0 rounded-none border-b px-4 py-0"
          >
            <TabsTrigger value="activity" className="px-3 py-2.5">
              Activity
            </TabsTrigger>
            <TabsTrigger value="assigned" className="gap-1.5 px-3 py-2.5">
              Assigned
              {assignedCount > 0 && (
                <Badge
                  variant="secondary"
                  className="size-4 justify-center p-0 text-[10px]"
                >
                  {assignedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="needs-review" className="gap-1.5 px-3 py-2.5">
              Need to review
              {needsReviewCount > 0 && (
                <Badge
                  variant="secondary"
                  className="size-4 justify-center p-0 text-[10px]"
                >
                  {needsReviewCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="progress" className="px-3 py-2.5">
              Progress
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {error ? (
              <p className="p-4 text-sm text-muted-foreground">{error}</p>
            ) : (
              <>
                <TabsContent value="activity" className="mt-0">
                  <ActivityTab data={data} loading={loading} />
                </TabsContent>
                <TabsContent value="assigned" className="mt-0">
                  <AssignedTab data={data} loading={loading} />
                </TabsContent>
                <TabsContent value="needs-review" className="mt-0">
                  <NeedsReviewTab data={data} loading={loading} />
                </TabsContent>
                <TabsContent value="progress" className="mt-0">
                  <ProgressTab data={data} loading={loading} />
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
