import { create } from "zustand"

export interface SectionDraft {
  id: string
  serverId?: string
  name: string
  schedule: string
  labSchedule: string
  room: string
  maxStudents: number
}

interface Step1State {
  title: string
  semester: string
  code: string
  description: string
  gradeBase: "50" | "75"
  coverFile: File | null
  iconFile: File | null
  coverPreview: string | null
  iconPreview: string | null
  syllabusFile: File | null
  syllabusName: string | null
}

interface NewCourseStore {
  step1: Step1State
  sections: SectionDraft[]

  setStep1: (data: Partial<Step1State>) => void
  setSections: (sections: SectionDraft[]) => void
  addSection: () => void
  updateSection: (id: string, data: Partial<Omit<SectionDraft, "id">>) => void
  removeSection: (id: string) => void
  reset: () => void
}

const defaultStep1: Step1State = {
  title: "",
  semester: "",
  code: "",
  description: "",
  gradeBase: "50",
  coverFile: null,
  iconFile: null,
  coverPreview: null,
  iconPreview: null,
  syllabusFile: null,
  syllabusName: null,
}

const defaultSection = (): SectionDraft => ({
  id: crypto.randomUUID(),
  name: "",
  schedule: "",
  labSchedule: "",
  room: "",
  maxStudents: 40,
})

export const useNewCourseStore = create<NewCourseStore>((set) => ({
  step1: defaultStep1,
  sections: [defaultSection()],

  setStep1: (data) => set((state) => ({ step1: { ...state.step1, ...data } })),

  setSections: (sections) => set({ sections }),

  addSection: () =>
    set((state) => ({ sections: [...state.sections, defaultSection()] })),

  updateSection: (id, data) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, ...data } : s
      ),
    })),

  removeSection: (id) =>
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
    })),

  reset: () => set({ step1: defaultStep1, sections: [defaultSection()] }),
}))
