import type { Metadata } from "next"
import { Toaster } from "@workspace/ui/components/sonner"
import React from "react"
import { Providers } from "./providers"

import "./globals.css"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

export const metadata: Metadata = {
  title: "Klasee",
  description: "School Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
