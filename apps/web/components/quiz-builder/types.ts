export type QuestionType = "multiple_choice" | "true_false" | "essay" | "fill_in"

export interface QuestionOption {
  text: string
  isCorrect: boolean
}

// Minimal shape both draft (local) and persisted questions satisfy
export interface QuestionLike {
  _id: string
  type: QuestionType
  question: string
  points: number
  options?: QuestionOption[]
  correctAnswer?: string | boolean
  required: boolean
  multipleAnswers: boolean
  randomizeOrder: boolean
  estimationTime?: number
}
