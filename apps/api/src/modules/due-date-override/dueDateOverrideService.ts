import { DueDateOverride } from "../../models/dueDateOverrideModel.js"

export const dueDateOverrideService = {
  async findByAssessment(assessmentId: string) {
    return DueDateOverride.find({ assessmentId }).sort({ type: 1 }).lean()
  },

  async upsert(data: {
    assessmentId: string
    type: "section" | "student"
    targetId: string
    dueDate: Date
  }) {
    return DueDateOverride.findOneAndUpdate(
      { assessmentId: data.assessmentId, type: data.type, targetId: data.targetId },
      { dueDate: data.dueDate },
      { upsert: true, new: true }
    ).lean()
  },

  async delete(id: string) {
    return DueDateOverride.findByIdAndDelete(id)
  },
}
