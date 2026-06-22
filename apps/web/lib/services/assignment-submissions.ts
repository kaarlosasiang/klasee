import client from "../config/axios"

export interface SubmissionFile {
  fileId?: string
  name?: string
  driveFileId?: string
  mimeType?: string
}

export interface AssignmentSubmission {
  _id: string
  assessmentId: string
  userId: { _id: string; name: string; email: string }
  content?: string
  files: SubmissionFile[]
  grade?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: { _id: string; name: string; email: string }
  submittedAt: string
  createdAt: string
  updatedAt: string
}

export interface SubmitAssignmentInput {
  assessmentId: string
  content?: string
  files?: SubmissionFile[]
}

export interface GradeAssignmentInput {
  grade: number
  feedback?: string
}

export interface RecentSubmission {
  _id: string
  submittedAt: string
  student: { name: string; email: string }
  assessment: { _id: string; title: string; courseId: { name: string; code: string } }
}

export const getRecentSubmissions = async (limit = 6): Promise<RecentSubmission[]> => {
  const response = await client.get("/assignment-submissions/recent", { params: { limit } })
  return response.data
}

export const getAssignmentSubmissions = async (
  assessmentId: string
): Promise<AssignmentSubmission[]> => {
  const response = await client.get("/assignment-submissions", { params: { assessmentId } })
  return response.data
}

export const getMyAssignmentSubmission = async (
  assessmentId: string
): Promise<AssignmentSubmission> => {
  const response = await client.get("/assignment-submissions/my", { params: { assessmentId } })
  return response.data
}

export const getAssignmentSubmission = async (id: string): Promise<AssignmentSubmission> => {
  const response = await client.get(`/assignment-submissions/${id}`)
  return response.data
}

export const submitAssignment = async (
  data: SubmitAssignmentInput
): Promise<AssignmentSubmission> => {
  const response = await client.post("/assignment-submissions/submit", data)
  return response.data
}

export const gradeAssignmentSubmission = async (
  submissionId: string,
  data: GradeAssignmentInput
): Promise<AssignmentSubmission> => {
  const response = await client.put(`/assignment-submissions/${submissionId}/grade`, data)
  return response.data
}
