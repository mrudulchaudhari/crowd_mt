"use client"

import { useState, useEffect } from "react"
import { MapPin, Filter, Layers, ZoomIn, ZoomOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Polygon = dynamic(() => import("react-leaflet").then((mod) => mod.Polygon), { ssr: false })

// Mock data for map areas and markers
const crowdAreas = [
  {
    id: 1,
    name: "Main Plaza",
    density: "high",
    coordinates: [
      [40.7589, -73.9851],
      [40.7599, -73.9851],
      [40.7599, -73.9841],
      [40.7589, -73.9841],
    ],
    count: 847,
  },
  {
    id: 2,
    name: "Food Court",
    density: "medium",
    coordinates: [
      [40.7579, -73.9861],
      [40.7589, -73.9861],
      [40.7589, -73.9851],
      [40.7579, -73.9851],
    ],
    count: 423,
  },
  {
    id: 3,
    name: "North Gate",
    density: "low",
    coordinates: [
      [40.7609, -73.9871],
      [40.7619, -73.9871],
      [40.7619, -73.9861],
      [40.7609, -73.9861],
    ],
    count: 156,
  },
]

const markers = [
  { id: 1, position: [40.7594, -73.9846], title: "Security Camera 1", type: "camera" },
  { id: 2, position: [40.7584, -73.9856], title: "Emergency Exit", type: "exit" },
  { id: 3, position: [40.7614, -73.9866], title: "Information Desk", type: "info" },
]

const densityColors = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E",
}

const filterOptions = [
  { id: "all", label: "All Areas", active: true },
  { id: "high", label: "High Density", active: false },
  { id: "medium", label: "Medium Density", active: false },
  { id: "low", label: "Low Density", active: false },
]

export default function AdminMap() {
  const [mounted, setMounted] = useState(false)
  const [filters, setFilters] = useState(filterOptions)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleFilter = (filterId: string) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId
          ? { ...filter, active: !filter.active }
          : filter.id === "all"
            ? { ...filter, active: false }
            : filter,
      ),
    )
  }

  const filteredAreas = crowdAreas.filter((area) => {
    const activeFilters = filters.filter((f) => f.active && f.id !== "all").map((f) => f.id)
    if (activeFilters.length === 0 || filters.find((f) => f.id === "all")?.active) {
      return true
    }
    return activeFilters.includes(area.density)
  })

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-lg font-medium text-muted-foreground">Loading Map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Floating Filter Panel */}
      <Card className="absolute top-4 left-4 z-[1000] w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-[#0B64FF]" />
            Map Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Density Levels</p>
            <div className="grid grid-cols-2 gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={filter.active ? "primary" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(filter.id)}
                  className="justify-start text-xs"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-[#EF4444]"></div>
                <span>High Density (500+)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-[#F59E0B]"></div>
                <span>Medium Density (200-500)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-[#22C55E]"></div>
                <span>Low Density (0-200)</span>
              </div>
            </div>
          </div>

          {selectedArea && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium">Selected Area</p>
              <p className="text-xs text-muted-foreground">{selectedArea}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button variant="outline" size="icon" className="bg-background shadow-lg">
          <Layers className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-background shadow-lg">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-background shadow-lg">
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Full-screen Map */}
      <div className="h-full w-full">
        <MapContainer
          center={[40.7594, -73.9856]}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Crowd Density Areas */}
          {filteredAreas.map((area) => (
            <Polygon
              key={area.id}
              positions={area.coordinates as any}
              pathOptions={{
                fillColor: densityColors[area.density as keyof typeof densityColors],
                fillOpacity: 0.4,
                color: densityColors[area.density as keyof typeof densityColors],
                weight: 2,
              }}
              eventHandlers={{
                click: () => setSelectedArea(area.name),
              }}
            >
              <Popup>
                <div className="space-y-2">
                  <h3 className="font-semibold">{area.name}</h3>
                  <p className="text-sm">
                    <span className="font-medium">Crowd Count:</span> {area.count}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Density:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium text-white`}
                      style={{ backgroundColor: densityColors[area.density as keyof typeof densityColors] }}
                    >
                      {area.density}
                    </span>
                  </p>
                </div>
              </Popup>
            </Polygon>
          ))}

          {/* Markers */}
          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position as any}>
              <Popup>
                <div className="space-y-1">
                  <h4 className="font-medium">{marker.title}</h4>
                  <p className="text-xs text-muted-foreground capitalize">{marker.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
