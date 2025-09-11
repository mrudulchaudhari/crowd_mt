"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BarChart3 } from "lucide-react"

// d density percentages for each time slot and day
const crowdPatternData = [
  { day: "Monday", periods: [15, 25, 35, 45, 65, 85, 75, 45] },
  { day: "Tuesday", periods: [20, 30, 40, 50, 70, 90, 80, 50] },
  { day: "Wednesday", periods: [25, 35, 45, 55, 75, 95, 85, 55] },
  { day: "Thursday", periods: [30, 40, 50, 60, 80, 100, 90, 60] },
  { day: "Friday", periods: [35, 45, 55, 65, 85, 100, 95, 65] },
  { day: "Saturday", periods: [40, 50, 60, 70, 90, 100, 100, 70] },
  { day: "Sunday", periods: [20, 30, 40, 50, 70, 85, 75, 45] },
]

const timeLabels = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM", "12AM", "3AM"]

export function CrowdHeatmap() {
  const getDensityColor = (density: number) => {
    if (density >= 90) return "bg-red-600" // Critical (90-100%)
    if (density >= 75) return "bg-red-500" // High (75-89%)
    if (density >= 50) return "bg-orange-500" // Medium-High (50-74%)
    if (density >= 25) return "bg-yellow-400" // Medium-Low (25-49%)
    return "bg-green-300" // Low (0-24%)
  }

  const getTextColor = (density: number) => {
    if (density >= 50) return "text-white" // White text for darker backgrounds (orange, red)
    return "text-gray-800" // Dark text for lighter backgrounds (green, yellow)
  }

  const getDensityLabel = (density: number) => {
    if (density >= 90) return "Critical"
    if (density >= 75) return "High"
    if (density >= 50) return "Medium-High"
    if (density >= 25) return "Medium-Low"
    return "Low"
  }

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#0B64FF]" />
          Weekly Crowd Pattern Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] p-6">
        <div className="space-y-4">
          {/* Time labels header */}
          <div className="grid grid-cols-9 gap-2 text-xs text-muted-foreground">
            <div></div> {/* Empty cell for day labels */}
            {timeLabels.map((time) => (
              <div key={time} className="text-center font-medium">
                {time}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="space-y-2">
            {crowdPatternData.map((dayData) => (
              <div key={dayData.day} className="grid grid-cols-9 gap-2 items-center">
                <div className="text-xs font-medium text-muted-foreground w-16">{dayData.day}</div>
                {dayData.periods.map((density, index) => (
                  <div
                    key={index}
                    className={`h-8 w-full rounded ${getDensityColor(density)} ${getTextColor(density)}
                      hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all
                      flex items-center justify-center text-xs font-medium`}
                    title={`${dayData.day} ${timeLabels[index]}: ${density}% (${getDensityLabel(density)})`}
                  >
                    {density}%
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <span>Low (0-24%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-yellow-400 rounded"></div>
              <span>Medium-Low (25-49%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Medium-High (50-74%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>High (75-89%)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Critical (90-100%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
