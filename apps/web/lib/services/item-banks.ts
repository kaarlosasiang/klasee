import client from "../config/axios"

export interface ItemBank {
  _id: string
  courseId: string
  name: string
  instructorId: string
  createdAt: string
  updatedAt: string
}

export const getItemBanks = async (courseId: string): Promise<ItemBank[]> => {
  const response = await client.get("/item-banks", { params: { courseId } })
  return response.data
}

export const createItemBank = async (data: {
  courseId: string
  name: string
}): Promise<ItemBank> => {
  const response = await client.post("/item-banks", data)
  return response.data
}

export const updateItemBank = async (id: string, name: string): Promise<ItemBank> => {
  const response = await client.put(`/item-banks/${id}`, { name })
  return response.data
}

export const deleteItemBank = async (id: string): Promise<void> => {
  await client.delete(`/item-banks/${id}`)
}
