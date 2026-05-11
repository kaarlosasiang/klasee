import type { Metadata } from "next";
import React from "react";
import { Providers } from "./providers";
// @ts-expect-error - CSS imports work in Next.js
import "./globals.css";

export const metadata: Metadata = {
  title: "Klasee",
  description: "School Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
