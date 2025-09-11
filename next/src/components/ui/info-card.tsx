import type { LucideIcon } from "lucide-react"
import { Card } from "@/src/components/ui/card"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  title: string
  description: string
  icon: LucideIcon
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
}

const variantStyles = {
  default: "border-gray-200 dark:border-gray-800",
  success: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
  warning: "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950",
  danger: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
}

const iconStyles = {
  default: "text-gray-600 dark:text-gray-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
}

export function InfoCard({ title, description, icon: Icon, variant = "default", className }: InfoCardProps) {
  return (
    <Card className={cn("p-4 transition-colors", variantStyles[variant], className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconStyles[variant])} />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}
