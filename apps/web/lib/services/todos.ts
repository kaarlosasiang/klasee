import client from "../config/axios"

export interface InstructorTodos {
  ungradedSubmissions: number
  draftItems: number
  upcomingDueDates: number
  attendanceToTake: number
}

export const getTodos = async (): Promise<InstructorTodos> => {
  const res = await client.get("/todos")
  return res.data
}
