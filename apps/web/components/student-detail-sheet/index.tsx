"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Sheet, SheetContent } from "@workspace/ui/components/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { dropEnrollment } from "@/lib/services/enrollments"
import { toast } from "sonner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { StudentDetailHeader } from "./student-detail-header"
import { OverviewTab } from "./tabs/overview-tab"
import { ActivitiesTab } from "./tabs/activities-tab"
import { GradesTab } from "./tabs/grades-tab"
import type { StudentDetailSheetProps } from "./types"

export function StudentDetailSheet({
  enrollment,
  enrollments,
  open,
  onOpenChange,
  onNavigate,
  onDrop,
}: StudentDetailSheetProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [dropConfirm, setDropConfirm] = React.useState(false)
  const [dropping, setDropping] = React.useState(false)

  const currentIndex = React.useMemo(
    () => enrollments.findIndex((e) => e._id === enrollment?._id),
    [enrollments, enrollment]
  )

  // Reset tab when switching students
  React.useEffect(() => {
    setActiveTab("overview")
  }, [enrollment?._id])

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
            <TabsTrigger value="overview" className="px-3 py-2.5">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="px-3 py-2.5">
              Activities
            </TabsTrigger>
            <TabsTrigger value="grades" className="px-3 py-2.5">
              Grades
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="mt-0">
              {enrollment && <OverviewTab enrollment={enrollment} />}
            </TabsContent>
            <TabsContent value="activities" className="mt-0">
              {enrollment && <ActivitiesTab enrollment={enrollment} />}
            </TabsContent>
            <TabsContent value="grades" className="mt-0">
              {enrollment && <GradesTab enrollment={enrollment} />}
            </TabsContent>
          </ScrollArea>

          {enrollment?.status === "active" && (
            <div className="flex items-center justify-end border-t p-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDropConfirm(true)}
              >
                Drop student
              </Button>
            </div>
          )}
        </Tabs>

        <AlertDialog open={dropConfirm} onOpenChange={setDropConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Drop student?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark{" "}
                <span className="font-medium text-foreground">
                  {enrollment?.studentId.name}
                </span>{" "}
                as dropped from{" "}
                <span className="font-medium text-foreground">
                  {enrollment?.sectionId.name}
                </span>
                . This cannot be undone from here.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={dropping}
                onClick={async () => {
                  if (!enrollment) return
                  setDropping(true)
                  try {
                    await dropEnrollment(enrollment._id)
                    toast.success(`${enrollment.studentId.name} has been dropped`)
                    setDropConfirm(false)
                    onDrop?.(enrollment._id)
                    onOpenChange(false)
                  } catch {
                    toast.error("Failed to drop student")
                  } finally {
                    setDropping(false)
                  }
                }}
              >
                {dropping ? "Dropping..." : "Drop"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
