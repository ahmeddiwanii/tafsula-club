"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card"
import { Button } from "../../../../../../components/ui/button"
import { Badge } from "../../../../../../components/ui/badge"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { UserRole } from "../../../../../../types/user"
import { DashboardLayout } from "../../../../../../components/layout/dashboard-layout"
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, Loader2 } from "lucide-react"

interface Attendee {
  userId: string
  name: string
  email: string
  registrationId: string
  registeredAt: string
  status: string
  checkInTime?: string
}

interface AttendanceData {
  attended: Attendee[]
  notAttended: Attendee[]
  summary: {
    totalRegistered: number
    totalAttended: number
    noShowRate: string
  }
}

export default function EventAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  useEffect(() => {
    fetchAttendance()
  }, [eventId])

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendance`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceData(data)
      } else {
        router.push("/dashboard/hr/events")
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
      router.push("/dashboard/hr/events")
    } finally {
      setLoading(false)
    }
  }

  const markAttendance = async (userId: string, status: string) => {
    setMarking(userId)
    try {
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, status }),
      })

      if (response.ok) {
        await fetchAttendance() // Refresh data
      } else {
        console.error("Failed to mark attendance")
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
    } finally {
      setMarking(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ATTENDED":
        return <Badge className="bg-green-100 text-green-800">Attended</Badge>
      case "NOT_ATTENDED":
        return <Badge variant="secondary">Not Attended</Badge>
      case "PARTIAL":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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

  if (!attendanceData) {
    return (
      <DashboardLayout role={UserRole.HR}>
        <div className="text-center py-12">
          <p>Failed to load attendance data</p>
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
            <h1 className="text-2xl font-bold">Event Attendance</h1>
            <p className="text-muted-foreground">Manage attendance for this event</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{attendanceData.summary.totalRegistered}</div>
              <p className="text-sm text-gray-600">Total Registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{attendanceData.summary.totalAttended}</div>
              <p className="text-sm text-gray-600">Attended</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{attendanceData.summary.noShowRate}%</div>
              <p className="text-sm text-gray-600">No Show Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Attended List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Attended ({attendanceData.attended.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.attended.length > 0 ? (
              <div className="space-y-4">
                {attendanceData.attended.map((attendee) => (
                  <div key={attendee.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-sm text-gray-600">{attendee.email}</p>
                      {attendee.checkInTime && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Checked in: {new Date(attendee.checkInTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(attendee.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No attendees yet</p>
            )}
          </CardContent>
        </Card>

        {/* Not Attended List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Not Attended ({attendanceData.notAttended.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.notAttended.length > 0 ? (
              <div className="space-y-4">
                {attendanceData.notAttended.map((attendee) => (
                  <div key={attendee.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-sm text-gray-600">{attendee.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(attendee.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(attendee.status)}
                      <Button
                        size="sm"
                        onClick={() => markAttendance(attendee.userId, "ATTENDED")}
                        disabled={marking === attendee.userId}
                      >
                        {marking === attendee.userId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">All registered participants have attended</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}