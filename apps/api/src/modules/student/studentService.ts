import { User } from "../../models/userModel.js"
import { Student } from "../../models/studentModel.js"

export const studentService = {
  async getProfile(userId: string) {
    const [user, student] = await Promise.all([
      User.findById(userId).lean(),
      Student.findOne({ userId }).lean(),
    ])
    return {
      user: {
        name: user?.name ?? "",
        firstName: (user as any)?.firstName ?? "",
        lastName: (user as any)?.lastName ?? "",
        phoneNumber: (user as any)?.phoneNumber ?? "",
      },
      student: {
        yearLevel: student?.yearLevel ?? null,
        program: student?.program ?? "",
        guardianName: student?.guardianName ?? "",
        guardianContact: student?.guardianContact ?? "",
      },
    }
  },

  async upsertAcademicInfo(
    userId: string,
    data: {
      yearLevel?: number
      program?: string
      guardianName?: string
      guardianContact?: string
    }
  ) {
    await Student.findOneAndUpdate(
      { userId },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    )
  },
}
