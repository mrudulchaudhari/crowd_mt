"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, AlertTriangle, TrendingUp, Clock } from "lucide-react"

// Mock data - in real app this would come from API
const eventData = {
  id: 1,
  name: "Ganesh Festival 2024",
  date: "2024-09-15",
  currentHeadcount: 8500,
  capacity: 12000,
  yellowThreshold: 8000,
  redThreshold: 10000,
  status: "yellow",
  lastUpdated: "2024-09-15T14:30:00Z",
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "green":
      return "bg-green-500"
    case "yellow":
      return "bg-yellow-500"
    case "red":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "green":
      return "default"
    case "yellow":
      return "secondary"
    case "red":
      return "destructive"
    default:
      return "outline"
  }
}

const getPopulationClassification = (current: number, yellow: number, red: number) => {
  if (current >= red) return "High"
  if (current >= yellow) return "Medium"
  return "Low"
}

export function EventStatusDashboard() {
  const capacityPercentage = (eventData.currentHeadcount / eventData.capacity) * 100
  const populationClass = getPopulationClassification(
    eventData.currentHeadcount,
    eventData.yellowThreshold,
    eventData.redThreshold,
  )

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Event Info Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Details
          </CardTitle>
          <CardDescription>Current event information and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-balance">{eventData.name}</h3>
            <p className="text-sm text-muted-foreground">{eventData.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={getStatusVariant(eventData.status)} className="capitalize">
              {eventData.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Count:</span>
              <p className="text-2xl font-bold">{eventData.currentHeadcount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Capacity:</span>
              <p className="text-2xl font-bold">{eventData.capacity.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capacity Usage</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{capacityPercentage.toFixed(1)}%</div>
          <Progress value={capacityPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {eventData.capacity - eventData.currentHeadcount} spots remaining
          </p>
        </CardContent>
      </Card>

      {/* Population Classification */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Crowd Density</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{populationClass}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(eventData.status)}`} />
            <p className="text-xs text-muted-foreground">Based on current thresholds</p>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card className="lg:col-span-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last updated: {new Date(eventData.lastUpdated).toLocaleString()}
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Safe (&lt;{eventData.yellowThreshold.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>
                  Caution ({eventData.yellowThreshold.toLocaleString()}-{eventData.redThreshold.toLocaleString()})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Critical (&gt;{eventData.redThreshold.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
