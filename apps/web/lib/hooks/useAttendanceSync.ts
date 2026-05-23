"use client"

import * as React from "react"
import { db } from "@/lib/db"
import { bulkUpsertAttendance } from "@/lib/services/attendance"

export function useAttendanceSync(onSynced?: () => void) {
  const [pendingCount, setPendingCount] = React.useState(0)
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )

  const refreshPendingCount = React.useCallback(async () => {
    const count = await db.pendingAttendance.count()
    setPendingCount(count)
  }, [])

  const flush = React.useCallback(async () => {
    const pending = await db.pendingAttendance.toArray()
    if (pending.length === 0) return

    setIsSyncing(true)
    try {
      await bulkUpsertAttendance(
        pending.map(({ courseId, sectionId, studentId, date, status, note }) => ({
          courseId,
          sectionId,
          studentId,
          date,
          status,
          note,
        }))
      )
      await db.pendingAttendance.clear()
      setPendingCount(0)
      onSynced?.()
    } catch {
      // Retry on next online event
    } finally {
      setIsSyncing(false)
    }
  }, [onSynced])

  React.useEffect(() => {
    refreshPendingCount()
  }, [refreshPendingCount])

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      flush()
    }
    function handleOffline() {
      setIsOnline(false)
    }
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [flush])

  return { pendingCount, isSyncing, isOnline, flush, refreshPendingCount }
}
