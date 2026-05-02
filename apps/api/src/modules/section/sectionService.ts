import { Section } from "../../models/sectionModel.js"

/** Generates a unique 6-character uppercase alphanumeric join code. */
function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // omit O,0,I,1 to avoid confusion
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

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

  async findByJoinCode(code: string) {
    return Section.findOne({ joinCode: code.toUpperCase().trim() })
      .populate("courseId", "name code cover semester")
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

  /** Generate (or regenerate) a unique join code for a section. */
  async generateJoinCode(sectionId: string, instructorId: string) {
    const section = await Section.findById(sectionId).lean()
    if (!section) throw Object.assign(new Error("Section not found"), { status: 404 })
    if (String(section.instructorId) !== instructorId) {
      throw Object.assign(new Error("Forbidden"), { status: 403 })
    }
    // Try up to 10 times to find a unique code
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = makeCode()
      const exists = await Section.exists({ joinCode: code })
      if (!exists) {
        return Section.findByIdAndUpdate(sectionId, { joinCode: code }, { new: true }).lean()
      }
    }
    throw new Error("Could not generate a unique code. Please try again.")
  },
}
