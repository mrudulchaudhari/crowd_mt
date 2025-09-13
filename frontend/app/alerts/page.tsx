import { DashboardLayout } from "@/components/dashboard-layout"
import { AlertsManagement } from "@/components/alerts-management"

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Alerts Management</h1>
          <p className="text-muted-foreground">Monitor and manage safety alerts, notifications, and system warnings</p>
        </div>
        <AlertsManagement />
      </div>
    </DashboardLayout>
  )
}
