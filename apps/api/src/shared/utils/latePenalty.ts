export interface LatePolicy {
  enabled: boolean
  deductionType: "percent" | "flat"
  deductionPerDay: number
  maxDeduction: number
}

export function calcLatePenalty(
  submittedAt: Date,
  dueDate: Date | undefined | null,
  totalPoints: number,
  policy: LatePolicy | null | undefined
): number {
  if (!policy?.enabled || !dueDate) return 0
  if (submittedAt <= dueDate) return 0
  const msPerDay = 24 * 60 * 60 * 1000
  const daysLate = Math.ceil((submittedAt.getTime() - dueDate.getTime()) / msPerDay)
  if (daysLate <= 0) return 0
  if (policy.deductionType === "percent") {
    const pct = Math.min(policy.maxDeduction, policy.deductionPerDay * daysLate)
    return Math.round(Math.min(totalPoints, (totalPoints * pct) / 100) * 100) / 100
  }
  return Math.min(policy.maxDeduction, policy.deductionPerDay * daysLate)
}
