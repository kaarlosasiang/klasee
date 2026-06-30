import client from "../config/axios"

export interface OnboardingData {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface InstructorProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: string
  username: string
  schoolId: string
  image: string
}

export const completeOnboarding = async (data: OnboardingData): Promise<void> => {
  await client.patch("/users/me/onboarding", data)
}

export const getMe = async (): Promise<InstructorProfile> => {
  const res = await client.get("/users/me")
  return res.data
}

export const updateProfile = async (data: {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  consentGivenAt?: number
}): Promise<void> => {
  await client.patch("/users/me", data)
}

export const deleteAccount = async (): Promise<void> => {
  await client.delete("/users/me")
}
