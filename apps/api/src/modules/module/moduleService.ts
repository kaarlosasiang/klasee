import { Module } from "../../models/moduleModel.js"

export const moduleService = {
  async findByCourse(courseId: string, filter: Record<string, unknown> = {}) {
    return Module.find({ courseId, ...filter }).sort({ order: 1, createdAt: 1 }).lean()
  },

  async findById(id: string) {
    return Module.findById(id).lean()
  },

  async create(data: {
    courseId: string
    title: string
    description?: string
    order?: number
  }) {
    const order = data.order ?? (await Module.countDocuments({ courseId: data.courseId }))
    return Module.create({ ...data, order })
  },

  async update(
    id: string,
    data: Partial<{ title: string; description: string; order: number; isPublished: boolean }>
  ) {
    return Module.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Module.findByIdAndDelete(id)
  },

  async reorder(courseId: string, moduleIds: string[]) {
    const updates = moduleIds.map((id, index) =>
      Module.findByIdAndUpdate(id, { order: index }, { new: true }).lean()
    )
    return Promise.all(updates)
  },
}
