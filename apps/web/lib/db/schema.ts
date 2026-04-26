export interface LocalCourse {
  id: string
  instructorId: string
  name: string
  code: string
  description?: string
  semester: string
  timestamp: number
  syncedAt?: number // when last synced from server
}

export interface LocalAttendance {
  id: string
  courseId: string
  studentId: string
  date: string // ISO date string
  status: "present" | "absent" | "late"
  syncedAt?: number
  pendingSync?: boolean // true = needs to be sent to server
}

export interface LocalAssessment {
  id: string
  courseId: string
  title: string
  type: "quiz" | "exam" | "assignment"
  dueDate?: string
  totalPoints: number
  syncedAt?: number
}

export interface LocalAssessmentScore {
  id: string
  assessmentId: string
  studentId: string
  score: number
  feedback?: string
  syncedAt?: number
  pendingSync?: boolean
}
