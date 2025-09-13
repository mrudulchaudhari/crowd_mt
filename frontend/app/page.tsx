import { DashboardLayout } from "@/components/dashboard-layout"
import { EventStatusDashboard } from "@/components/event-status-dashboard"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Crowd Management Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage crowd density for large-scale events in real-time
            </p>
          </div>
        </div>
        <EventStatusDashboard />
      </div>
    </DashboardLayout>
  )
}
