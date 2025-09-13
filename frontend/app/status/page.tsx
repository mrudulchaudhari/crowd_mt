import { DashboardLayout } from "@/components/dashboard-layout"
import { EventStatusDashboard } from "@/components/event-status-dashboard"

export default function StatusPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Event Status</h1>
          <p className="text-muted-foreground">Real-time event monitoring and crowd status overview</p>
        </div>
        <EventStatusDashboard />
      </div>
    </DashboardLayout>
  )
}
