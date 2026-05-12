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

export const getEnrollmentsByCourse = async (courseId: string): Promise<Enrollment[]> => {
  const response = await client.get("/enrollments", { params: { courseId } })
  return response.data
}
