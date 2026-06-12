import mongoose from "mongoose"
import { CourseWiki } from "../../models/courseWikiModel.js"

export const wikiService = {
  async findByCourse(courseId: string) {
    return CourseWiki.findOne({ courseId }).lean()
  },

  async upsert(courseId: string, content: string, updatedBy: string) {
    return CourseWiki.findOneAndUpdate(
      { courseId: new mongoose.Types.ObjectId(courseId) },
      { content, updatedBy: new mongoose.Types.ObjectId(updatedBy) },
      { new: true, upsert: true }
    ).lean()
  },
}
