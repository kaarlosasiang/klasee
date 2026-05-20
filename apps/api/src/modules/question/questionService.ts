import { Question } from "../../models/questionModel.js"

interface QuestionOption {
  text: string
  isCorrect?: boolean
}

interface CreateQuestionData {
  assessmentId: string
  type: "multiple_choice" | "true_false" | "essay" | "fill_in"
  question: string
  points?: number
  order?: number
  options?: QuestionOption[]
  correctAnswer?: string | boolean
}

interface UpdateQuestionData {
  question?: string
  type?: "multiple_choice" | "true_false" | "essay" | "fill_in"
  points?: number
  order?: number
  options?: QuestionOption[]
  correctAnswer?: string | boolean
}

export const questionService = {
  async findByAssessment(assessmentId: string) {
    return Question.find({ assessmentId }).sort({ order: 1, createdAt: 1 }).lean()
  },

  async findById(id: string) {
    return Question.findById(id).lean()
  },

  async create(data: CreateQuestionData) {
    const order =
      data.order ?? (await Question.countDocuments({ assessmentId: data.assessmentId }))
    return Question.create({ ...data, order })
  },

  async update(id: string, data: UpdateQuestionData) {
    return Question.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Question.findByIdAndDelete(id)
  },

  async reorder(assessmentId: string, questionIds: string[]) {
    const updates = questionIds.map((id, index) =>
      Question.findByIdAndUpdate(id, { order: index }, { new: true }).lean()
    )
    return Promise.all(updates)
  },

  async deleteByAssessment(assessmentId: string) {
    return Question.deleteMany({ assessmentId })
  },
}
