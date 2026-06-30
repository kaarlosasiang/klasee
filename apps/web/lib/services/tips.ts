import client from "../config/axios"

export interface RelevantTip {
  title: string
  description: string
  context: string
}

export const getRelevantTip = async (): Promise<RelevantTip | null> => {
  const res = await client.get("/tips/relevant")
  if (res.status === 204) return null
  return res.data
}
