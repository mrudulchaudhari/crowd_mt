"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { VisitorLayout } from "@/src/components/layout/visitor-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { MapPin, Navigation, Filter, RefreshCw } from "lucide-react"
import { StatusIndicator } from "@/src/components/ui/status-indicator"

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })

// Mock festival location (Central Park, NYC)
const FESTIVAL_CENTER = { lat: 40.7829, lng: -73.9654 }

// Mock crowd zones data
const crowdZones = [
  {
    id: 1,
    name: "Main Stage Area",
    lat: 40.7835,
    lng: -73.965,
    radius: 100,
    status: "congested" as const,
    count: 2500,
  },
  { id: 2, name: "Food Court", lat: 40.7825, lng: -73.966, radius: 80, status: "moderate" as const, count: 800 },
  { id: 3, name: "Merchandise Tent", lat: 40.782, lng: -73.9645, radius: 60, status: "safe" as const, count: 150 },
  { id: 4, name: "Side Stage", lat: 40.784, lng: -73.9665, radius: 90, status: "moderate" as const, count: 1200 },
  { id: 5, name: "Rest Area", lat: 40.7815, lng: -73.9655, radius: 70, status: "safe" as const, count: 80 },
  { id: 6, name: "Entry Gate A", lat: 40.7845, lng: -73.964, radius: 50, status: "congested" as const, count: 1800 },
]

const statusColors = {
  safe: { color: "#22C55E", fillColor: "#22C55E" },
  moderate: { color: "#F59E0B", fillColor: "#F59E0B" },
  congested: { color: "#EF4444", fillColor: "#EF4444" },
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [visibleStatuses, setVisibleStatuses] = useState({
    safe: true,
    moderate: true,
    congested: true,
  })
  const [isLocating, setIsLocating] = useState(false)

  // Get user location
  const getUserLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to mock location near festival
          setUserLocation({
            lat: FESTIVAL_CENTER.lat + (Math.random() - 0.5) * 0.002,
            lng: FESTIVAL_CENTER.lng + (Math.random() - 0.5) * 0.002,
          })
          setIsLocating(false)
        },
      )
    } else {
      // Fallback for browsers without geolocation
      setUserLocation({
        lat: FESTIVAL_CENTER.lat + (Math.random() - 0.5) * 0.002,
        lng: FESTIVAL_CENTER.lng + (Math.random() - 0.5) * 0.002,
      })
      setIsLocating(false)
    }
  }

  useEffect(() => {
    getUserLocation()
  }, [])

  const filteredZones = crowdZones.filter((zone) => visibleStatuses[zone.status])

  const toggleStatusFilter = (status: keyof typeof visibleStatuses) => {
    setVisibleStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }))
  }

  return (
    <VisitorLayout>
      <div className="relative h-screen">
        {/* Map Container */}
        <div className="absolute inset-0">
          <MapContainer
            center={[FESTIVAL_CENTER.lat, FESTIVAL_CENTER.lng]}
            zoom={16}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Crowd zones */}
            {filteredZones.map((zone) => (
              <Circle
                key={zone.id}
                center={[zone.lat, zone.lng]}
                radius={zone.radius}
                pathOptions={{
                  color: statusColors[zone.status].color,
                  fillColor: statusColors[zone.status].fillColor,
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">{zone.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <StatusIndicator status={zone.status} showLabel />
                    </div>
                    <p className="text-sm text-gray-600">~{zone.count} people</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-center">
                    <MapPin className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <p className="font-semibold">You are here</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              className="bg-white dark:bg-gray-800 shadow-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={getUserLocation}
              variant="ghost"
              className="bg-white dark:bg-gray-800 shadow-lg"
              disabled={isLocating}
            >
              {isLocating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              {isLocating ? "Locating..." : "My Location"}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="absolute top-16 left-4 right-4 z-10">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Show Areas</h3>
                <div className="space-y-3">
                  {Object.entries(visibleStatuses).map(([status, isVisible]) => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleStatusFilter(status as keyof typeof visibleStatuses)}
                        className="rounded border-gray-300"
                      />
                      <StatusIndicator status={status as any} showLabel className="flex-1" />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-24 left-4 right-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-center">Crowd Levels</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <StatusIndicator status="safe" size="lg" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Safe</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Low crowd</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <StatusIndicator status="moderate" size="lg" />
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Moderate</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Medium crowd</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <StatusIndicator status="congested" size="lg" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">Congested</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">High crowd</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VisitorLayout>
  )
}
