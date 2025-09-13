"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Map, RefreshCw, Users, AlertTriangle, Info } from "lucide-react"

// Mock zone data with crowd density
const zoneData = [
  { id: "A1", name: "Main Stage", x: 20, y: 15, width: 25, height: 20, density: 0.85, count: 2100, capacity: 2500 },
  { id: "A2", name: "Food Court", x: 50, y: 15, width: 20, height: 15, density: 0.72, count: 1800, capacity: 2500 },
  {
    id: "B1",
    name: "Exhibition Hall",
    x: 15,
    y: 40,
    width: 30,
    height: 25,
    density: 0.45,
    count: 1350,
    capacity: 3000,
  },
  { id: "B2", name: "Merchandise", x: 50, y: 40, width: 15, height: 20, density: 0.68, count: 850, capacity: 1250 },
  { id: "C1", name: "Prayer Area", x: 75, y: 20, width: 20, height: 30, density: 0.92, count: 2300, capacity: 2500 },
  { id: "C2", name: "Children's Zone", x: 75, y: 55, width: 20, height: 15, density: 0.35, count: 350, capacity: 1000 },
  { id: "D1", name: "Parking", x: 5, y: 70, width: 40, height: 15, density: 0.25, count: 500, capacity: 2000 },
  { id: "D2", name: "Entry Gate", x: 50, y: 70, width: 15, height: 15, density: 0.55, count: 275, capacity: 500 },
  { id: "E1", name: "VIP Lounge", x: 70, y: 70, width: 25, height: 15, density: 0.4, count: 200, capacity: 500 },
]

const getDensityColor = (density: number) => {
  if (density >= 0.8) return "rgb(220, 38, 38)" // red-600
  if (density >= 0.6) return "rgb(245, 158, 11)" // amber-500
  if (density >= 0.4) return "rgb(34, 197, 94)" // green-500
  return "rgb(156, 163, 175)" // gray-400
}

const getDensityLevel = (density: number) => {
  if (density >= 0.8) return "Critical"
  if (density >= 0.6) return "High"
  if (density >= 0.4) return "Medium"
  return "Low"
}

const getDensityVariant = (density: number) => {
  if (density >= 0.8) return "destructive"
  if (density >= 0.6) return "secondary"
  return "default"
}

export function HeatmapView() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState("density")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const selectedZoneData = zoneData.find((zone) => zone.id === selectedZone)
  const totalCount = zoneData.reduce((sum, zone) => sum + zone.count, 0)
  const totalCapacity = zoneData.reduce((sum, zone) => sum + zone.capacity, 0)
  const overallDensity = totalCount / totalCapacity

  const criticalZones = zoneData.filter((zone) => zone.density >= 0.8)
  const highDensityZones = zoneData.filter((zone) => zone.density >= 0.6 && zone.density < 0.8)

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="density">Density View</SelectItem>
              <SelectItem value="count">Count View</SelectItem>
              <SelectItem value="capacity">Capacity View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Density</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallDensity * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Zones</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalZones.length}</div>
            <p className="text-xs text-muted-foreground">Above 80% capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Density</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{highDensityZones.length}</div>
            <p className="text-xs text-muted-foreground">60-80% capacity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Interactive Heatmap */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Event Layout Heatmap
            </CardTitle>
            <CardDescription>Click on zones to view detailed information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              <TooltipProvider>
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {zoneData.map((zone) => (
                    <Tooltip key={zone.id}>
                      <TooltipTrigger asChild>
                        <rect
                          x={zone.x}
                          y={zone.y}
                          width={zone.width}
                          height={zone.height}
                          fill={getDensityColor(zone.density)}
                          stroke={selectedZone === zone.id ? "#164e63" : "transparent"}
                          strokeWidth={selectedZone === zone.id ? "0.5" : "0"}
                          className="cursor-pointer transition-all hover:stroke-primary hover:stroke-1"
                          onClick={() => setSelectedZone(zone.id)}
                          opacity={0.8}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium">{zone.name}</p>
                          <p>Density: {(zone.density * 100).toFixed(1)}%</p>
                          <p>Count: {zone.count.toLocaleString()}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  {/* Zone Labels */}
                  {zoneData.map((zone) => (
                    <text
                      key={`label-${zone.id}`}
                      x={zone.x + zone.width / 2}
                      y={zone.y + zone.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-xs font-medium pointer-events-none"
                      style={{ fontSize: "2px" }}
                    >
                      {zone.id}
                    </text>
                  ))}
                </svg>
              </TooltipProvider>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card border rounded-lg p-3 shadow-lg">
                <h4 className="text-sm font-medium mb-2">Density Levels</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded" />
                    <span>Critical (80%+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded" />
                    <span>High (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Medium (40-60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded" />
                    <span>Low (&lt;40%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Zone Details
            </CardTitle>
            <CardDescription>
              {selectedZone ? "Selected zone information" : "Click on a zone to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedZoneData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedZoneData.name}</h3>
                  <p className="text-sm text-muted-foreground">Zone ID: {selectedZoneData.id}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Count:</span>
                    <span className="font-medium">{selectedZoneData.count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Capacity:</span>
                    <span className="font-medium">{selectedZoneData.capacity.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Density:</span>
                    <Badge variant={getDensityVariant(selectedZoneData.density)}>
                      {(selectedZoneData.density * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={getDensityVariant(selectedZoneData.density)}>
                      {getDensityLevel(selectedZoneData.density)}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available Space:</span>
                      <span>{(selectedZoneData.capacity - selectedZoneData.count).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${selectedZoneData.density * 100}%`,
                          backgroundColor: getDensityColor(selectedZoneData.density),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {selectedZoneData.density >= 0.8 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Critical Density Alert</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      This zone has exceeded safe capacity limits. Consider crowd control measures.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Select a zone on the heatmap to view detailed information</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zone List */}
      <Card>
        <CardHeader>
          <CardTitle>All Zones Overview</CardTitle>
          <CardDescription>Complete list of event zones with current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {zoneData
              .sort((a, b) => b.density - a.density)
              .map((zone) => (
                <div
                  key={zone.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedZone === zone.id ? "bg-muted border-primary" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedZone(zone.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getDensityColor(zone.density) }} />
                    <div>
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-sm text-muted-foreground">Zone {zone.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{zone.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">of {zone.capacity.toLocaleString()}</p>
                    </div>
                    <Badge variant={getDensityVariant(zone.density)}>{(zone.density * 100).toFixed(1)}%</Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
