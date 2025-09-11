"use client"

import { useState } from "react"
import { AlertTriangle, Plus, Clock, MapPin, Search, Eye, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalTrigger,
} from "@/src/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock alerts data
const alertsData = [
  {
    id: 1,
    title: "High Crowd Density Detected",
    type: "critical",
    location: "Main Plaza",
    time: "2 minutes ago",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    description: "Crowd density has exceeded safe limits in the main plaza area.",
    status: "active",
  },
  {
    id: 2,
    title: "Traffic Congestion Alert",
    type: "warning",
    location: "North Gate Entrance",
    time: "5 minutes ago",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    description: "Heavy traffic causing delays at the north entrance.",
    status: "investigating",
  },
  {
    id: 3,
    title: "Emergency Exit Blocked",
    type: "critical",
    location: "Building A - Level 2",
    time: "8 minutes ago",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    description: "Emergency exit pathway is obstructed by equipment.",
    status: "resolved",
  },
  {
    id: 4,
    title: "System Maintenance Notice",
    type: "info",
    location: "Server Room",
    time: "15 minutes ago",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    description: "Scheduled maintenance on monitoring systems.",
    status: "active",
  },
  {
    id: 5,
    title: "Overcrowding in Food Court",
    type: "warning",
    location: "Food Court Area",
    time: "22 minutes ago",
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
    description: "Food court area approaching capacity limits.",
    status: "monitoring",
  },
  {
    id: 6,
    title: "Security Checkpoint Delay",
    type: "warning",
    location: "Main Security Gate",
    time: "30 minutes ago",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    description: "Longer than usual wait times at security checkpoint.",
    status: "resolved",
  },
]

const typeColors = {
  critical: "bg-[#EF4444] text-white",
  warning: "bg-[#F59E0B] text-white",
  info: "bg-[#0B64FF] text-white",
}

const statusColors = {
  active: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
  resolved: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  monitoring: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  investigating: "bg-[#0B64FF]/10 text-[#0B64FF] border-[#0B64FF]/20",
}

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    title: "",
    type: "info",
    location: "",
    description: "",
  })

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || alert.type === filterType
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateAlert = () => {
    const alert = {
      id: alerts.length + 1,
      ...newAlert,
      time: "Just now",
      timestamp: new Date(),
      status: "active" as const,
    }

    setAlerts([alert, ...alerts])
    setNewAlert({ title: "", type: "info", location: "", description: "" })
    setIsModalOpen(false)
  }

  const handleDeleteAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Alert Management</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts and notifications</p>
        </div>

        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalTrigger asChild>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              New Alert
            </Button>
          </ModalTrigger>
          <ModalContent className="max-w-md">
            <ModalHeader>
              <ModalTitle>Create New Alert</ModalTitle>
              <ModalDescription>Add a new alert to the system for monitoring and tracking.</ModalDescription>
            </ModalHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Alert Title</Label>
                <Input
                  id="title"
                  placeholder="Enter alert title"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Alert Type</Label>
                <Select value={newAlert.type} onValueChange={(value) => setNewAlert({ ...newAlert, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={newAlert.location}
                  onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter alert description"
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateAlert}>
                Create Alert
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#EF4444]" />
            Active Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Alert</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Location</th>
                  <th className="text-left p-4 font-medium">Time</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[alert.type as keyof typeof typeColors]}`}
                      >
                        {alert.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {alert.location}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alert.time}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium border ${statusColors[alert.status as keyof typeof statusColors]}`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No alerts found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
