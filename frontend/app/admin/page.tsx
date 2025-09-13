import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminControls } from "@/components/admin-controls"

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Admin Controls</h1>
          <p className="text-muted-foreground">Manage event settings, capacity limits, and crowd thresholds</p>
        </div>
        <AdminControls />
      </div>
    </DashboardLayout>
  )
}
