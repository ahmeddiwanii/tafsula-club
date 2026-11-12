"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  Trash2,
  Mail,
  Loader2,
} from "lucide-react"

interface Registration {
  id: string
  userId: string
  eventId: string
  status: string
  appliedAt: string
  approvedAt?: string
  user: {
    id: string
    name: string
    email: string
    profile?: {
      headline?: string
    }
  }
}

interface EventRegistrationsProps {
  eventId: string
  eventTitle: string
  eventStartAt: string
}

export function HREventRegistrations({ eventId, eventTitle, eventStartAt }: EventRegistrationsProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [eventId])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations || [])
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (registrationId: string) => {
    setProcessingId(registrationId)
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (response.ok) {
        await fetchRegistrations()
      }
    } catch (error) {
      console.error("Failed to approve registration:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (registrationId: string) => {
    setProcessingId(registrationId)
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      })
      if (response.ok) {
        await fetchRegistrations()
      }
    } catch (error) {
      console.error("Failed to reject registration:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleRemove = async (registrationId: string) => {
    setProcessingId(registrationId)
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${registrationId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchRegistrations()
      }
    } catch (error) {
      console.error("Failed to remove registration:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Headline", "Status", "Applied At", "Approved At"]
    const rows = registrations.map(reg => [
      reg.user.name,
      reg.user.email,
      reg.user.profile?.headline || "N/A",
      reg.status,
      new Date(reg.appliedAt).toLocaleDateString(),
      reg.approvedAt ? new Date(reg.approvedAt).toLocaleDateString() : "N/A",
    ])

    let csv = [headers, ...rows].map(row =>
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${eventTitle}-registrations.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const approvedCount = registrations.filter(r => r.status === "APPROVED").length
  const pendingCount = registrations.filter(r => r.status === "REGISTERED").length
  const rejectedCount = registrations.filter(r => r.status === "REJECTED").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "REGISTERED":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "REGISTERED":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Event Registrations
              </CardTitle>
              <CardDescription>{eventTitle}</CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
              <p className="text-xs text-gray-500 mt-1">Confirmed attendees</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-gray-500 mt-1">Declined registrations</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registration List</CardTitle>
          <CardDescription>
            Total: {registrations.length} registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No registrations yet</p>
              <p className="text-sm text-gray-400">Registrations will appear here once users sign up</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Headline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <motion.tr
                      key={registration.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium">{registration.user.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{registration.user.email}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {registration.user.profile?.headline || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(registration.status)}
                          {getStatusBadge(registration.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(registration.appliedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {registration.status === "REGISTERED" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(registration.id)}
                                disabled={processingId === registration.id}
                              >
                                {processingId === registration.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleReject(registration.id)}
                                disabled={processingId === registration.id}
                              >
                                {processingId === registration.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                          {registration.status !== "REGISTERED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              onClick={() => handleRemove(registration.id)}
                              disabled={processingId === registration.id}
                            >
                              {processingId === registration.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
