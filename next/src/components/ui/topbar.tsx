"use client"
import { Menu, Sun, Moon, User } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TopbarProps {
  title?: string
  onToggleSidebar?: () => void
  className?: string
}

export function Topbar({ title = "Project Scaffold", onToggleSidebar, className }: TopbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header
      className={cn(
        "h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50",
        className,
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-[#0B64FF]">{title}</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Profile Avatar */}
          <div className="flex items-center gap-2 ml-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/user-profile-illustration.png" alt="Profile" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  )
}
