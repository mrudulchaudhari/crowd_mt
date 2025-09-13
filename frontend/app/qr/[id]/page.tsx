import { DashboardLayout } from "@/components/dashboard-layout"
import { QRCodeDisplay } from "@/components/qr-code-display"

interface QRPageProps {
  params: {
    id: string
  }
}

export default function QRPage({ params }: QRPageProps) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Event QR Code</h1>
          <p className="text-muted-foreground">QR code for event check-in and access</p>
        </div>
        <QRCodeDisplay eventId={params.id} />
      </div>
    </DashboardLayout>
  )
}
