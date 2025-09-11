"use client"

import { Users, AlertTriangle, MapPin, TrendingUp } from "lucide-react"
import { StatCard } from "@/src/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { CrowdHeatmap } from "@/src/components/ui/crowd-heatmap"

// Mock data for the dashboard
const statsData = [
  {
    title: "Total Crowd",
    value: "2,847",
    icon: Users,
    variant: "primary" as const,
  },
  {
    title: "Congested Areas",
    value: "12",
    icon: MapPin,
    variant: "warning" as const,
  },
  {
    title: "Active Alerts",
    value: "5",
    icon: AlertTriangle,
    variant: "danger" as const,
  },
]

const alertsData = [
  {
    id: 1,
    title: "High Crowd Density",
    location: "Main Plaza",
    time: "2 min ago",
    severity: "high",
    status: "active",
  },
  {
    id: 2,
    title: "Traffic Congestion",
    location: "North Gate",
    time: "5 min ago",
    severity: "medium",
    status: "active",
  },
  {
    id: 3,
    title: "Emergency Exit Blocked",
    location: "Building A",
    time: "8 min ago",
    severity: "high",
    status: "resolved",
  },
  {
    id: 4,
    title: "Overcrowding Warning",
    location: "Food Court",
    time: "12 min ago",
    severity: "low",
    status: "monitoring",
  },
  {
    id: 5,
    title: "Security Alert",
    location: "Parking Lot B",
    time: "15 min ago",
    severity: "medium",
    status: "investigating",
  },
]

const severityColors = {
  high: "bg-[#EF4444] text-white",
  medium: "bg-[#F59E0B] text-white",
  low: "bg-[#22C55E] text-white",
}

const statusColors = {
  active: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  resolved: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  monitoring: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  investigating: "bg-[#0B64FF]/10 text-[#0B64FF] border-[#0B64FF]/20",
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor crowd density and manage alerts in real-time</p>
        </div>
        <Button variant="primary" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} variant={stat.variant} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Card - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <CrowdHeatmap />
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-1">
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {alertsData.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">{alert.title}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[alert.severity as keyof typeof severityColors]}`}
                        >
                          {alert.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{alert.location}</span>
                        <span>•</span>
                        <span>{alert.time}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[alert.status as keyof typeof statusColors]}`}
                        >
                          {alert.status}
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
