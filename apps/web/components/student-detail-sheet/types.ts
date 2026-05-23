import type { Enrollment } from "@/lib/services/enrollments"

export interface StudentDetailSheetProps {
  enrollment: Enrollment | null
  enrollments: Enrollment[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: (enrollment: Enrollment) => void
  onDrop?: (enrollmentId: string) => void
}
