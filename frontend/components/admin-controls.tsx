"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, AlertTriangle, Users, Calendar, MapPin, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock event data - in real app this would come from API
const initialEventData = {
  id: 1,
  name: "Ganesh Festival 2024",
  description: "Annual Ganesh Chaturthi celebration at Central Park",
  location: "Central Park, Mumbai",
  date: "2024-09-15",
  startTime: "08:00",
  endTime: "22:00",
  capacity: 12000,
  yellowThreshold: 8000,
  redThreshold: 10000,
  currentHeadcount: 8500,
  status: "active",
  emergencyContact: "+91-9876543210",
  organizer: "Mumbai Cultural Society",
}

interface EventSettings {
  name: string
  description: string
  location: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  yellowThreshold: number
  redThreshold: number
  emergencyContact: string
  organizer: string
  status: string
}

export function AdminControls() {
  const [eventSettings, setEventSettings] = useState<EventSettings>(initialEventData)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (field: keyof EventSettings, value: string | number) => {
    setEventSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Validate thresholds
    if (eventSettings.yellowThreshold >= eventSettings.redThreshold) {
      toast({
        title: "Validation Error",
        description: "Yellow threshold must be less than red threshold.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (eventSettings.redThreshold > eventSettings.capacity) {
      toast({
        title: "Validation Error",
        description: "Red threshold cannot exceed total capacity.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Settings Updated",
      description: "Event settings have been successfully updated.",
    })

    setHasChanges(false)
    setIsLoading(false)
  }

  const handleReset = () => {
    setEventSettings(initialEventData)
    setHasChanges(false)
    toast({
      title: "Settings Reset",
      description: "All changes have been reverted to original values.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "ended":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Event Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{initialEventData.currentHeadcount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Current Attendance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{eventSettings.capacity.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{eventSettings.yellowThreshold.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Yellow Threshold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{eventSettings.redThreshold.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Red Threshold</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Information
            </CardTitle>
            <CardDescription>Basic event details and scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={eventSettings.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventSettings.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 mt-3 text-muted-foreground" />
                <Input
                  id="location"
                  value={eventSettings.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventSettings.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={eventSettings.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={eventSettings.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Event Status</Label>
              <Select value={eventSettings.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Capacity & Safety Thresholds
            </CardTitle>
            <CardDescription>Configure crowd density limits and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Total Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={eventSettings.capacity}
                onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">Maximum number of attendees allowed</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="yellow-threshold">Yellow Threshold (Caution)</Label>
              <Input
                id="yellow-threshold"
                type="number"
                value={eventSettings.yellowThreshold}
                onChange={(e) => handleInputChange("yellowThreshold", Number.parseInt(e.target.value) || 0)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">Attendance level that triggers caution alerts</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="red-threshold">Red Threshold (Critical)</Label>
              <Input
                id="red-threshold"
                type="number"
                value={eventSettings.redThreshold}
                onChange={(e) => handleInputChange("redThreshold", Number.parseInt(e.target.value) || 0)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">Attendance level that triggers critical alerts</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Threshold Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Safe: 0 - {eventSettings.yellowThreshold.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>
                    Caution: {eventSettings.yellowThreshold.toLocaleString()} -{" "}
                    {eventSettings.redThreshold.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Critical: {eventSettings.redThreshold.toLocaleString()}+</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input
                id="organizer"
                value={eventSettings.organizer}
                onChange={(e) => handleInputChange("organizer", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-contact">Emergency Contact</Label>
              <Input
                id="emergency-contact"
                value={eventSettings.emergencyContact}
                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                placeholder="+91-XXXXXXXXXX"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(eventSettings.status)} className="capitalize">
                {eventSettings.status}
              </Badge>
              {hasChanges && (
                <Badge variant="outline" className="text-yellow-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={!hasChanges || isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
