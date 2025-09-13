"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Bell, CheckCircle, Clock, Filter, Plus, Search, Users, MapPin, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock alerts data
const mockAlerts = [
  {
    id: "ALT001",
    title: "Critical Crowd Density - Prayer Area",
    description:
      "Zone C1 (Prayer Area) has exceeded 90% capacity with 2,300 attendees. Immediate crowd control required.",
    severity: "critical",
    type: "crowd_density",
    zone: "C1",
    status: "active",
    createdAt: "2024-09-15T14:30:00Z",
    resolvedAt: null,
    assignedTo: "Security Team Alpha",
    priority: 1,
  },
  {
    id: "ALT002",
    title: "High Density Alert - Main Stage",
    description: "Zone A1 (Main Stage) approaching capacity limits at 85%. Monitor closely for potential overflow.",
    severity: "high",
    type: "crowd_density",
    zone: "A1",
    status: "active",
    createdAt: "2024-09-15T13:45:00Z",
    resolvedAt: null,
    assignedTo: "Security Team Beta",
    priority: 2,
  },
  {
    id: "ALT003",
    title: "System Maintenance Alert",
    description: "Scheduled maintenance for crowd monitoring sensors in Zone B1 completed successfully.",
    severity: "info",
    type: "system",
    zone: "B1",
    status: "resolved",
    createdAt: "2024-09-15T12:00:00Z",
    resolvedAt: "2024-09-15T12:30:00Z",
    assignedTo: "Technical Team",
    priority: 3,
  },
  {
    id: "ALT004",
    title: "Weather Advisory",
    description: "Light rain expected between 4-6 PM. Prepare covered areas and monitor outdoor zones.",
    severity: "medium",
    type: "weather",
    zone: "All",
    status: "active",
    createdAt: "2024-09-15T11:15:00Z",
    resolvedAt: null,
    assignedTo: "Operations Team",
    priority: 2,
  },
  {
    id: "ALT005",
    title: "Emergency Exit Blocked",
    description: "Emergency exit near Food Court partially blocked by vendor equipment. Immediate clearance required.",
    severity: "high",
    type: "safety",
    zone: "A2",
    status: "resolved",
    createdAt: "2024-09-15T10:20:00Z",
    resolvedAt: "2024-09-15T10:45:00Z",
    assignedTo: "Safety Team",
    priority: 1,
  },
]

interface Alert {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  type: string
  zone: string
  status: "active" | "resolved" | "acknowledged"
  createdAt: string
  resolvedAt: string | null
  assignedTo: string
  priority: number
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "destructive"
    case "high":
      return "secondary"
    case "medium":
      return "outline"
    case "low":
      return "outline"
    case "info":
      return "default"
    default:
      return "outline"
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return AlertTriangle
    case "high":
      return AlertCircle
    case "medium":
      return Bell
    case "low":
      return Bell
    case "info":
      return CheckCircle
    default:
      return Bell
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "destructive"
    case "acknowledged":
      return "secondary"
    case "resolved":
      return "default"
    default:
      return "outline"
  }
}

export function AlertsManagement() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    severity: "medium",
    type: "general",
    zone: "",
    assignedTo: "",
  })
  const { toast } = useToast()

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus
    const matchesType = filterType === "all" || alert.type === filterType
    const matchesSearch =
      searchQuery === "" ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.zone.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSeverity && matchesStatus && matchesType && matchesSearch
  })

  const activeAlerts = alerts.filter((alert) => alert.status === "active")
  const criticalAlerts = alerts.filter((alert) => alert.severity === "critical" && alert.status === "active")
  const resolvedToday = alerts.filter(
    (alert) => alert.status === "resolved" && new Date(alert.createdAt).toDateString() === new Date().toDateString(),
  )

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "resolved" as const,
              resolvedAt: new Date().toISOString(),
            }
          : alert,
      ),
    )
    toast({
      title: "Alert Resolved",
      description: "The alert has been marked as resolved.",
    })
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, status: "acknowledged" as const } : alert)),
    )
    toast({
      title: "Alert Acknowledged",
      description: "The alert has been acknowledged.",
    })
  }

  const handleCreateAlert = () => {
    if (!newAlert.title || !newAlert.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const alert: Alert = {
      id: `ALT${String(alerts.length + 1).padStart(3, "0")}`,
      title: newAlert.title,
      description: newAlert.description,
      severity: newAlert.severity as Alert["severity"],
      type: newAlert.type,
      zone: newAlert.zone || "General",
      status: "active",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      assignedTo: newAlert.assignedTo || "Unassigned",
      priority: newAlert.severity === "critical" ? 1 : newAlert.severity === "high" ? 2 : 3,
    }

    setAlerts((prev) => [alert, ...prev])
    setNewAlert({
      title: "",
      description: "",
      severity: "medium",
      type: "general",
      zone: "",
      assignedTo: "",
    })
    setIsCreateDialogOpen(false)

    toast({
      title: "Alert Created",
      description: "New alert has been created successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedToday.length}</div>
            <p className="text-xs text-muted-foreground">Issues resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Actions
              </CardTitle>
              <CardDescription>Filter alerts and manage notifications</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                  <DialogDescription>Add a new alert to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-title">Title *</Label>
                    <Input
                      id="alert-title"
                      value={newAlert.title}
                      onChange={(e) => setNewAlert((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Alert title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-description">Description *</Label>
                    <Textarea
                      id="alert-description"
                      value={newAlert.description}
                      onChange={(e) => setNewAlert((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the alert"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-severity">Severity</Label>
                      <Select
                        value={newAlert.severity}
                        onValueChange={(value) => setNewAlert((prev) => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-type">Type</Label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value) => setNewAlert((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crowd_density">Crowd Density</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="weather">Weather</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-zone">Zone</Label>
                      <Input
                        id="alert-zone"
                        value={newAlert.zone}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, zone: e.target.value }))}
                        placeholder="e.g., A1, B2, All"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-assigned">Assigned To</Label>
                      <Input
                        id="alert-assigned"
                        value={newAlert.assignedTo}
                        onChange={(e) => setNewAlert((prev) => ({ ...prev, assignedTo: e.target.value }))}
                        placeholder="Team or person"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAlert}>Create Alert</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="crowd_density">Crowd Density</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts ({filteredAlerts.length})</CardTitle>
          <CardDescription>Manage and monitor all system alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts match your current filters</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity)
                return (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <SeverityIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-balance">{alert.title}</h3>
                            <Badge variant={getSeverityColor(alert.severity)} className="capitalize">
                              {alert.severity}
                            </Badge>
                            <Badge variant={getStatusColor(alert.status)} className="capitalize">
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground text-pretty">{alert.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === "active" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                              Acknowledge
                            </Button>
                            <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Zone: {alert.zone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Assigned: {alert.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">ID: {alert.id}</span>
                        {alert.resolvedAt && (
                          <span className="text-xs text-green-600">
                            Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
