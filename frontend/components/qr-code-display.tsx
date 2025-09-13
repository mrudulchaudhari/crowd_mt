"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Download, RefreshCw, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeDisplayProps {
  eventId: string
}

// Mock event data
const eventData = {
  id: "1",
  name: "Ganesh Festival 2024",
  date: "2024-09-15",
  location: "Central Park, Mumbai",
  qrCode: "QR_EVENT_2024_GANESH_001",
  expiryTime: "2024-09-15T23:59:59Z",
  isActive: true,
}

export function QRCodeDisplay({ eventId }: QRCodeDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleDownload = () => {
    // In a real app, this would generate and download the QR code
    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been saved to your downloads folder.",
    })
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    // Simulate QR code regeneration
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsGenerating(false)
    toast({
      title: "QR Code Regenerated",
      description: "A new QR code has been generated for this event.",
    })
  }

  const isExpired = new Date() > new Date(eventData.expiryTime)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Event QR Code
            </CardTitle>
            <CardDescription>Scan this code for event check-in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/50">
              {/* QR Code placeholder - in real app would use a QR code library */}
              <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">QR Code</p>
                  <p className="text-xs text-muted-foreground font-mono">{eventData.qrCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isExpired ? "destructive" : eventData.isActive ? "default" : "secondary"}>
                  {isExpired ? "Expired" : eventData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
              <Button onClick={handleRegenerate} disabled={isGenerating} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Regenerate"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>Details for this QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-balance">{eventData.name}</h3>
              <p className="text-sm text-muted-foreground">{eventData.location}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Event Date: {eventData.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Expires: {new Date(eventData.expiryTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">Code: {eventData.qrCode}</span>
              </div>
            </div>

            {isExpired && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  This QR code has expired. Please regenerate a new code for continued use.
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Usage Instructions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Share this QR code with attendees for check-in</li>
                <li>• Attendees can scan the code at entry points</li>
                <li>• Code automatically expires after the event</li>
                <li>• Download and print for physical distribution</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
