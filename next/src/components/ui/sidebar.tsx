"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { LayoutDashboard, Map, AlertTriangle, FileText, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Map",
    href: "/map",
    icon: Map,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
]

export function Sidebar({ isOpen = true, onToggle, className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-background border-r transition-all duration-300 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64",
          className,
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!isCollapsed && <h2 className="text-lg font-semibold text-[#0B64FF]">Navigation</h2>}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2 p-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Button
                  key={link.href}
                  variant={isActive ? "primary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isCollapsed && "justify-center px-2",
                    isActive && "bg-[#0B64FF] text-white",
                  )}
                  asChild
                >
                  <Link href={link.href}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{link.title}</span>}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
