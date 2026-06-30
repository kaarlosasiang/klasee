import { Tip } from "../../models/tipModel.js"
import { getInstructorTodos } from "../todos/todosService.js"

type TipContext =
  | "ungradedSubmissions"
  | "draftItems"
  | "upcomingDueDates"
  | "attendanceToTake"
  | "general"

export async function getRelevantTip(instructorId: string) {
  const todos = await getInstructorTodos(instructorId)

  let context: TipContext = "general"
  if (todos.attendanceToTake > 0) context = "attendanceToTake"
  else if (todos.ungradedSubmissions > 0) context = "ungradedSubmissions"
  else if (todos.draftItems > 0) context = "draftItems"
  else if (todos.upcomingDueDates > 0) context = "upcomingDueDates"

  let tips = await Tip.find({ context, isActive: true }).lean()
  if (!tips.length) {
    tips = await Tip.find({ context: "general", isActive: true }).lean()
  }
  if (!tips.length) return null

  const tip = tips[Math.floor(Math.random() * tips.length)]!
  return { title: tip.title, description: tip.description, context: tip.context }
}
