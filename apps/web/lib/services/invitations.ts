import client from "../config/axios"

export interface Invitation {
  _id: string
  courseId: {
    _id: string
    name: string
    code: string
    cover?: string
  }
  sectionId: {
    _id: string
    name: string
    schedule?: string
    room?: string
  }
  token: string
  status: "active" | "accepted" | "revoked"
  expiresAt: string | null
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export const createInvitation = async (
  courseId: string,
  sectionId: string,
  expiresInDays?: number | null
): Promise<Invitation> => {
  const response = await client.post("/invitations", {
    courseId,
    sectionId,
    expiresInDays: expiresInDays ?? 7,
  })
  return response.data
}

export const getInvitations = async (
  courseId: string
): Promise<Invitation[]> => {
  const response = await client.get("/invitations", {
    params: { courseId },
  })
  return response.data
}

export const revokeInvitation = async (id: string): Promise<Invitation> => {
  const response = await client.delete(`/invitations/${id}`)
  return response.data
}

export const verifyInvitation = async (
  token: string
): Promise<{
  valid: boolean
  reason?: string
  course?: { _id: string; name: string; code: string; cover?: string }
  section?: { _id: string; name: string; schedule?: string; room?: string }
}> => {
  const response = await client.get("/invitations/verify", {
    params: { token },
  })
  return response.data
}

export const acceptInvitation = async (
  token: string
): Promise<unknown> => {
  const response = await client.post("/invitations/accept", { token })
  return response.data
}
