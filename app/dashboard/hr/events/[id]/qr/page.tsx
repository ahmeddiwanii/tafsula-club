"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card"
import { Button } from "../../../../../../components/ui/button"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { UserRole } from "../../../../../../types/user"
import { DashboardLayout } from "../../../../../../components/layout/dashboard-layout"
import { ArrowLeft, Download, Printer, QrCode, Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  qrCodeUrl?: string
  qrCodeData?: string
}

export default function EventQRCodePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
      } else {
        router.push("/dashboard/hr/events")
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
      router.push("/dashboard/hr/events")
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    setGenerating(true)
    try {
      const response = await fetch(`/api/events/${eventId}/qr-code`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchEvent() // Refresh to get the new QR code
      } else {
        console.error("Failed to generate QR code")
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!event?.qrCodeUrl) return

    const link = document.createElement("a")
    link.href = event.qrCodeUrl
    link.download = `qr-code-${event.title.replace(/\s+/g, "-").toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <DashboardLayout role={UserRole.HR}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!event) {
    return (
      <DashboardLayout role={UserRole.HR}>
        <div className="text-center py-12">
          <p>Event not found</p>
          <Link href="/dashboard/hr/events">
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={UserRole.HR}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hr/events" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">QR Code for {event.title}</h1>
            <p className="text-muted-foreground">Print this QR code for event check-in</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Event Check-in QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {event.qrCodeUrl ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img
                    src={event.qrCodeUrl}
                    alt="Event QR Code"
                    className="w-64 h-64"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Event:</strong> {event.title}</p>
                  {event.qrCodeData && (
                    <p><strong>Code:</strong> {event.qrCodeData}</p>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Print QR Code
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                </div>

                <div className="text-xs text-gray-500 max-w-md mx-auto space-y-2">
                  <p>
                    Print this QR code and place it at the event entrance.
                    Members scan it with their phone camera — they get checked in with the exact time and earn points.
                  </p>
                  <p>
                    Tip: if this code was created before deep-link check-in, click Generate again after deleting the old one, or regenerate from the button below if available.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No QR Code Generated</h3>
                  <p className="text-gray-600">
                    Generate a QR code for attendees to scan during check-in.
                  </p>
                </div>
                <Button onClick={generateQRCode} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </div>
            )}
            {event.qrCodeUrl && (
              <div className="pt-2 text-center">
                <Button onClick={generateQRCode} disabled={generating} variant="outline">
                  {generating ? "Updating…" : "Refresh QR (phone check-in link)"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}