import { AssignmentGroup } from "../../models/assignmentGroupModel.js"
import { Assessment } from "../../models/assessmentModel.js"

export const assignmentGroupService = {
  async findByCourse(courseId: string) {
    return AssignmentGroup.find({ courseId }).sort({ order: 1 }).lean()
  },

  async create(data: {
    courseId: string
    name: string
    weight: number
    dropLowest?: number
    order?: number
  }) {
    return AssignmentGroup.create(data)
  },

  async update(
    id: string,
    data: Partial<{ name: string; weight: number; dropLowest: number; order: number }>
  ) {
    return AssignmentGroup.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    await Assessment.updateMany({ groupId: id }, { $unset: { groupId: 1 } })
    return AssignmentGroup.findByIdAndDelete(id)
  },
}
