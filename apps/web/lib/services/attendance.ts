import client from "../config/axios"

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
  status: "present" | "absent" | "late" | "excused"
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
}): Promise<AttendanceRecord> => {
  const response = await client.post("/attendance", data)
  return response.data
}

export const updateAttendance = async (
  id: string,
  data: Partial<{
    status: "present" | "absent" | "late" | "excused"
  }>
): Promise<AttendanceRecord> => {
  const response = await client.put(`/attendance/${id}`, data)
  return response.data
}
