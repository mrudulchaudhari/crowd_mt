"use client"
import { VisitorLayout } from "@/src/components/layout/visitor-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Phone, MapPin, Clock, Wifi, Car, Utensils, ShieldCheck, Heart, MessageCircle, Navigation } from "lucide-react"

const helpSections = [
  {
    title: "Emergency Contacts",
    icon: Phone,
    items: [
      { label: "Emergency Services", value: "911", action: "tel:911" },
      { label: "Festival Security", value: "(555) 123-4567", action: "tel:5551234567" },
      { label: "Medical Tent", value: "(555) 123-4568", action: "tel:5551234568" },
      { label: "Lost & Found", value: "(555) 123-4569", action: "tel:5551234569" },
    ],
  },
  {
    title: "Important Locations",
    icon: MapPin,
    items: [
      { label: "Information Tent", value: "Near Main Entrance" },
      { label: "First Aid Station", value: "Center of Festival Grounds" },
      { label: "Lost & Found", value: "Next to Information Tent" },
      { label: "ATM Machines", value: "Food Court & Main Entrance" },
    ],
  },
  {
    title: "Festival Hours",
    icon: Clock,
    items: [
      { label: "Gates Open", value: "12:00 PM" },
      { label: "First Performance", value: "1:00 PM" },
      { label: "Last Performance", value: "11:00 PM" },
      { label: "Gates Close", value: "12:30 AM" },
    ],
  },
]

const quickTips = [
  {
    icon: Wifi,
    title: "Free WiFi",
    description: "Connect to 'Festival-Guest' network throughout the grounds",
  },
  {
    icon: Car,
    title: "Parking",
    description: "Check the Map tab for real-time parking availability",
  },
  {
    icon: Utensils,
    title: "Food & Drinks",
    description: "Food trucks located in designated areas. No outside food allowed",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    description: "Security personnel are stationed throughout the festival",
  },
  {
    icon: Heart,
    title: "Medical",
    description: "First aid stations are clearly marked on the map",
  },
  {
    icon: Navigation,
    title: "Getting Around",
    description: "Use the Map tab to navigate and check crowd levels",
  },
]

export default function HelpPage() {
  return (
    <VisitorLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Help & Information</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Everything you need to know for a great festival experience
          </p>
        </div>

        {/* Quick Tips */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickTips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">{tip.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Help Sections */}
        <div className="px-4 pb-8">
          <div className="space-y-6">
            {helpSections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                          {item.action ? (
                            <Button
                              onClick={() => (window.location.href = item.action!)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              {item.value}
                            </Button>
                          ) : (
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div className="px-4 pb-8">
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Need More Help?</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Visit the Information Tent near the main entrance or use the SOS button for emergencies.
              </p>
              <Button
                onClick={() => (window.location.href = "tel:5551234567")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Festival Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </VisitorLayout>
  )
}
