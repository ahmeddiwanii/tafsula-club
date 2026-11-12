"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { UserNav } from "../../components/user-nav"
import { QrCode, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function QRScannerPage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setResult({ success: false, message: "Please enter a QR code" })
      return
    }

    setScanning(true)
    setResult(null)

    try {
      // Find an upcoming event to scan for (in a real app, this would be determined by context)
      // For now, we'll try to scan for any event
      const response = await fetch("/api/events/upcoming?limit=1")
      const data = await response.json()

      if (!data.events || data.events.length === 0) {
        setResult({ success: false, message: "No upcoming events found" })
        return
      }

      const eventId = data.events[0].id

      const scanResponse = await fetch(`/api/events/${eventId}/qr-code/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qrCode: qrCode.trim() }),
      })

      const scanResult = await scanResponse.json()

      if (scanResponse.ok) {
        setResult({ success: true, message: scanResult.message })
      } else {
        setResult({ success: false, message: scanResult.error || "Scan failed" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Please try again." })
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <UserNav />
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Scan QR Code</CardTitle>
            <p className="text-sm text-gray-600">
              Enter the QR code from the event to mark your attendance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-code">QR Code</Label>
              <Input
                id="qr-code"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Enter QR code..."
                className="text-center text-lg tracking-wider"
              />
            </div>

            <Button
              onClick={handleScan}
              disabled={scanning || !qrCode.trim()}
              className="w-full"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </>
              )}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {result.success ? "Success!" : "Error"}
                  </span>
                </div>
                <p className="text-sm mt-1">{result.message}</p>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              <p>Make sure you're registered for the event before scanning.</p>
              <p className="mt-1">Contact event organizers if you have issues.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}