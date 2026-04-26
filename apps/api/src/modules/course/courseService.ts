import { Course } from "../../models/courseModel.js"

export const courseService = {
  async findAll(filter: Record<string, unknown> = {}) {
    return Course.find(filter).populate("instructorId", "name email").lean()
  },

  async findById(id: string) {
    return Course.findById(id).populate("instructorId", "name email").lean()
  },

  async create(data: {
    instructorId: string
    name: string
    code: string
    description?: string
    semester: string
  }) {
    return Course.create(data)
  },

  async update(id: string, data: Partial<{ name: string; code: string; description: string; semester: string }>) {
    return Course.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Course.findByIdAndDelete(id)
  },
}
