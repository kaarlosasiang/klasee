export interface ParsedSection {
  name: string
  schedule?: string
  labSchedule?: string
  room?: string
  maxStudents: number
}

export interface ParsedCourse {
  subject: string
  sections: ParsedSection[]
}

const DAY_NORM: Record<string, string> = {
  MWF: "Mon Wed Fri",
  TTh: "Tue Thu",
  MW:  "Mon Wed",
  TF:  "Tue Fri",
  MTh: "Mon Thu",
  WF:  "Wed Fri",
  M:   "Mon",
  T:   "Tue",
  W:   "Wed",
  Th:  "Thu",
  F:   "Fri",
  S:   "Sat",
}

function normalizeDays(raw: string): string {
  return DAY_NORM[raw.trim()] ?? raw.trim()
}

function normalizeTime(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i)
  if (!m) return t
  let h = parseInt(m[1]!, 10)
  const min = m[2]!
  const meridiem = m[3]!.toUpperCase()
  if (meridiem === "PM" && h !== 12) h += 12
  if (meridiem === "AM" && h === 12) h = 0
  return `${String(h).padStart(2, "0")}:${min}`
}

function normalizeTimeRange(raw: string): string {
  const [start, end] = raw.split("-")
  if (!start || !end) return raw
  return `${normalizeTime(start)}-${normalizeTime(end)}`
}

// Extracted text column order (from pdfjs rendering of this PDF type):
//   SECTION  [units...]  TIME  DAYS  ROOM...  STUDENTS  [LAB]  SUBJECT
//
// e.g. "IT3B 2 2 0 2.00 01:00PM-03:00PM T TBA 43 ITBAN 3"
//      "IT3B 0 1 3 2.25 09:00AM-10:00AM MWF COMPLAB 3 43 LAB ITBAN 3"

const TIME_RE = /(\d{1,2}:\d{2}[AP]M-\d{1,2}:\d{2}[AP]M)/i
// Subject always ends the line in the form "LETTERS DIGITS" e.g. "ITBAN 3", "ITP 121"
const SUBJECT_SUFFIX_RE = /([A-Z]+\s+\d+)\s*$/

function parseLine(line: string): {
  subject: string
  section: string
  isLab: boolean
  schedule: string
  room: string
  students: number
} | null {
  const timeMatch = line.match(TIME_RE)
  if (!timeMatch) return null

  const timeIdx = line.indexOf(timeMatch[0])
  const left  = line.slice(0, timeIdx).trim()
  const right = line.slice(timeIdx + timeMatch[0].length).trim()

  // --- Parse left: first non-numeric token is the section code ---
  const leftTokens = left.split(/\s+/).filter(Boolean)
  const section = leftTokens.find((t) => /^[A-Z]/i.test(t))
  if (!section) return null

  // --- Parse right ---
  // 1. Extract subject from the end: matches "LETTERS NUMBER" suffix
  const subjectMatch = right.match(SUBJECT_SUFFIX_RE)
  if (!subjectMatch) return null
  const subject = subjectMatch[1]!.trim()

  let remaining = right.slice(0, right.lastIndexOf(subjectMatch[1]!)).trim()

  // 2. Check for LAB marker before subject
  const isLab = /\bLAB\b/.test(remaining)
  remaining = remaining.replace(/\bLAB\b/, "").trim()

  // 3. Remaining: "DAYS ROOM... STUDENTS"
  const tokens = remaining.split(/\s+/).filter(Boolean)
  if (tokens.length < 2) return null

  const days = tokens[0]!
  const students = parseInt(tokens[tokens.length - 1]!, 10)
  if (isNaN(students)) return null
  const room = tokens.slice(1, -1).join(" ") || "TBA"

  const normalizedDays = normalizeDays(days)
  const normalizedTime = normalizeTimeRange(timeMatch[0])
  const schedule = `${normalizedDays} ${normalizedTime}`

  return { subject, section, isLab, schedule, room, students }
}

export function parseFacultyLoadText(text: string): ParsedCourse[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  const courseMap = new Map<string, Map<string, ParsedSection>>()

  for (const line of lines) {
    const parsed = parseLine(line)
    if (!parsed || !parsed.subject) continue

    if (!courseMap.has(parsed.subject)) {
      courseMap.set(parsed.subject, new Map())
    }
    const sectionMap = courseMap.get(parsed.subject)!

    if (!sectionMap.has(parsed.section)) {
      sectionMap.set(parsed.section, {
        name: parsed.section,
        maxStudents: parsed.students,
      })
    }
    const sec = sectionMap.get(parsed.section)!

    if (parsed.isLab) {
      sec.labSchedule = parsed.schedule
    } else {
      sec.schedule = parsed.schedule
      sec.room = parsed.room
      sec.maxStudents = parsed.students
    }
  }

  return Array.from(courseMap.entries()).map(([subject, sectionMap]) => ({
    subject,
    sections: Array.from(sectionMap.values()),
  }))
}
