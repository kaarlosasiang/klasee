import { Announcement } from "../../models/announcementModel.js"

export const announcementService = {
  async findByCourse(courseId: string) {
    return Announcement.find({ courseId })
      .populate("authorId", "name email")
      .sort({ isPinned: -1, createdAt: -1 })
      .lean()
  },

  async findById(id: string) {
    return Announcement.findById(id)
      .populate("authorId", "name email")
      .lean()
  },

  async create(data: {
    courseId: string
    authorId: string
    title: string
    content: string
    isPinned?: boolean
  }) {
    return Announcement.create(data)
  },

  async update(
    id: string,
    data: Partial<{ title: string; content: string; isPinned: boolean }>
  ) {
    return Announcement.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Announcement.findByIdAndDelete(id)
  },
}
