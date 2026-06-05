import client from "../config/axios"
import type { AssignmentGroup } from "./assignment-groups"

export interface GradeEntry {
  grade: string
  remark: string
}

export interface AssessmentScoreEntry {
  assessmentId: string
  groupId: string | null
  earned: number | null
  possible: number
  isGraded: boolean
  latePenalty: number
}

export interface StudentAssessmentScoreEntry extends AssessmentScoreEntry {
  title: string
  type: "quiz" | "exam" | "assignment"
  dueDate?: string
}

export interface GroupSummary {
  groupId: string
  name: string
  weight: number
  dropLowest: number
  finalPct: number
  currentPct: number | null
  finalEarned: number
  finalPossible: number
}

export interface GradebookStudent {
  student: { _id: string; name: string; email: string }
  assessmentScores: AssessmentScoreEntry[]
  groupSummaries: GroupSummary[]
  currentScore: number | null
  finalScore: number | null
  gradeEntry: GradeEntry | null
  currentGradeEntry: GradeEntry | null
}

export interface CourseGradebook {
  assessments: {
    _id: string
    title: string
    type: string
    totalPoints: number
    groupId?: string
  }[]
  groups: AssignmentGroup[]
  students: GradebookStudent[]
  total: number
  page: number
  limit: number
}

export interface StudentGradebook {
  assessments: StudentAssessmentScoreEntry[]
  groups: GroupSummary[]
  currentScore: number | null
  finalScore: number | null
  gradeEntry: GradeEntry | null
  currentGradeEntry: GradeEntry | null
}

export const getCourseGradebook = async (
  courseId: string,
  page = 1,
  limit = 20
): Promise<CourseGradebook> => {
  const response = await client.get("/gradebook", { params: { courseId, page, limit } })
  return response.data
}

export const getMyGradebook = async (courseId: string): Promise<StudentGradebook> => {
  const response = await client.get("/gradebook/my", { params: { courseId } })
  return response.data
}

export const exportGradebook = async (courseId: string): Promise<Blob> => {
  const response = await client.get("/gradebook/export", {
    params: { courseId },
    responseType: "blob",
  })
  return response.data
}
