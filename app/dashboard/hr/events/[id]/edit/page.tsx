"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  useEffect(() => {
    // Redirect to the new unified event creation/edit page
    router.push(`/dashboard/hr/events/new?editId=${eventId}`)
  }, [eventId, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading event...</p>
      </div>
    </div>
  )
}
