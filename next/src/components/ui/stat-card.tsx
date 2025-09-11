import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  variant?: "primary" | "success" | "warning" | "danger"
  className?: string
}

const variantStyles = {
  primary: "bg-[#0B64FF] text-white border-[#0B64FF]",
  success: "bg-[#22C55E] text-white border-[#22C55E]",
  warning: "bg-[#F59E0B] text-white border-[#F59E0B]",
  danger: "bg-[#EF4444] text-white border-[#EF4444]",
}

const iconStyles = {
  primary: "text-white",
  success: "text-white",
  warning: "text-white",
  danger: "text-white",
}

export function StatCard({ title, value, icon: Icon, variant = "primary", className }: StatCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className={cn("rounded-full p-3 bg-white/20")}>
            <Icon className={cn("h-6 w-6", iconStyles[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
