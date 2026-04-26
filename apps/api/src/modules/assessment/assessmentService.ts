import { Assessment } from "../../models/assessmentModel.js"
import { AssessmentScore } from "../../models/assessmentScore.js"

export const assessmentService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Assessment.find(filter).lean()
  },

  async findById(id: string) {
    return Assessment.findById(id).lean()
  },

  async create(data: {
    courseId: string
    title: string
    type: "quiz" | "exam" | "assignment"
    totalPoints: number
    dueDate?: string
  }) {
    return Assessment.create(data)
  },

  async update(id: string, data: Partial<{ title: string; type: string; totalPoints: number; dueDate: string }>) {
    return Assessment.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Assessment.findByIdAndDelete(id)
  },

  async findScores(filter: Record<string, unknown> = {}) {
    return AssessmentScore.find(filter)
      .populate("studentId", "name email")
      .lean()
  },

  async createScore(data: {
    assessmentId: string
    studentId: string
    score: number
    feedback?: string
  }) {
    return AssessmentScore.create(data)
  },

  async updateScore(id: string, data: Partial<{ score: number; feedback: string }>) {
    return AssessmentScore.findByIdAndUpdate(id, data, { new: true }).lean()
  },
}
