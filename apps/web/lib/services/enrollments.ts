import client from "../config/axios"

export interface Enrollment {
  _id: string
  studentId: {
    _id: string
    name: string
    email: string
  }
  sectionId: {
    _id: string
    name: string
    schedule?: string
    room?: string
  }
  courseId: {
    _id: string
    name: string
    code: string
  }
  status: "active" | "dropped" | "completed"
  createdAt: string
  updatedAt: string
}

export const getEnrollmentsByCourse = async (
  courseId: string
): Promise<Enrollment[]> => {
  const response = await client.get("/enrollments", {
    params: { courseId },
  })
  return response.data
}

export const dropEnrollment = async (id: string): Promise<Enrollment> => {
  const response = await client.delete(`/enrollments/${id}`)
  return response.data
}

export const getAllEnrollments = async (): Promise<Enrollment[]> => {
  const response = await client.get("/enrollments")
  return response.data
}

export const getEnrollmentsByStudent = async (
  studentId: string
): Promise<Enrollment[]> => {
  const response = await client.get("/enrollments", {
    params: { studentId },
  })
  return response.data
}

export const joinByCode = async (code: string): Promise<Enrollment> => {
  const response = await client.post("/enrollments/join", { code })
  return response.data
}
