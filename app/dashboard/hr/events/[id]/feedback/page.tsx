"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card"
import { Button } from "../../../../../../components/ui/button"
import { Badge } from "../../../../../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../../../../../components/ui/avatar"
import { UserRole } from "../../../../../../types/user"
import { DashboardLayout } from "../../../../../../components/layout/dashboard-layout"
import { ArrowLeft, Loader2, Star, MessageCircle } from "lucide-react"

interface Feedback {
  id: string
  userId: string
  userName: string
  userEmail: string
  rating: number
  comment: string
  createdAt: string
}

export default function EventFeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [eventTitle, setEventTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFeedback: 0,
    avgRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  useEffect(() => {
    fetchEventAndFeedback()
  }, [eventId])

  const fetchEventAndFeedback = async () => {
    try {
      const [eventRes, feedbackRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/feedback`)
      ])

      if (eventRes.ok) {
        const eventData = await eventRes.json()
        setEventTitle(eventData.title)
      }

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json()
        setFeedbacks(Array.isArray(feedbackData) ? feedbackData : feedbackData.feedbacks || [])
        
        // Calculate stats
        if (feedbackData.length > 0 || (feedbackData.feedbacks && feedbackData.feedbacks.length > 0)) {
          const feedbackList = Array.isArray(feedbackData) ? feedbackData : feedbackData.feedbacks || []
          const avgRating = feedbackList.length > 0
            ? (feedbackList.reduce((sum: number, f: Feedback) => sum + (f.rating || 0), 0) / feedbackList.length).toFixed(1)
            : 0
          
          setStats({
            totalFeedback: feedbackList.length,
            avgRating: parseFloat(String(avgRating)),
            ratingDistribution: feedbackList.reduce((acc: any, f: Feedback) => {
              acc[f.rating] = (acc[f.rating] || 0) + 1
              return acc
            }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
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

  return (
    <DashboardLayout role={UserRole.HR}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hr/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Event Feedback</h1>
            <p className="text-muted-foreground">{eventTitle}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalFeedback}</div>
                <div className="text-sm text-gray-600">Total Feedback</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.avgRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </CardContent>
          </Card>

          {[5, 4, 3].map(rating => (
            <Card key={rating}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}</div>
                  <div className="text-sm text-gray-600">{rating} Star{rating !== 1 ? 's' : ''}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Details</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {feedback.userName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{feedback.userName || "Anonymous"}</div>
                          <div className="text-sm text-gray-600">{feedback.userEmail}</div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {renderStars(feedback.rating || 0)}
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {feedback.comment && (
                      <div className="pl-12 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <p className="break-words">{feedback.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No feedback yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
