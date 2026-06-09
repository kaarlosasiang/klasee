import client from "../config/axios"

export interface StudentProfile {
  user: {
    name: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
  student: {
    yearLevel: number | null
    program: string
    guardianName: string
    guardianContact: string
  }
}

export const getStudentProfile = async (): Promise<StudentProfile> => {
  const response = await client.get("/students/me")
  return response.data
}

export const updateStudentAcademicInfo = async (data: {
  yearLevel?: number
  program?: string
  guardianName?: string
  guardianContact?: string
}): Promise<void> => {
  await client.patch("/students/me", data)
}
