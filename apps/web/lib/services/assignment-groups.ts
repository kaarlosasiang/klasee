import client from "../config/axios"

export interface AssignmentGroup {
  _id: string
  courseId: string
  name: string
  weight: number
  dropLowest: number
  order: number
  createdAt: string
  updatedAt: string
}

export const getAssignmentGroups = async (courseId: string): Promise<AssignmentGroup[]> => {
  const response = await client.get("/assignment-groups", { params: { courseId } })
  return response.data
}

export const createAssignmentGroup = async (data: {
  courseId: string
  name: string
  weight: number
  dropLowest?: number
  order?: number
}): Promise<AssignmentGroup> => {
  const response = await client.post("/assignment-groups", data)
  return response.data
}

export const updateAssignmentGroup = async (
  id: string,
  data: Partial<{ name: string; weight: number; dropLowest: number; order: number }>
): Promise<AssignmentGroup> => {
  const response = await client.put(`/assignment-groups/${id}`, data)
  return response.data
}

export const deleteAssignmentGroup = async (id: string): Promise<void> => {
  await client.delete(`/assignment-groups/${id}`)
}
