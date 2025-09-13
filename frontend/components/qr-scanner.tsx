"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QrCode, Scan, User, Clock, CheckCircle, XCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock user data - in real app this would come from API
const mockUsers = {
  QR123456: {
    id: "QR123456",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-0123",
    checkedIn: true,
    checkInTime: "2024-09-15T10:30:00Z",
    ticketType: "VIP",
  },
  QR789012: {
    id: "QR789012",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-0456",
    checkedIn: false,
    checkInTime: null,
    ticketType: "General",
  },
  QR345678: {
    id: "QR345678",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    phone: "+1-555-0789",
    checkedIn: true,
    checkInTime: "2024-09-15T09:15:00Z",
    ticketType: "Student",
  },
}

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  checkedIn: boolean
  checkInTime: string | null
  ticketType: string
}

export function QRScanner() {
  const [scanInput, setScanInput] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const { toast } = useToast()

  const handleScan = async (token: string) => {
    setIsScanning(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userData = mockUsers[token as keyof typeof mockUsers]

    if (userData) {
      setSelectedUser(userData)
      setShowUserModal(true)
      toast({
        title: "QR Code Scanned Successfully",
        description: `Found user: ${userData.name}`,
      })
    } else {
      toast({
        title: "Invalid QR Code",
        description: "This QR code is not recognized in our system.",
        variant: "destructive",
      })
    }

    setIsScanning(false)
    setScanInput("")
  }

  const handleManualScan = () => {
    if (scanInput.trim()) {
      handleScan(scanInput.trim())
    }
  }

  const handleCheckIn = async (userId: string) => {
    // Simulate check-in API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedUser) {
      const updatedUser = {
        ...selectedUser,
        checkedIn: true,
        checkInTime: new Date().toISOString(),
      }
      setSelectedUser(updatedUser)

      toast({
        title: "Check-in Successful",
        description: `${selectedUser.name} has been checked in.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanner Interface */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>Scan QR codes using your device camera or enter manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/50">
              <Scan className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Camera scanning would be implemented here using a QR code library
              </p>
              <Button className="mt-4" disabled>
                <Scan className="h-4 w-4 mr-2" />
                Start Camera Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Manual Entry
            </CardTitle>
            <CardDescription>Enter QR code token manually for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-input">QR Code Token</Label>
              <Input
                id="qr-input"
                placeholder="Enter QR code (e.g., QR123456)"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
              />
            </div>
            <Button onClick={handleManualScan} disabled={!scanInput.trim() || isScanning} className="w-full">
              {isScanning ? "Scanning..." : "Scan Token"}
            </Button>

            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Test Tokens:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(mockUsers).map((token) => (
                  <Button
                    key={token}
                    variant="outline"
                    size="sm"
                    onClick={() => handleScan(token)}
                    disabled={isScanning}
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Latest QR code scan results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(mockUsers)
              .slice(0, 3)
              .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.ticketType === "VIP" ? "default" : "secondary"}>{user.ticketType}</Badge>
                    <div className="flex items-center gap-1">
                      {user.checkedIn ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{user.checkedIn ? "Checked In" : "Not Checked In"}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>QR code scan result and check-in status</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ticket Type</Label>
                  <Badge variant={selectedUser.ticketType === "VIP" ? "default" : "secondary"}>
                    {selectedUser.ticketType}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{selectedUser.email}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm">{selectedUser.phone}</p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  {selectedUser.checkedIn ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{selectedUser.checkedIn ? "Checked In" : "Not Checked In"}</span>
                </div>
                {!selectedUser.checkedIn && (
                  <Button onClick={() => handleCheckIn(selectedUser.id)} size="sm">
                    Check In Now
                  </Button>
                )}
              </div>

              {selectedUser.checkedIn && selectedUser.checkInTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Checked in at {new Date(selectedUser.checkInTime).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
