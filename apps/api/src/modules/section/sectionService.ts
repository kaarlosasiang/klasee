import { Section } from "../../models/sectionModel.js"

export const sectionService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Section.find(filter)
      .populate("courseId", "name code")
      .populate("instructorId", "name email")
      .lean()
  },

  async findById(id: string) {
    return Section.findById(id)
      .populate("courseId", "name code")
      .populate("instructorId", "name email")
      .lean()
  },

  async create(data: {
    courseId: string
    instructorId: string
    name: string
    schedule?: string
    room?: string
    maxStudents?: number
  }) {
    return Section.create(data)
  },

  async update(id: string, data: Partial<{ name: string; schedule: string; room: string; maxStudents: number }>) {
    return Section.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Section.findByIdAndDelete(id)
  },
}
