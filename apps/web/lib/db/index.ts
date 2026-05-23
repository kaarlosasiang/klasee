import Dexie, { type Table } from "dexie"
import type { AttendanceStatus } from "@/lib/services/attendance"

export interface PendingAttendance {
  id?: number
  courseId: string
  sectionId: string
  studentId: string
  date: string
  status: AttendanceStatus
  note?: string
  queuedAt: number
}

class KlaseeDB extends Dexie {
  pendingAttendance!: Table<PendingAttendance>

  constructor() {
    super("klasee-db")
    this.version(2).stores({
      pendingAttendance: "++id, sectionId, studentId, date",
    })
  }
}

export const db = new KlaseeDB()
