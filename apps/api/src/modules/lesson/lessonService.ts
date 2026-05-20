import { Lesson } from "../../models/lessonModel.js"

export const lessonService = {
  async findByModule(moduleId: string, filter: Record<string, unknown> = {}) {
    return Lesson.find({ moduleId, ...filter }).sort({ order: 1, createdAt: 1 }).lean()
  },

  async findById(id: string) {
    return Lesson.findById(id).populate("fileId", "name mimeType driveFileId").lean()
  },

  async create(data: {
    moduleId: string
    title: string
    content?: string
    type?: "page" | "video" | "file" | "embed"
    order?: number
    fileId?: string
  }) {
    const order = data.order ?? (await Lesson.countDocuments({ moduleId: data.moduleId }))
    return Lesson.create({ ...data, order })
  },

  async update(
    id: string,
    data: Partial<{ title: string; content: string; type: string; order: number; fileId: string; isPublished: boolean }>
  ) {
    return Lesson.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Lesson.findByIdAndDelete(id)
  },

  async reorder(moduleId: string, lessonIds: string[]) {
    const updates = lessonIds.map((id, index) =>
      Lesson.findByIdAndUpdate(id, { order: index }, { new: true }).lean()
    )
    return Promise.all(updates)
  },
}
