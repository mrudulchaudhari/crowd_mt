import { DashboardLayout } from "@/components/dashboard-layout"
import { HeatmapView } from "@/components/heatmap-view"

export default function HeatmapPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Crowd Density Heatmap</h1>
          <p className="text-muted-foreground">Interactive visualization of crowd distribution across event zones</p>
        </div>
        <HeatmapView />
      </div>
    </DashboardLayout>
  )
}
