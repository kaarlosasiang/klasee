import { Geist, Geist_Mono, Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import "@workspace/ui/styles/globals.css"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/sonner"
import { AuthProvider } from "@/lib/contexts/auth-context"

import type { Metadata, Viewport } from "next"
import { PWARegister } from "@/components/pwa-register"
import { Navbar } from "@/components/common/navbar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

const APP_NAME = "Klasee"
const APP_DESCRIPTION = "A modern learning management system"

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_NAME, template: "%s - Klasee" },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <PWARegister />
      </body>
    </html>
  )
}
