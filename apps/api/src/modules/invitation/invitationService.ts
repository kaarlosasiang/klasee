import crypto from "crypto"
import { Invitation } from "../../models/invitationModel.js"
import { Enrollment } from "../../models/enrollmentModel.js"
import { Section } from "../../models/sectionModel.js"

function makeToken(): string {
  return crypto.randomBytes(24).toString("hex")
}

export const invitationService = {
  async create(data: {
    courseId: string
    sectionId: string
    createdBy: string
    expiresInDays?: number | null
  }) {
    const token = makeToken()

    const expiresAt =
      data.expiresInDays && data.expiresInDays > 0
        ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
        : null

    const invitation = await Invitation.create({
      courseId: data.courseId,
      sectionId: data.sectionId,
      token,
      status: "active",
      expiresAt,
      createdBy: data.createdBy,
    })

    return invitation.toObject()
  },

  async findByCourse(courseId: string) {
    return Invitation.find({ courseId })
      .populate("sectionId", "name schedule room")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean()
  },

  async revoke(id: string) {
    const invitation = await Invitation.findByIdAndUpdate(
      id,
      { status: "revoked" },
      { new: true }
    ).lean()
    if (!invitation) {
      throw Object.assign(new Error("Invitation not found"), { status: 404 })
    }
    return invitation
  },

  async verify(token: string) {
    const invitation = await Invitation.findOne({ token })
      .populate("courseId", "name code cover")
      .populate("sectionId", "name schedule room")
      .lean()

    if (!invitation) {
      return { valid: false, reason: "Invalid invitation" }
    }

    if (invitation.status !== "active") {
      return { valid: false, reason: `Invitation was ${invitation.status}` }
    }

    if (
      invitation.expiresAt &&
      new Date() > new Date(invitation.expiresAt)
    ) {
      return { valid: false, reason: "Invitation has expired" }
    }

    return {
      valid: true,
      course: invitation.courseId,
      section: invitation.sectionId,
    }
  },

  async accept(token: string, studentId: string) {
    const invitation = await Invitation.findOne({ token })
    if (!invitation) {
      throw Object.assign(new Error("Invalid invitation"), { status: 404 })
    }

    if (invitation.status !== "active") {
      throw Object.assign(
        new Error(`Invitation was ${invitation.status}`),
        { status: 400 }
      )
    }

    if (
      invitation.expiresAt &&
      new Date() > new Date(invitation.expiresAt)
    ) {
      throw Object.assign(new Error("Invitation has expired"), {
        status: 400,
      })
    }

    const section = await Section.findById(invitation.sectionId).lean()
    if (!section) {
      throw Object.assign(new Error("Section not found"), { status: 404 })
    }

    const enrolled = await Enrollment.countDocuments({
      sectionId: invitation.sectionId,
      status: "active",
    })
    if (enrolled >= section.maxStudents) {
      throw Object.assign(new Error("This section is full"), { status: 409 })
    }

    const existing = await Enrollment.findOne({
      studentId,
      sectionId: invitation.sectionId,
    })
    if (existing) {
      throw Object.assign(new Error("Already enrolled in this section"), {
        status: 409,
      })
    }

    const enrollment = await Enrollment.create({
      studentId,
      sectionId: invitation.sectionId,
      courseId: invitation.courseId,
    })

    invitation.status = "accepted"
    await invitation.save()

    return Enrollment.findById(enrollment._id)
      .populate("sectionId", "name schedule room")
      .populate("courseId", "name code cover semester")
      .populate("studentId", "name email")
      .lean()
  },
}
