import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/src/components/providers/theme-provider"
import { QueryProvider } from "@/src/components/providers/query-provider"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Next.js Scaffold",
  description: "Modern Next.js project scaffold with TypeScript and TailwindCSS",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <QueryProvider>{children}</QueryProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
