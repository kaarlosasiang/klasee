import { ItemBank } from "../../models/itemBankModel.js"
import { Question } from "../../models/questionModel.js"

export const itemBankService = {
  async findByCourse(courseId: string) {
    return ItemBank.find({ courseId }).sort({ createdAt: -1 }).lean()
  },

  async findById(id: string) {
    return ItemBank.findById(id).lean()
  },

  async create(data: { courseId: string; name: string; instructorId: string }) {
    return ItemBank.create(data)
  },

  async update(id: string, name: string) {
    return ItemBank.findByIdAndUpdate(id, { name }, { new: true }).lean()
  },

  async delete(id: string) {
    await Question.deleteMany({ itemBankId: id })
    return ItemBank.findByIdAndDelete(id)
  },
}
