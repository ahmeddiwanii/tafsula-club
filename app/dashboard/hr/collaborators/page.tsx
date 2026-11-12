'use client'

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { HRLayout } from "../../../../components/layout/hr-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"

interface CollaborationCode {
  id: string
  code: string
  organizationId: string
}

interface CollaborationRequest {
  id: string
  requesterOrganizationId: string
  targetOrganizationId: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED"
  message?: string
  responseMessage?: string
  createdAt: string
  respondedAt?: string
  requesterOrganization?: {
    name: string
  }
  targetOrganization?: {
    name: string
  }
}

interface CollaborationData {
  collaborationCode?: CollaborationCode
  sentRequests: CollaborationRequest[]
  receivedRequests: CollaborationRequest[]
}

export default function CollaboratorsPage() {
  const { data: session } = useSession()
  const [collaborationData, setCollaborationData] = useState<CollaborationData>({
    sentRequests: [],
    receivedRequests: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [targetCode, setTargetCode] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [responding, setResponding] = useState<string | null>(null)
  const [responseMessage, setResponseMessage] = useState("")

  useEffect(() => {
    if (session?.user?.email) {
      fetchCollaborationData()
    }
  }, [session])

  const fetchCollaborationData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/collaborations")
      const data = await response.json()
      setCollaborationData(data)
      setError("")
    } catch (err: any) {
      setError("Failed to load collaboration data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetCode.trim()) {
      setError("Please enter a collaboration code")
      return
    }

    try {
      setSending(true)
      const response = await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCode: targetCode.trim(),
          message,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to send collaboration request")
      }

      setTargetCode("")
      setMessage("")
      fetchCollaborationData()
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, action: "ACCEPTED" | "REJECTED") => {
    try {
      setResponding(requestId)
      const response = await fetch("/api/collaborations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          responseMessage,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to respond to request")
      }

      setResponseMessage("")
      fetchCollaborationData()
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResponding(null)
    }
  }

  const copyToClipboard = async () => {
    if (collaborationData.collaborationCode?.code) {
      await navigator.clipboard.writeText(collaborationData.collaborationCode.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-300"
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300"
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4" />
      case "REJECTED":
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />
      case "PENDING":
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <HRLayout orgName={session?.user?.name || "Organization"}>
        <div className="text-center py-16">
          <p className="text-lg text-gray-600 font-medium">Loading collaboration data...</p>
        </div>
      </HRLayout>
    )
  }

  return (
    <HRLayout orgName={session?.user?.name || "Organization"}>
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">
          🔗 Organization Collaborations
        </h1>
        <p className="text-lg text-gray-600">
          Connect with other organizations and collaborate on events
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-xl border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border-2 border-cyan-100 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            1
          </span>
          <h2 className="text-3xl font-black text-gray-900">Your Organization Code</h2>
        </div>

        <p className="text-gray-700 mb-6 text-base font-medium">
          Share this unique code with other organizations to receive collaboration requests
        </p>

        {collaborationData.collaborationCode ? (
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <div className="flex-1 bg-white p-6 rounded-xl border-3 border-cyan-300 shadow-md">
              <p className="text-gray-600 text-sm font-bold mb-2">CODE</p>
              <p className="text-4xl font-black text-cyan-600 font-mono tracking-wider">
                {collaborationData.collaborationCode.code}
              </p>
            </div>
            <Button
              onClick={copyToClipboard}
              className="h-16 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-base rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border-2 border-cyan-200 text-center">
            <p className="text-gray-600 font-medium">Your collaboration code is being generated...</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-100 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            2
          </span>
          <h2 className="text-3xl font-black text-gray-900">Send Collaboration Request</h2>
        </div>

        <form onSubmit={handleSendRequest} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="targetCode" className="font-bold text-gray-800 text-base">
              Target Organization Code
            </Label>
            <Input
              id="targetCode"
              placeholder="e.g., ORG-ABC123"
              value={targetCode}
              onChange={(e) => setTargetCode(e.target.value)}
              className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium text-base transition-all"
            />
            <p className="text-sm text-gray-600">Enter the organization's code to send them a collaboration request</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-bold text-gray-800 text-base">
              Message <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <textarea
              id="message"
              placeholder="Tell them about your collaboration goals..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-medium text-base transition-all resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={sending || !targetCode.trim()}
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white font-bold text-base rounded-xl shadow-lg transition-all"
          >
            {sending ? "✉️ Sending..." : "✉️ Send Request"}
          </Button>
        </form>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            3
          </span>
          <h2 className="text-3xl font-black text-gray-900">Requests I've Sent</h2>
        </div>

        {collaborationData.sentRequests.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border-2 border-gray-200 text-center">
            <p className="text-gray-600 font-medium text-lg">No collaboration requests sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborationData.sentRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {request.targetOrganization?.name || "Unknown Organization"}
                      </h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-bold ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    {request.message && (
                      <p className="text-gray-600 text-sm mb-2">💬 {request.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Sent: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.responseMessage && (
                      <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-100 rounded-lg">
                        <span className="font-bold">Their response:</span> {request.responseMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border-2 border-amber-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            4
          </span>
          <h2 className="text-3xl font-black text-gray-900">Collaboration Requests Received</h2>
        </div>

        {collaborationData.receivedRequests.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border-2 border-amber-200 text-center">
            <p className="text-gray-600 font-medium text-lg">No collaboration requests received yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborationData.receivedRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white p-6 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {request.requesterOrganization?.name || "Unknown Organization"}
                      </h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm font-bold ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    {request.message && (
                      <p className="text-gray-600 text-sm mb-2">💬 {request.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Received: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.status === "PENDING" && (
                  <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                    <div className="space-y-2">
                      <Label htmlFor={`response-${request.id}`} className="text-sm font-bold text-gray-700">
                        Your Response Message (Optional)
                      </Label>
                      <textarea
                        id={`response-${request.id}`}
                        placeholder="Add a message to your response..."
                        value={responding === request.id ? responseMessage : ""}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        rows={2}
                        disabled={responding !== null && responding !== request.id}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium text-sm transition-all disabled:opacity-50 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setResponding(request.id)
                          handleRespondToRequest(request.id, "ACCEPTED")
                        }}
                        disabled={responding !== null}
                        className="flex-1 h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
                      >
                        ✅ Accept
                      </Button>
                      <Button
                        onClick={() => {
                          setResponding(request.id)
                          handleRespondToRequest(request.id, "REJECTED")
                        }}
                        disabled={responding !== null}
                        className="flex-1 h-10 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  </div>
                )}

                {request.status !== "PENDING" && request.responseMessage && (
                  <div className="p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500 mt-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-bold">Your response:</span> {request.responseMessage}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </HRLayout>
  )
}
