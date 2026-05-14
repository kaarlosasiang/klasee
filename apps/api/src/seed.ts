import "dotenv/config"
import mongoose from "mongoose"
import { dbConnection } from "./config/index.js"
import { User } from "./models/userModel.js"
import { Student } from "./models/studentModel.js"
import { Section } from "./models/sectionModel.js"
import { Course } from "./models/courseModel.js"
import { Enrollment } from "./models/enrollmentModel.js"

const STUDENT_EMAIL = "test.student@klasee.com"
const STUDENT_NAME = "Test Student"

async function seed() {
  await dbConnection.connect()

  // 1. Upsert User (create if not exists)
  let user = await User.findOne({ email: STUDENT_EMAIL }).lean()
  if (!user) {
    user = await User.create({
      name: STUDENT_NAME,
      email: STUDENT_EMAIL,
      emailVerified: true,
      role: "student",
      isActive: true,
      onboardingCompleted: true,
    })
    console.log(`Created user: ${user.email} (${user._id})`)
  } else {
    console.log(`User already exists: ${user.email} (${user._id})`)
  }

  // 2. Upsert Student profile
  let student = await Student.findOne({ userId: user._id }).lean()
  if (!student) {
    student = await Student.create({
      userId: user._id,
      yearLevel: 2,
      program: "BSCS",
    })
    console.log(`Created student profile for ${user.name}`)
  } else {
    console.log(`Student profile already exists`)
  }

  // 3. Find an existing section
  const section = await Section.findOne().lean()
  if (!section) {
    console.error("No sections found. Create a course with a section first.")
    await dbConnection.disconnect()
    process.exit(1)
  }

  const courseId =
    typeof section.courseId === "object"
      ? String((section.courseId as any)._id ?? section.courseId)
      : String(section.courseId)

  const course = await Course.findById(courseId).lean()
  if (!course) {
    console.error(`Course ${courseId} not found`)
    await dbConnection.disconnect()
    process.exit(1)
  }

  console.log(`Found section: "${section.name}" in course "${course.name}"`)

  // 4. Create enrollment
  const existingEnrollment = await Enrollment.findOne({
    studentId: user._id,
    sectionId: section._id,
    status: "active",
  }).lean()

  if (!existingEnrollment) {
    await Enrollment.create({
      studentId: user._id,
      sectionId: section._id,
      courseId: course._id,
      status: "active",
    })
    console.log(`Enrolled ${user.name} in "${section.name}"`)
  } else {
    console.log(`${user.name} is already enrolled in "${section.name}"`)
  }

  console.log("\nSeed complete!")
  await dbConnection.disconnect()
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
