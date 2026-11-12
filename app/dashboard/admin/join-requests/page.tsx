"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Building2, Mail, Phone, Globe, Check, X, Clock, ExternalLink, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useSession } from "next-auth/react"
import { UserRole } from "@/types/user"

interface JoinRequest {
  id: string
  orgName: string
  orgType: string | null
  contactName: string
  contactEmail: string
  contactPhone: string | null
  description: string
  websiteUrl: string | null
  status: string
  createdAt: string
}

export default function JoinRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/join-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      toast.error("Failed to fetch requests")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/join-requests/${id}/approve`, { method: "POST" })
      if (response.ok) {
        toast.success("Request approved. Organization and HR user created.")
        fetchRequests()
      } else {
        toast.error("Failed to approve request")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/join-requests/${id}/reject`, { method: "POST" })
      if (response.ok) {
        toast.success("Request rejected")
        fetchRequests()
      } else {
        toast.error("Failed to reject request")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const pendingRequests = requests.filter(r => r.status === "PENDING")
  const processedRequests = requests.filter(r => r.status !== "PENDING")

  const userRole = (session?.user?.role || "SUPERADMIN") as UserRole

  if (isLoading) {
    return (
      <AdminLayout role={userRole}>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout role={userRole}>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Organization Requests
          </h1>
          <p className="text-white/60">Review and manage incoming applications from clubs and organizations.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <span className="text-blue-400 font-medium">{pendingRequests.length} Pending</span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white/90">Pending Review</h2>
        {pendingRequests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No pending requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingRequests.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-[#0f0f18] p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{request.orgName}</h3>
                        {request.orgType && (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60 text-xs border border-white/10">
                            {request.orgType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>Submitted {formatDistanceToNow(new Date(request.createdAt))} ago</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <User className="w-4 h-4 text-white/40" />
                          <span>{request.contactName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Mail className="w-4 h-4 text-white/40" />
                          <a href={`mailto:${request.contactEmail}`} className="hover:text-blue-400 transition">{request.contactEmail}</a>
                        </div>
                        {request.contactPhone && (
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Phone className="w-4 h-4 text-white/40" />
                            <span>{request.contactPhone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {request.websiteUrl && (
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Globe className="w-4 h-4 text-white/40" />
                            <a href={request.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition">
                              {request.websiteUrl} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 mt-4">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{request.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                    <Button onClick={() => handleApprove(request.id)} className="flex-1 lg:w-32 bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button onClick={() => handleReject(request.id)} variant="outline" className="flex-1 lg:w-32 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2">
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {processedRequests.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white/90 mb-6">Recently Processed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedRequests.map(request => (
                <div key={request.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                  <div>
                    <h4 className="font-medium text-white mb-1">{request.orgName}</h4>
                    <p className="text-xs text-white/50 mb-3">{request.contactName} • {request.contactEmail}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-xs px-2 py-1 rounded-md ${request.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {request.status}
                    </span>
                    <span className="text-xs text-white/30">{formatDistanceToNow(new Date(request.createdAt))} ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
