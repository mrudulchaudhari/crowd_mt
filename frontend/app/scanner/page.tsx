import { DashboardLayout } from "@/components/dashboard-layout"
import { QRScanner } from "@/components/qr-scanner"

export default function ScannerPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">QR Code Scanner</h1>
          <p className="text-muted-foreground">Scan QR tokens to validate attendee check-ins and view user details</p>
        </div>
        <QRScanner />
      </div>
    </DashboardLayout>
  )
}
