import client from "../config/axios"

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

export interface Question {
  _id: string
  assessmentId: string
  type: "multiple_choice" | "true_false" | "essay" | "fill_in"
  question: string
  points: number
  order: number
  options?: QuestionOption[]
  correctAnswer?: string | boolean
  required: boolean
  multipleAnswers: boolean
  randomizeOrder: boolean
  estimationTime?: number
  createdAt: string
  updatedAt: string
}

export interface CreateQuestionInput {
  assessmentId: string
  type: "multiple_choice" | "true_false" | "essay" | "fill_in"
  question: string
  points?: number
  order?: number
  options?: QuestionOption[]
  correctAnswer?: string | boolean
  required?: boolean
  multipleAnswers?: boolean
  randomizeOrder?: boolean
  estimationTime?: number
}

export interface UpdateQuestionInput {
  question?: string
  type?: "multiple_choice" | "true_false" | "essay" | "fill_in"
  points?: number
  order?: number
  options?: QuestionOption[]
  correctAnswer?: string | boolean
  required?: boolean
  multipleAnswers?: boolean
  randomizeOrder?: boolean
  estimationTime?: number
}

export const getQuestions = async (assessmentId: string): Promise<Question[]> => {
  const response = await client.get("/questions", { params: { assessmentId } })
  return response.data
}

export const createQuestion = async (data: CreateQuestionInput): Promise<Question> => {
  const response = await client.post("/questions", data)
  return response.data
}

export const updateQuestion = async (
  questionId: string,
  data: UpdateQuestionInput
): Promise<Question> => {
  const response = await client.put(`/questions/${questionId}`, data)
  return response.data
}

export const deleteQuestion = async (questionId: string): Promise<void> => {
  await client.delete(`/questions/${questionId}`)
}

export const reorderQuestions = async (
  assessmentId: string,
  questionIds: string[]
): Promise<void> => {
  await client.patch("/questions/reorder", { questionIds }, { params: { assessmentId } })
}
