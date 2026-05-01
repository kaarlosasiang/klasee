"use client"

import * as React from "react"

interface BreadcrumbContextValue {
  leafLabel: string | null
  labelPath: string | null
  setLeafLabel: (label: string, path: string) => void
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
  leafLabel: null,
  labelPath: null,
  setLeafLabel: () => {},
})

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [leafLabel, setLabel] = React.useState<string | null>(null)
  const [labelPath, setLabelPath] = React.useState<string | null>(null)

  const setLeafLabel = React.useCallback((label: string, path: string) => {
    setLabel(label)
    setLabelPath(path)
  }, [])

  return (
    <BreadcrumbContext.Provider value={{ leafLabel, labelPath, setLeafLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbLabel() {
  return React.useContext(BreadcrumbContext)
}
