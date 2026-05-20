import client from "../config/axios"

export interface QuizAttemptAnswer {
  questionId: string
  answer: unknown
  isCorrect: boolean | null
  pointsEarned: number
}

export interface QuizAttempt {
  _id: string
  assessmentId: string
  userId: { _id: string; name: string; email: string }
  startedAt: string
  completedAt?: string
  status: "in_progress" | "completed"
  answers: QuizAttemptAnswer[]
  totalPointsEarned: number
  totalPointsPossible: number
  createdAt: string
  updatedAt: string
}

export const getQuizAttempts = async (assessmentId: string): Promise<QuizAttempt[]> => {
  const response = await client.get("/quiz-attempts", { params: { assessmentId } })
  return response.data
}

export const getMyQuizAttempts = async (assessmentId: string): Promise<QuizAttempt[]> => {
  const response = await client.get("/quiz-attempts/my", { params: { assessmentId } })
  return response.data
}

export const getQuizAttempt = async (attemptId: string): Promise<QuizAttempt> => {
  const response = await client.get(`/quiz-attempts/${attemptId}`)
  return response.data
}

export const startQuizAttempt = async (assessmentId: string): Promise<QuizAttempt> => {
  const response = await client.post("/quiz-attempts/start", { assessmentId })
  return response.data
}

export const submitQuizAttempt = async (
  attemptId: string,
  answers: { questionId: string; answer: unknown }[]
): Promise<QuizAttempt> => {
  const response = await client.post(`/quiz-attempts/${attemptId}/submit`, { answers })
  return response.data
}
