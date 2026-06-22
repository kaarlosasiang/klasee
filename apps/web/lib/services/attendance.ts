import client from "../config/axios"

export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export interface AttendanceRecord {
  _id: string
  courseId: string
  sectionId: string
  studentId: {
    _id: string
    name: string
    email: string
  }
  date: string
  status: AttendanceStatus
  note?: string
  createdAt: string
  updatedAt: string
}

export const getAttendance = async (params: {
  courseId?: string
  sectionId?: string
  studentId?: string
  date?: string
}): Promise<AttendanceRecord[]> => {
  const response = await client.get("/attendance", { params })
  return response.data
}

export const createAttendance = async (data: {
  courseId: string
  sectionId: string
  studentId: string
  date: string
  status: "present" | "absent" | "late" | "excused"
  note?: string
}): Promise<AttendanceRecord> => {
  const response = await client.post("/attendance", data)
  return response.data
}

export const updateAttendance = async (
  id: string,
  data: { status?: AttendanceStatus; note?: string }
): Promise<AttendanceRecord> => {
  const response = await client.put(`/attendance/${id}`, data)
  return response.data
}

export type MyAttendanceRecord = Omit<AttendanceRecord, "sectionId" | "courseId"> & {
  sectionId: { _id: string; name: string; courseId: string }
  courseId: string
}

export const bulkUpsertAttendance = async (
  records: Array<{
    courseId: string
    sectionId: string
    studentId: string
    date: string
    status: AttendanceStatus
    note?: string
  }>
): Promise<{ upserted: number; modified: number }> => {
  const response = await client.post("/attendance/bulk", { records })
  return response.data
}

export const deleteAttendance = async (id: string): Promise<void> => {
  await client.delete(`/attendance/${id}`)
}

export const getMyAttendance = async (params: {
  courseId?: string
  sectionId?: string
}): Promise<MyAttendanceRecord[]> => {
  const response = await client.get("/attendance/my", { params })
  return response.data
}
