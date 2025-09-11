"use client"

import { Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { theme, setTheme } = useTheme()

  const handleThemeToggle = () => {
    console.log("[v0] Current theme:", theme)
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    console.log("[v0] Switching to theme:", newTheme)
  }

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-4 max-w-full">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-primary-blue">Project Scaffold</h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleThemeToggle}
            className="bg-white dark:bg-gray-900 border-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 shadow-lg min-w-[44px] h-[44px] relative z-10"
            title="Toggle dark/light mode"
          >
            <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
