"use client"

import type React from "react"

import { Topbar } from "./topbar"
import { Sidebar } from "./sidebar"
import { useSidebar } from "@/src/hooks/use-sidebar"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isOpen, toggle } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <Topbar onToggleSidebar={toggle} />
      <div className="flex">
        <Sidebar isOpen={isOpen} onToggle={toggle} />
        <main className="flex-1 lg:ml-0">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
