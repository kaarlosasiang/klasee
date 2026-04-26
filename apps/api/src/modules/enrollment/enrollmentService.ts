import { Enrollment } from "../../models/enrollmentModel.js"

export const enrollmentService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Enrollment.find(filter)
      .populate("studentId", "name email")
      .populate("sectionId", "name schedule")
      .populate("courseId", "name code")
      .lean()
  },

  async create(data: {
    studentId: string
    sectionId: string
    courseId: string
  }) {
    return Enrollment.create(data)
  },

  async update(id: string, data: Partial<{ status: string }>) {
    return Enrollment.findByIdAndUpdate(id, data, { new: true }).lean()
  },
}
