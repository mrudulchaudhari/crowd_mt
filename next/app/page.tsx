import { VisitorLayout } from "@/src/components/layout/visitor-layout"
import { StatusIndicator } from "@/src/components/ui/status-indicator"
import { InfoCard } from "@/src/components/ui/info-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Users, Wifi, Car, Music } from "lucide-react"

// Mock festival data
const festivalData = {
  name: "Summer Music Festival 2024",
  status: "moderate" as const,
  currentAttendance: 12500,
  maxCapacity: 20000,
  nextPerformance: {
    artist: "The Electric Waves",
    stage: "Main Stage",
    time: "8:30 PM",
  },
  weather: {
    condition: "Partly Cloudy",
    temperature: "75°F",
  },
}

const quickInfoItems = [
  {
    title: "Free WiFi Available",
    description: "Connect to 'Festival-Guest' network. No password required.",
    icon: Wifi,
    variant: "success" as const,
  },
  {
    title: "Parking Status",
    description: "Lot A: Full • Lot B: Available • Lot C: 75% Full",
    icon: Car,
    variant: "warning" as const,
  },
  {
    title: "Next Performance",
    description: `${festivalData.nextPerformance.artist} at ${festivalData.nextPerformance.time} on ${festivalData.nextPerformance.stage}`,
    icon: Music,
    variant: "default" as const,
  },
  {
    title: "Lost & Found",
    description: "Located near the main entrance. Open until 2 AM.",
    icon: MapPin,
    variant: "default" as const,
  },
]

export default function HomePage() {
  const attendancePercentage = Math.round((festivalData.currentAttendance / festivalData.maxCapacity) * 100)

  return (
    <VisitorLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header Section */}
        <div className="px-4 pt-8 pb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{festivalData.name}</h1>
            <div className="flex items-center justify-center gap-3 mb-4">
              <StatusIndicator status={festivalData.status} size="lg" showLabel />
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Status</span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {festivalData.currentAttendance.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{attendancePercentage}% capacity</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-green-600" />
                  Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-1">{festivalData.weather.temperature}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{festivalData.weather.condition}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="px-4 pb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Info</h2>
          <div className="space-y-3">
            {quickInfoItems.map((item, index) => (
              <InfoCard
                key={index}
                title={item.title}
                description={item.description}
                icon={item.icon}
                variant={item.variant}
              />
            ))}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="px-4 pb-8">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Stay Safe & Connected</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Use the Map tab to check crowd levels before moving around. The red SOS button in the bottom-right
                    provides quick access to emergency contacts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VisitorLayout>
  )
}
