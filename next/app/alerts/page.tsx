"use client"
import { VisitorLayout } from "@/src/components/layout/visitor-layout"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Info, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "critical"
  location?: string
  time: string
  isActive: boolean
}

// Mock alerts data
const alerts: Alert[] = [
  {
    id: "1",
    title: "Heavy Crowd at Main Stage",
    message:
      "Main Stage area is experiencing heavy congestion. Consider using alternate routes or waiting for the current performance to end.",
    type: "critical",
    location: "Main Stage Area",
    time: "2 minutes ago",
    isActive: true,
  },
  {
    id: "2",
    title: "Weather Update",
    message: "Light rain expected between 9:00 PM - 10:00 PM. Covered areas available near food courts.",
    type: "warning",
    location: "Festival Grounds",
    time: "15 minutes ago",
    isActive: true,
  },
  {
    id: "3",
    title: "Lost Child Found",
    message: "A lost child has been found and is safe at the Information Tent. Parents please come to claim.",
    type: "info",
    location: "Information Tent",
    time: "23 minutes ago",
    isActive: true,
  },
  {
    id: "4",
    title: "Parking Lot B Full",
    message: "Parking Lot B has reached capacity. Please use Lot C or consider alternative transportation.",
    type: "warning",
    location: "Parking Area",
    time: "35 minutes ago",
    isActive: true,
  },
  {
    id: "5",
    title: "Free Water Station Open",
    message: "New water refill station is now open near the Side Stage. Stay hydrated!",
    type: "info",
    location: "Side Stage",
    time: "1 hour ago",
    isActive: true,
  },
  {
    id: "6",
    title: "Performance Delay",
    message: "The 7:00 PM performance has been delayed by 15 minutes due to technical setup.",
    type: "warning",
    location: "Main Stage",
    time: "1 hour ago",
    isActive: false,
  },
]

const alertTypeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-900 dark:text-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    titleColor: "text-yellow-900 dark:text-yellow-100",
  },
  critical: {
    icon: AlertTriangle,
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-900 dark:text-red-100",
  },
}

export default function AlertsPage() {
  const activeAlerts = alerts.filter((alert) => alert.isActive)
  const inactiveAlerts = alerts.filter((alert) => !alert.isActive)

  const AlertCard = ({ alert }: { alert: Alert }) => {
    const config = alertTypeConfig[alert.type]
    const Icon = config.icon

    return (
      <Card
        className={cn(
          "border-l-4 transition-all duration-200",
          config.bgColor,
          config.borderColor,
          !alert.isActive && "opacity-60",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconColor)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={cn("font-semibold leading-tight", config.titleColor)}>{alert.title}</h3>
                {!alert.isActive && (
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full flex-shrink-0">
                    Resolved
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{alert.message}</p>

              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.time}
                </div>
                {alert.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {alert.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <VisitorLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Festival Alerts</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay informed about important updates and announcements
          </p>
        </div>

        {/* Alert Summary */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {activeAlerts.filter((a) => a.type === "critical").length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Critical</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {activeAlerts.filter((a) => a.type === "warning").length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Warnings</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {activeAlerts.filter((a) => a.type === "info").length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Info</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="px-4 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Alerts</h2>
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Info className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">No Active Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">All clear! Check back later for updates.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Alerts */}
        {inactiveAlerts.length > 0 && (
          <div className="px-4 pb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Alerts</h2>
            <div className="space-y-3">
              {inactiveAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        )}
      </div>
    </VisitorLayout>
  )
}
