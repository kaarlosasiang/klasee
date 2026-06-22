import client from "../config/axios"

export interface LatePolicy {
  enabled: boolean
  deductionType: "percent" | "flat"
  deductionPerDay: number
  maxDeduction: number
}

export interface Assessment {
  _id: string
  courseId: string
  title: string
  type: "quiz" | "exam" | "assignment"
  totalPoints: number
  dueDate?: string
  isPublished: boolean
  timeLimit?: number
  randomizeQuestions?: boolean
  showAnswerAfter?: boolean
  redemptionQuestion?: boolean
  skipQuestions?: boolean
  estimatedDuration?: number
  tags?: string[]
  instructions?: string
  allowedFileTypes?: string[]
  maxFiles?: number
  groupId?: string
  latePolicy?: LatePolicy
  effectiveDueDate?: string
  createdAt: string
  updatedAt: string
}

export interface AssessmentScore {
  _id: string
  assessmentId: string
  studentId: {
    _id: string
    name: string
    email: string
  }
  score: number
  feedback?: string
  createdAt: string
  updatedAt: string
}

export const getAssessments = async (
  courseId: string
): Promise<Assessment[]> => {
  const response = await client.get("/assessments", {
    params: { courseId },
  })
  return response.data
}

export const getAssessmentById = async (
  id: string
): Promise<Assessment> => {
  const response = await client.get(`/assessments/${id}`)
  return response.data
}

export const createAssessment = async (data: {
  courseId: string
  title: string
  type: "quiz" | "exam" | "assignment"
  totalPoints: number
  dueDate?: string
  isPublished?: boolean
  timeLimit?: number
  randomizeQuestions?: boolean
  showAnswerAfter?: boolean
  redemptionQuestion?: boolean
  skipQuestions?: boolean
  estimatedDuration?: number
  tags?: string[]
  instructions?: string
  allowedFileTypes?: string[]
  maxFiles?: number
  latePolicy?: LatePolicy
}): Promise<Assessment> => {
  const response = await client.post("/assessments", data)
  return response.data
}

export const updateAssessment = async (
  id: string,
  data: Partial<{
    title: string
    type: string
    totalPoints: number
    dueDate: string
    isPublished: boolean
    timeLimit: number
    randomizeQuestions: boolean
    instructions: string
    allowedFileTypes: string[]
    maxFiles: number
    groupId: string
    latePolicy: LatePolicy
  }>
): Promise<Assessment> => {
  const response = await client.put(`/assessments/${id}`, data)
  return response.data
}

export const deleteAssessment = async (id: string): Promise<void> => {
  await client.delete(`/assessments/${id}`)
}

export const getScores = async (params: {
  assessmentId?: string
  studentId?: string
  courseId?: string
}): Promise<AssessmentScore[]> => {
  const response = await client.get("/assessments/scores", { params })
  return response.data
}

export const createScore = async (data: {
  assessmentId: string
  studentId: string
  score: number
  feedback?: string
}): Promise<AssessmentScore> => {
  const response = await client.post("/assessments/scores", data)
  return response.data
}

export const updateScore = async (
  id: string,
  data: Partial<{ score: number; feedback: string }>
): Promise<AssessmentScore> => {
  const response = await client.put(`/assessments/scores/${id}`, data)
  return response.data
}

export const upsertScore = async (data: {
  assessmentId: string
  studentId: string
  score: number
  feedback?: string
}): Promise<AssessmentScore> => {
  const response = await client.put("/assessments/scores/upsert", data)
  return response.data
}
