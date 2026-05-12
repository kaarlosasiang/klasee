import mongoose from "mongoose"
import { Course } from "../../models/courseModel.js"
import "../../models/userModel.js" // ensure User schema is registered for populate

export const courseService = {
  async findAll(filter: Record<string, unknown> = {}) {
    const matchFilter: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(filter).map(([key, value]) => [
          key,
          typeof value === "string" && /^[a-f\d]{24}$/i.test(value)
            ? new mongoose.Types.ObjectId(value)
            : value,
        ])
      ),
      isArchived: { $ne: true },
    }
    return Course.aggregate([
      { $match: matchFilter },
      // Match archived courses too if filter explicitly asks
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "courseId",
          as: "sections",
        },
      },
      {
        $lookup: {
          from: "enrollments",
          localField: "sections._id",
          foreignField: "sectionId",
          as: "enrollments",
        },
      },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "courseId",
          as: "assessments",
        },
      },
      {
        $addFields: {
          sectionCount: { $size: "$sections" },
          enrolledCount: { $size: "$enrollments" },
          assessmentCount: { $size: "$assessments" },
          lastActivity: {
            $max: {
              $map: { input: "$enrollments", as: "e", in: "$$e.updatedAt" },
            },
          },
        },
      },
      { $project: { sections: 0, enrollments: 0, assessments: 0 } },
      { $sort: { createdAt: -1 } },
    ])
  },

  async findById(id: string) {
    const result = await Course.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "courseId",
          as: "sections",
        },
      },
      {
        $lookup: {
          from: "enrollments",
          localField: "sections._id",
          foreignField: "sectionId",
          as: "enrollments",
        },
      },
      {
        $lookup: {
          from: "assessments",
          localField: "_id",
          foreignField: "courseId",
          as: "assessments",
        },
      },
      {
        $addFields: {
          sectionCount: { $size: "$sections" },
          enrolledCount: { $size: "$enrollments" },
          assessmentCount: { $size: "$assessments" },
          lastActivity: {
            $max: {
              $map: { input: "$enrollments", as: "e", in: "$$e.updatedAt" },
            },
          },
        },
      },
      { $project: { sections: 0, enrollments: 0, assessments: 0 } },
    ])
    return result[0] ?? null
  },

  async create(data: {
    instructorId: string
    name: string
    code: string
    description?: string
    semester: string
    syllabus?: string
  }) {
    return Course.create(data)
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      code: string
      description: string
      semester: string
      cover: string
      icon: string
      syllabus: string
    }>
  ) {
    return Course.findByIdAndUpdate(id, data, { new: true }).lean()
  },

  async delete(id: string) {
    return Course.findByIdAndDelete(id)
  },

  async findArchived(instructorId: string) {
    return Course.find({ instructorId, isArchived: true })
      .sort({ updatedAt: -1 })
      .lean()
  },
  async archive(id: string) {
    return Course.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    ).lean()
  },
  async unarchive(id: string) {
    return Course.findByIdAndUpdate(
      id,
      { isArchived: false },
      { new: true }
    ).lean()
  },
}
