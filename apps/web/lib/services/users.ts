import client from "../config/axios"

export interface OnboardingData {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export const completeOnboarding = async (data: OnboardingData): Promise<void> => {
  await client.patch("/users/me/onboarding", data)
}
