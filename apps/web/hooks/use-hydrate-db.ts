"use client"
import { useEffect, useRef } from "react"
import { useSession } from "@/lib/config/auth-client"
import { apiClient } from "@/lib/config/api-client"
import { db } from "@/lib/db"
import type { LocalCourse } from "@/lib/db/schema"

export function useHydrateDB() {
  const { data: session } = useSession()
  const hydrated = useRef(false)

  useEffect(() => {
    if (!session?.user || hydrated.current) return
    hydrated.current = true

    async function hydrate() {
      try {
        const { data } = await apiClient.get<LocalCourse[]>("/courses")
        await db.courses.bulkPut(data)
      } catch {
        // silently fail — offline or endpoint not ready
      }
    }

    hydrate()
  }, [session?.user])
}
