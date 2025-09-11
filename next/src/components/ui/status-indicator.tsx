import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "safe" | "moderate" | "congested"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const statusConfig = {
  safe: {
    color: "bg-green-500",
    label: "Safe",
    textColor: "text-green-700 dark:text-green-400",
  },
  moderate: {
    color: "bg-yellow-500",
    label: "Moderate",
    textColor: "text-yellow-700 dark:text-yellow-400",
  },
  congested: {
    color: "bg-red-500",
    label: "Congested",
    textColor: "text-red-700 dark:text-red-400",
  },
}

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
}

export function StatusIndicator({ status, size = "md", showLabel = false, className }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full", config.color, sizeConfig[size])} />
      {showLabel && <span className={cn("text-sm font-medium", config.textColor)}>{config.label}</span>}
    </div>
  )
}
