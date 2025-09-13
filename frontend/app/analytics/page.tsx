import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Analytics & History</h1>
          <p className="text-muted-foreground">View historical crowd data, trends, and detailed analytics</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  )
}
