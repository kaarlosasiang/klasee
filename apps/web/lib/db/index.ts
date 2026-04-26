import Dexie, { type EntityTable } from "dexie"
import type {
  LocalCourse,
  LocalAttendance,
  LocalAssessment,
  LocalAssessmentScore,
} from "./schema.js"

class KlaseeDB extends Dexie {
  courses!: EntityTable<LocalCourse, "id">
  attendance!: EntityTable<LocalAttendance, "id">
  assessments!: EntityTable<LocalAssessment, "id">
  assessmentScores!: EntityTable<LocalAssessmentScore, "id">

  constructor() {
    super("klasee-db")

    this.version(1).stores({
      courses: "id, instructorId, code, semester",
      attendance: "id, courseId, studentId, date, pendingSync",
      assessments: "id, courseId, type",
      assessmentScores: "id, assessmentId, studentId, pendingSync",
    })
  }
}

export const db = new KlaseeDB()
