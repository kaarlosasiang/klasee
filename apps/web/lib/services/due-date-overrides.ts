import client from "../config/axios"

export interface DueDateOverride {
  _id: string
  assessmentId: string
  type: "section" | "student"
  targetId: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface CreateDueDateOverrideInput {
  assessmentId: string
  type: "section" | "student"
  targetId: string
  dueDate: string
}

export const getOverrides = async (assessmentId: string): Promise<DueDateOverride[]> => {
  const response = await client.get("/due-date-overrides", { params: { assessmentId } })
  return response.data
}

export const upsertOverride = async (
  data: CreateDueDateOverrideInput
): Promise<DueDateOverride> => {
  const response = await client.post("/due-date-overrides", data)
  return response.data
}

export const deleteOverride = async (id: string): Promise<void> => {
  await client.delete(`/due-date-overrides/${id}`)
}
